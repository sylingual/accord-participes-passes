import { useEffect, useMemo, useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
import { exercises } from './exercises'
import { emailConfig, isEmailConfigured } from './emailConfig'

const TOTAL = exercises.length
const PAGE_SIZE = 5
const PAGES = Math.ceil(TOTAL / PAGE_SIZE)
const PASS_THRESHOLD = 75 // % de réussite en dessous duquel on encourage

// Normalise une réponse pour une comparaison SOUPLE :
// minuscules, accents ignorés, ponctuation et espaces superflus retirés.
function normalize(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // enlève les accents
    .replace(/[.,;:!?«»"'’()[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function isCorrect(input, answers) {
  const n = normalize(input)
  return answers.some((a) => normalize(a) === n)
}

// Rend un texte où **mot** devient <strong>mot</strong>.
function RichText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**') ? (
          <strong key={i}>{p.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  )
}

export default function App() {
  const [phase, setPhase] = useState('welcome') // welcome | exercise | done
  const [name, setName] = useState('')
  const [page, setPage] = useState(0)
  const [inputs, setInputs] = useState({}) // { [id]: string }
  const [pageChecked, setPageChecked] = useState(false)
  const [history, setHistory] = useState([]) // { id, section, verb, prompt, given, expected, correct }
  const [outcome, setOutcome] = useState('') // finished | stopped
  const [sendState, setSendState] = useState('idle')

  const pageExercises = useMemo(
    () => exercises.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [page]
  )
  const isLastPage = page === PAGES - 1
  const correctCount = history.filter((h) => h.correct).length
  const allFilled = pageExercises.every((ex) => (inputs[ex.id] || '').trim())

  function startSession(e) {
    e.preventDefault()
    if (!name.trim()) return
    setPhase('exercise')
  }

  function setInput(id, value) {
    setInputs((prev) => ({ ...prev, [id]: value }))
  }

  function validatePage() {
    if (pageChecked || !allFilled) return
    const rows = pageExercises.map((ex) => {
      const given = (inputs[ex.id] || '').trim()
      return {
        id: ex.id,
        section: ex.section,
        verb: ex.verb,
        prompt: `${ex.before}____${ex.after}`.trim(),
        given,
        expected: ex.answers[0],
        correct: isCorrect(given, ex.answers),
      }
    })
    setHistory((h) => [...h, ...rows])
    setPageChecked(true)
  }

  function nextPage() {
    setPage((p) => p + 1)
    setPageChecked(false)
  }

  function finish(reason) {
    setOutcome(reason)
    setPhase('done')
  }

  function restart() {
    setPage(0)
    setInputs({})
    setPageChecked(false)
    setHistory([])
    setOutcome('')
    setSendState('idle')
    setPhase('exercise')
  }

  return (
    <div className="page">
      <div className="card">
        {phase === 'welcome' && (
          <Welcome name={name} setName={setName} onStart={startSession} />
        )}

        {phase === 'exercise' && (
          <ExercisePage
            page={page}
            pageExercises={pageExercises}
            inputs={inputs}
            setInput={setInput}
            pageChecked={pageChecked}
            allFilled={allFilled}
            isLastPage={isLastPage}
            onValidate={validatePage}
            onNext={nextPage}
            onStop={() => finish('stopped')}
            onFinishAll={() => finish('finished')}
            onRestart={restart}
          />
        )}

        {phase === 'done' && (
          <Done
            name={name}
            outcome={outcome}
            history={history}
            correctCount={correctCount}
            sendState={sendState}
            setSendState={setSendState}
            onRestart={restart}
          />
        )}
      </div>
    </div>
  )
}

function Welcome({ name, setName, onStart }) {
  return (
    <form onSubmit={onStart} className="welcome">
      <h1>L’accord des participes passés</h1>
      <p className="lead">
        Un atelier <strong>en autonomie</strong> : cinq exercices par page. À
        chaque validation, la règle te sera rappelée. Tu avances à ton rythme et
        tu décides quand t’arrêter.
      </p>
      <label className="field">
        <span>Avant de commencer, écris ton prénom :</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ton prénom/nom"
          autoFocus
          maxLength={60}
        />
      </label>
      <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
        Commencer l’atelier →
      </button>
    </form>
  )
}

function ExercisePage({
  page,
  pageExercises,
  inputs,
  setInput,
  pageChecked,
  allFilled,
  isLastPage,
  onValidate,
  onNext,
  onStop,
  onFinishAll,
  onRestart,
}) {
  const firstIndex = page * PAGE_SIZE
  const lastIndex = firstIndex + pageExercises.length
  const doneUnits = firstIndex + (pageChecked ? pageExercises.length : 0)
  const progress = Math.round((doneUnits / TOTAL) * 100)
  const topRef = useRef(null)

  // Remonte tout en haut à chaque changement de page ET à la validation
  // (pour relire les corrections depuis le premier exercice).
  useEffect(() => {
    if (topRef.current) topRef.current.scrollIntoView({ block: 'start' })
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [page, pageChecked])

  return (
    <div className="exercise-page" ref={topRef}>
      <div className="progress" aria-hidden="true">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <div className="topline">
        <span className="counter">
          Exercices {firstIndex + 1}–{lastIndex} / {TOTAL}
        </span>
        <span className="section-tag">
          Page {page + 1} / {PAGES}
        </span>
      </div>

      <div className="cards">
        {pageExercises.map((ex, i) => (
          <ExerciseCard
            key={ex.id}
            ex={ex}
            number={firstIndex + i + 1}
            value={inputs[ex.id] || ''}
            onChange={(v) => setInput(ex.id, v)}
            checked={pageChecked}
            onEnter={onValidate}
          />
        ))}
      </div>

      {!pageChecked ? (
        <button
          className="btn btn-primary sticky-validate"
          onClick={onValidate}
          disabled={!allFilled}
        >
          {allFilled
            ? 'Valider mes réponses'
            : 'Réponds aux 5 exercices pour valider'}
        </button>
      ) : (
        <div className="choices">
          {isLastPage ? (
            <button className="btn btn-finish" onClick={onFinishAll}>
              🎉 J’ai tout fini&nbsp;!
            </button>
          ) : (
            <>
              <button className="btn btn-continue" onClick={onNext}>
                Je veux des exercices en plus.
              </button>
              <button className="btn btn-stop" onClick={onStop}>
                C’est trop facile pour moi, je m’arrête là.
              </button>
            </>
          )}
          <button className="btn btn-restart-inline" onClick={onRestart}>
            🔁 Recommencer depuis le début
          </button>
        </div>
      )}
    </div>
  )
}

function ExerciseCard({ ex, number, value, onChange, checked, onEnter }) {
  const [showVerbEn, setShowVerbEn] = useState(false)
  const [showRuleEn, setShowRuleEn] = useState(false)
  const right = checked && isCorrect(value, ex.answers)

  return (
    <div className={`ex-card ${checked ? (right ? 'card-ok' : 'card-ko') : ''}`}>
      <div className="ex-head">
        <span className="ex-number">Exercice {number}</span>
        <span className="section-tag small">{ex.section}</span>
      </div>

      {ex.context && <div className="context">{ex.context}</div>}

      <div className="sentence-row">
        <p className="sentence">
          {ex.before}
          <span className={`blank-wrap ${checked ? (right ? 'ok' : 'ko') : ''}`}>
            <input
              className="blank"
              type="text"
              value={value}
              disabled={checked}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  if (!checked) onEnter()
                }
              }}
              placeholder="…"
              aria-label={`Réponse pour l’exercice ${number}`}
              autoComplete="off"
              spellCheck={false}
            />
          </span>
          {ex.after}
        </p>
        <div className="verb-inline">
          <em>({ex.verb})</em>
          <button
            type="button"
            className="link-btn"
            title="Traduire le verbe en anglais"
            onClick={() => setShowVerbEn((s) => !s)}
          >
            🇬🇧
          </button>
          {showVerbEn && <span className="verb-en">{ex.verbEn}</span>}
        </div>
      </div>

      {checked && (
        <div className={`feedback ${right ? 'feedback-ok' : 'feedback-ko'}`}>
          <div className="feedback-head">
            {right ? '✅ Bravo, c’est exact ! 🎉' : '🟠 Pas tout à fait.'}
          </div>
          {!right && (
            <div className="feedback-answer">
              Réponse attendue : <strong>{ex.answers[0]}</strong>
            </div>
          )}
          <div className="reminder">
            <div className="reminder-rule">
              <span className="reminder-label">Règle&nbsp;:</span>{' '}
              {showRuleEn ? ex.ruleEn : ex.rule}
            </div>
            {ex.formation && (
              <div className="reminder-formation">
                {showRuleEn ? ex.formationEn : ex.formation}
              </div>
            )}
            <div className="examples">
              <span className="examples-label">
                {showRuleEn ? 'Examples:' : 'Exemples :'}
              </span>
              {(showRuleEn ? ex.examplesEn : ex.examples).map((s, i) => (
                <div key={i} className="example-line">
                  <RichText text={s} />
                </div>
              ))}
            </div>
            <button
              type="button"
              className="link-btn"
              onClick={() => setShowRuleEn((s) => !s)}
            >
              🇬🇧 {showRuleEn ? 'Revenir au français' : 'Traduire en anglais'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function buildDetails(history) {
  return history
    .map((h, i) => {
      const mark = h.correct ? 'OK ' : 'X  '
      return `${mark}${i + 1}. (${h.verb}) « ${h.prompt} » → réponse: "${h.given}"${
        h.correct ? '' : ` (attendu: "${h.expected}")`
      }`
    })
    .join('\n')
}

function Done({
  name,
  outcome,
  history,
  correctCount,
  sendState,
  setSendState,
  onRestart,
}) {
  const answered = history.length
  const percent = answered ? Math.round((correctCount / answered) * 100) : 0
  const scoreStr = `${correctCount} / ${answered}`
  const outcomeLabel =
    outcome === 'finished' ? 'Atelier terminé' : 'Arrêt anticipé'
  const details = buildDetails(history)
  const dateStr = new Date().toLocaleString('fr-FR')
  const needsEncouragement = percent < PASS_THRESHOLD
  const sentOnceRef = useRef(false)

  function downloadResults() {
    const content =
      `Atelier — L'accord des participes passés\n` +
      `----------------------------------------\n` +
      `Élève      : ${name}\n` +
      `Score      : ${scoreStr} (${percent}%)\n` +
      `Exercices  : ${answered} / ${exercises.length} faits\n` +
      `Statut     : ${outcomeLabel}\n` +
      `Date       : ${dateStr}\n\n` +
      `Détail :\n${details}\n`
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `resultats_${name.replace(/\s+/g, '_') || 'eleve'}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    if (sentOnceRef.current) return
    sentOnceRef.current = true
    if (!isEmailConfigured()) {
      setSendState('idle')
      return
    }
    setSendState('sending')
    emailjs
      .send(
        emailConfig.serviceId,
        emailConfig.templateId,
        {
          student_name: name,
          score: scoreStr,
          correct: String(correctCount),
          answered: String(answered),
          total: String(exercises.length),
          percent: `${percent}%`,
          outcome: outcomeLabel,
          date: dateStr,
          details,
        },
        { publicKey: emailConfig.publicKey }
      )
      .then(() => setSendState('sent'))
      .catch((err) => {
        console.error('Envoi EmailJS échoué :', err)
        setSendState('error')
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="done">
      <div className="badge">{outcome === 'finished' ? '🎉' : '👋'}</div>
      <h1>
        {outcome === 'finished'
          ? `Félicitations, ${name} !`
          : `À bientôt, ${name} !`}
      </h1>
      <p className="lead">
        {outcome === 'finished'
          ? 'Tu as terminé tout l’atelier.'
          : 'Tu as choisi de t’arrêter ici — c’est très bien.'}
      </p>

      <div className="scorebox">
        <div className="score-big">{scoreStr}</div>
        <div className="score-sub">
          bonnes réponses · {percent}% de réussite
        </div>
      </div>

      {needsEncouragement ? (
        <div className="encourage">
          💪 Ne te décourage pas&nbsp;! L’accord des participes passés, ça
          s’apprend avec de l’entraînement. Reprends l’atelier : tu vas
          progresser, c’est sûr&nbsp;!
        </div>
      ) : (
        percent === 100 && (
          <div className="encourage encourage-top">
            🌟 Sans faute&nbsp;! Bravo, tu maîtrises vraiment bien.
          </div>
        )
      )}

      <div className={`send-status send-${sendState}`}>
        {sendState === 'sending' && '📨 Envoi de tes résultats au professeur…'}
        {sendState === 'sent' &&
          '✅ Tes résultats ont bien été envoyés à ton professeur.'}
        {sendState === 'error' &&
          '⚠️ L’envoi par e-mail n’a pas fonctionné. Télécharge tes résultats ci-dessous et remets-les à ton professeur.'}
        {sendState === 'idle' &&
          'ℹ️ Télécharge tes résultats ci-dessous et remets-les à ton professeur.'}
      </div>

      <div className="end-actions">
        <button className="btn btn-primary" onClick={onRestart}>
          🔁 Recommencer l’atelier
        </button>
        <button className="btn btn-secondary" onClick={downloadResults}>
          ⬇️ Télécharger mes résultats (.txt)
        </button>
      </div>

      <details className="recap">
        <summary>Voir le détail de mes réponses</summary>
        <ul>
          {history.map((h, i) => (
            <li key={i} className={h.correct ? 'ok' : 'ko'}>
              <span className="recap-mark">{h.correct ? '✅' : '❌'}</span>
              <span>
                ({h.verb}) « {h.prompt} » → <em>{h.given}</em>
                {!h.correct && (
                  <>
                    {' '}
                    <span className="recap-expected">
                      attendu : {h.expected}
                    </span>
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}
