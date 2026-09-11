import { useEffect, useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
import { exercises } from './exercises'
import { emailConfig, isEmailConfigured } from './emailConfig'

const TOTAL = exercises.length
const CHUNK = 5
const PASS_THRESHOLD = 75 // % de réussite en dessous duquel on encourage

// --- Construction des « sets » (pages) --------------------------------------
// On regroupe les exercices par section (série), puis on découpe chaque série
// en morceaux de 5 max. La série 1 (« pp-forms ») devient une seule carte
// factorisée. Chaque set porte un titre unique, affiché en haut.
const SECTIONS = []
for (const ex of exercises) {
  const last = SECTIONS[SECTIONS.length - 1]
  if (!last || last.section !== ex.section) {
    SECTIONS.push({ section: ex.section, group: ex.group, items: [ex] })
  } else {
    last.items.push(ex)
  }
}
const PAGES = []
for (const sec of SECTIONS) {
  if (sec.group === 'pp-forms') {
    PAGES.push({ kind: 'multi', section: sec.section, items: sec.items })
  } else {
    for (let i = 0; i < sec.items.length; i += CHUNK) {
      PAGES.push({
        kind: 'single',
        section: sec.section,
        items: sec.items.slice(i, i + CHUNK),
      })
    }
  }
}
const PAGE_COUNT = PAGES.length

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
  if (!n) return false
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
  const [pageIndex, setPageIndex] = useState(0)
  const [inputs, setInputs] = useState({}) // { [id]: string }
  const [pageChecked, setPageChecked] = useState(false)
  const [history, setHistory] = useState([]) // { id, verb, prompt, given, expected, correct }
  const [outcome, setOutcome] = useState('') // finished | stopped
  const [sendState, setSendState] = useState('idle')

  const pageData = PAGES[pageIndex]
  const isLastPage = pageIndex === PAGE_COUNT - 1
  const correctCount = history.filter((h) => h.correct).length

  function startSession(e) {
    e.preventDefault()
    if (!name.trim()) return
    setPhase('exercise')
  }

  function setInput(id, value) {
    setInputs((prev) => ({ ...prev, [id]: value }))
  }

  function validatePage() {
    if (pageChecked) return
    const rows = pageData.items.map((ex) => {
      const given = (inputs[ex.id] || '').trim()
      return {
        id: ex.id,
        verb: ex.verb,
        prompt: `${ex.before || ''}____${ex.after || ''}`.trim(),
        given,
        expected: ex.answers[0],
        correct: isCorrect(given, ex.answers),
      }
    })
    setHistory((h) => [...h, ...rows])
    setPageChecked(true)
  }

  function nextPage() {
    setPageIndex((p) => p + 1)
    setPageChecked(false)
  }

  // Recommence UNIQUEMENT le set en cours (efface ses réponses + son score).
  function restartSet() {
    setInputs((prev) => {
      const next = { ...prev }
      pageData.items.forEach((ex) => delete next[ex.id])
      return next
    })
    setHistory((h) => h.slice(0, Math.max(0, h.length - pageData.items.length)))
    setPageChecked(false)
  }

  function finish(reason) {
    setOutcome(reason)
    setPhase('done')
  }

  // Recommence tout l'atelier (depuis le premier set), en gardant le prénom.
  function restartAll() {
    setPageIndex(0)
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
            pageData={pageData}
            pageIndex={pageIndex}
            inputs={inputs}
            setInput={setInput}
            pageChecked={pageChecked}
            isLastPage={isLastPage}
            onValidate={validatePage}
            onNext={nextPage}
            onStop={() => finish('stopped')}
            onFinishAll={() => finish('finished')}
            onRestartSet={restartSet}
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
            onRestart={restartAll}
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
        Un atelier <strong>en autonomie</strong>, set par set. À chaque
        validation, la règle te sera rappelée. Tu avances à ton rythme et tu
        décides quand t’arrêter.
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
  pageData,
  pageIndex,
  inputs,
  setInput,
  pageChecked,
  isLastPage,
  onValidate,
  onNext,
  onStop,
  onFinishAll,
  onRestartSet,
}) {
  const items = pageData.items
  const firstNum = items[0].id
  const lastNum = items[items.length - 1].id
  const doneUnits = pageChecked ? lastNum : firstNum - 1
  const progress = Math.round((doneUnits / TOTAL) * 100)
  const topRef = useRef(null)

  // Remonte tout en haut à chaque changement de set ET à la validation
  // (pour relire les corrections depuis le premier exercice).
  useEffect(() => {
    if (topRef.current) topRef.current.scrollIntoView({ block: 'start' })
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [pageIndex, pageChecked])

  return (
    <div className="exercise-page" ref={topRef}>
      <div className="progress" aria-hidden="true">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <div className="topline">
        <span className="counter">
          Exercices {firstNum}–{lastNum} / {TOTAL}
        </span>
        <span className="section-tag">
          Set {pageIndex + 1} / {PAGE_COUNT}
        </span>
      </div>

      <h2 className="set-title">{pageData.section}</h2>

      <div className="cards">
        {pageData.kind === 'multi' ? (
          <MultiCard
            items={items}
            inputs={inputs}
            setInput={setInput}
            checked={pageChecked}
            onEnter={onValidate}
          />
        ) : (
          items.map((ex) => (
            <ExerciseCard
              key={ex.id}
              ex={ex}
              number={ex.id}
              value={inputs[ex.id] || ''}
              onChange={(v) => setInput(ex.id, v)}
              checked={pageChecked}
              onEnter={onValidate}
            />
          ))
        )}
      </div>

      {!pageChecked ? (
        <button className="btn btn-primary sticky-validate" onClick={onValidate}>
          Valider mes réponses
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
              <button className="btn btn-restart-inline" onClick={onRestartSet}>
                🔁 Recommencer ce set
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// Carte factorisée : plusieurs verbes, un seul intitulé.
function MultiCard({ items, inputs, setInput, checked, onEnter }) {
  const [showEn, setShowEn] = useState(false)
  return (
    <div className="ex-card multi-card">
      <div className="multi-top">
        <p className="multi-instruction">
          Indique les participes passés{' '}
          <em>(forme du masculin singulier)</em> :
        </p>
        <button
          type="button"
          className="link-btn"
          onClick={() => setShowEn((s) => !s)}
        >
          🇬🇧 {showEn ? 'français' : 'anglais'}
        </button>
      </div>

      <div className="verb-list">
        {items.map((ex, i) => {
          const val = inputs[ex.id] || ''
          const right = checked && isCorrect(val, ex.answers)
          return (
            <div
              key={ex.id}
              className={`verb-row ${checked ? (right ? 'ok' : 'ko') : ''}`}
            >
              <span className="verb-num">{i + 1}.</span>
              <span className="verb-inf">
                <em>{ex.verb}</em>
                {showEn && <span className="verb-en"> ({ex.verbEn})</span>}
              </span>
              <span className="arrow">→</span>
              <span className={`blank-wrap ${checked ? (right ? 'ok' : 'ko') : ''}`}>
                <input
                  className="blank blank-sm"
                  type="text"
                  value={val}
                  disabled={checked}
                  onChange={(e) => setInput(ex.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (!checked) onEnter()
                    }
                  }}
                  placeholder="…"
                  aria-label={`Participe passé de ${ex.verb}`}
                  autoComplete="off"
                  spellCheck={false}
                />
              </span>
              {checked && (
                <span className="verb-feedback">
                  {right ? (
                    '✅'
                  ) : (
                    <>
                      🟠 <strong>{ex.answers[0]}</strong>
                    </>
                  )}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {checked && (
        <div className="reminder multi-reminder">
          <span className="reminder-label">
            {showEn ? 'Formation rules:' : 'Règles de formation :'}
          </span>
          <ul>
            {items.map((ex) => (
              <li key={ex.id}>
                <em>{ex.verb}</em> — {showEn ? ex.ruleEn : ex.rule}
              </li>
            ))}
          </ul>
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
        <span className="ex-number">{number}</span>
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
      const given = h.given || '(vide)'
      return `${mark}${i + 1}. (${h.verb}) « ${h.prompt} » → réponse: "${given}"${
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
      `Exercices  : ${answered} / ${TOTAL} faits\n` +
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
          total: String(TOTAL),
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
              <span className="recap-mark">{h.correct ? '✅' : '🟠'}</span>
              <span>
                ({h.verb}) « {h.prompt} » → <em>{h.given || '(vide)'}</em>
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
