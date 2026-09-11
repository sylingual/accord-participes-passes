import { useEffect, useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
import { exercises } from './exercises'
import { emailConfig, isEmailConfigured } from './emailConfig'

const TOTAL = exercises.length

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

export default function App() {
  const [phase, setPhase] = useState('welcome') // welcome | exercise | done
  const [name, setName] = useState('')
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [checked, setChecked] = useState(false)
  const [wasRight, setWasRight] = useState(false)
  const [history, setHistory] = useState([]) // { id, section, prompt, verb, given, expected, correct }
  const [outcome, setOutcome] = useState('') // 'finished' | 'stopped'
  const [sendState, setSendState] = useState('idle') // idle | sending | sent | error
  const inputRef = useRef(null)

  const ex = exercises[index]
  const isLast = index === TOTAL - 1
  const correctCount = history.filter((h) => h.correct).length

  // Focus automatique sur le champ de réponse à chaque nouvel exercice.
  useEffect(() => {
    if (phase === 'exercise' && !checked && inputRef.current) {
      inputRef.current.focus()
    }
  }, [phase, index, checked])

  function startSession(e) {
    e.preventDefault()
    if (!name.trim()) return
    setPhase('exercise')
  }

  function validate() {
    if (checked || !input.trim()) return
    const right = isCorrect(input, ex.answers)
    setWasRight(right)
    setChecked(true)
    setHistory((h) => [
      ...h,
      {
        id: ex.id,
        section: ex.section,
        prompt: `${ex.before}____${ex.after}`.trim(),
        verb: ex.verb,
        given: input.trim(),
        expected: ex.answers[0],
        correct: right,
      },
    ])
  }

  function nextExercise() {
    setIndex((i) => i + 1)
    setInput('')
    setChecked(false)
    setWasRight(false)
  }

  function finish(reason) {
    setOutcome(reason)
    setPhase('done')
  }

  return (
    <div className="page">
      <div className="card">
        {phase === 'welcome' && (
          <Welcome name={name} setName={setName} onStart={startSession} />
        )}

        {phase === 'exercise' && (
          <Exercise
            ex={ex}
            index={index}
            input={input}
            setInput={setInput}
            checked={checked}
            wasRight={wasRight}
            isLast={isLast}
            inputRef={inputRef}
            onValidate={validate}
            onNext={nextExercise}
            onStop={() => finish('stopped')}
            onFinishAll={() => finish('finished')}
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
        Un atelier <strong>en autonomie</strong> : un exercice à la fois. À chaque
        réponse validée, la règle te sera rappelée. Tu avances à ton rythme et tu
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

function Exercise({
  ex,
  index,
  input,
  setInput,
  checked,
  wasRight,
  isLast,
  inputRef,
  onValidate,
  onNext,
  onStop,
  onFinishAll,
}) {
  const progress = Math.round(((index + (checked ? 1 : 0)) / TOTAL) * 100)

  function onKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (!checked) onValidate()
    }
  }

  return (
    <div className="exercise">
      <div className="progress" aria-hidden="true">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <div className="topline">
        <span className="counter">
          Exercice {index + 1} / {TOTAL}
        </span>
        <span className="section-tag">{ex.section}</span>
      </div>

      <div className="verb-chip">
        Verbe : <strong>{ex.verb}</strong>
      </div>

      {ex.context && <div className="context">{ex.context}</div>}

      <p className="sentence">
        {ex.before}
        <span className={`blank-wrap ${checked ? (wasRight ? 'ok' : 'ko') : ''}`}>
          <input
            ref={inputRef}
            className="blank"
            type="text"
            value={input}
            disabled={checked}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="…"
            aria-label="Ta réponse"
            autoComplete="off"
            spellCheck={false}
          />
        </span>
        {ex.after}
      </p>

      {!checked && (
        <button
          className="btn btn-primary"
          onClick={onValidate}
          disabled={!input.trim()}
        >
          Valider ma réponse
        </button>
      )}

      {checked && (
        <>
          <div className={`feedback ${wasRight ? 'feedback-ok' : 'feedback-ko'}`}>
            <div className="feedback-head">
              {wasRight ? '✅ Bravo, c’est exact !' : '❌ Pas tout à fait.'}
            </div>
            {!wasRight && (
              <div className="feedback-answer">
                Réponse attendue : <strong>{ex.answers[0]}</strong>
              </div>
            )}
            <div className="reminder">
              <span className="reminder-label">Règle&nbsp;:</span> {ex.reminder}
            </div>
          </div>

          <div className="choices">
            {isLast ? (
              <button className="btn btn-finish" onClick={onFinishAll}>
                🎉 J’ai tout fini&nbsp;!
              </button>
            ) : (
              <>
                <button className="btn btn-continue" onClick={onNext}>
                  Je veux encore m’entraîner.
                </button>
                <button className="btn btn-stop" onClick={onStop}>
                  C’est trop facile pour moi, je m’arrête là.
                </button>
              </>
            )}
          </div>
        </>
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

function Done({ name, outcome, history, correctCount, sendState, setSendState }) {
  const answered = history.length
  const percent = answered ? Math.round((correctCount / answered) * 100) : 0
  const scoreStr = `${correctCount} / ${answered}`
  const outcomeLabel =
    outcome === 'finished' ? 'Atelier terminé' : 'Arrêt anticipé'
  const details = buildDetails(history)
  const dateStr = new Date().toLocaleString('fr-FR')
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

  // Envoi automatique de l'e-mail (une seule fois) si EmailJS est configuré.
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

      <div className={`send-status send-${sendState}`}>
        {sendState === 'sending' && '📨 Envoi de tes résultats au professeur…'}
        {sendState === 'sent' &&
          '✅ Tes résultats ont bien été envoyés à ton professeur.'}
        {sendState === 'error' &&
          '⚠️ L’envoi par e-mail n’a pas fonctionné. Télécharge tes résultats ci-dessous et remets-les à ton professeur.'}
        {sendState === 'idle' &&
          'ℹ️ Télécharge tes résultats ci-dessous et remets-les à ton professeur.'}
      </div>

      <button className="btn btn-secondary" onClick={downloadResults}>
        ⬇️ Télécharger mes résultats (.txt)
      </button>

      <details className="recap">
        <summary>Voir le détail de mes réponses</summary>
        <ul>
          {history.map((h, i) => (
            <li key={h.id} className={h.correct ? 'ok' : 'ko'}>
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
