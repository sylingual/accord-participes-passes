import { useEffect, useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
import { exercises } from './exercises'
import { emailConfig, isEmailConfigured } from './emailConfig'

const TOTAL = exercises.length
const CHUNK = 5

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

// Numéro d'affichage = position dans la liste (continue 1..N, indépendante des id).
const NUM = {}
exercises.forEach((ex, i) => {
  NUM[ex.id] = i + 1
})

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
            key={pageIndex}
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
  const firstNum = NUM[items[0].id]
  const lastNum = NUM[items[items.length - 1].id]
  const doneUnits = pageChecked ? lastNum : firstNum - 1
  const progress = Math.round((doneUnits / TOTAL) * 100)
  const topRef = useRef(null)
  const [showEn, setShowEn] = useState(false)

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

      <div className="set-header">
        <h2 className="set-title">{pageData.section}</h2>
        {pageData.kind === 'single' && (
          <button
            type="button"
            className="link-btn set-lang"
            onClick={() => setShowEn((s) => !s)}
          >
            🇬🇧 {showEn ? 'français' : 'anglais'}
          </button>
        )}
      </div>

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
            <SingleRow
              key={ex.id}
              ex={ex}
              number={NUM[ex.id]}
              value={inputs[ex.id] || ''}
              onChange={(v) => setInput(ex.id, v)}
              checked={pageChecked}
              showEn={showEn}
              onEnter={onValidate}
            />
          ))
        )}
      </div>

      {pageData.kind === 'single' && pageChecked && (
        <div className="reminder multi-reminder set-correction">
          <span className="reminder-label">
            {showEn ? 'Corrections & rules:' : 'Corrigé & règles :'}
          </span>
          <ul>
            {items.map((ex) => (
              <li key={ex.id}>
                <span className="corr-num">{NUM[ex.id]}.</span>{' '}
                <em>{ex.verb}</em> — {showEn ? ex.ruleEn : ex.rule}
                {ex.formation && (
                  <div className="corr-formation">
                    {showEn ? ex.formationEn : ex.formation}
                  </div>
                )}
                <div className="multi-example">
                  <RichText text={(showEn ? ex.examplesEn : ex.examples)[0]} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

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
                <div className="multi-example">
                  <RichText text={(showEn ? ex.examplesEn : ex.examples)[0]} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Exercice à une phrase, présenté comme le set 1 : numéro au début,
// résultat en ligne (✅ / 🟠 réponse). Les règles sont regroupées en bas du set.
function SingleRow({ ex, number, value, onChange, checked, showEn, onEnter }) {
  const right = checked && isCorrect(value, ex.answers)

  return (
    <div
      className={`ex-card compact ${
        checked ? (right ? 'card-ok' : 'card-ko') : ''
      }`}
    >
      {ex.context && <div className="context">{ex.context}</div>}

      <div className="sentence-row">
        <p className="sentence">
          <span className="lead-num">{number}.</span>{' '}
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
          {checked && (
            <span className="inline-result">
              {right ? (
                '✅'
              ) : (
                <>
                  🟠 <strong>{ex.answers[0]}</strong>
                </>
              )}
            </span>
          )}
        </p>
        <div className="verb-inline">
          <em>({ex.verb})</em>
          {showEn && <span className="verb-en">{ex.verbEn}</span>}
        </div>
      </div>
    </div>
  )
}

// Emblème (image SVG) correspondant à chaque niveau.
function TierImage({ cls }) {
  const svg = { width: 128, height: 128, viewBox: '0 0 132 132', className: 'tier-img' }
  if (cls === 'tier-legende') {
    return (
      <svg {...svg} role="img" aria-label="Légende">
        <circle cx="66" cy="66" r="62" fill="#fef9c3" stroke="#facc15" strokeWidth="3" />
        <path d="M34 88 L28 48 L50 66 L66 38 L82 66 L104 48 L98 88 Z" fill="#facc15" stroke="#a16207" strokeWidth="3" strokeLinejoin="round" />
        <rect x="34" y="88" width="64" height="12" rx="4" fill="#eab308" stroke="#a16207" strokeWidth="3" />
        <circle cx="66" cy="52" r="6" fill="#ef4444" stroke="#a16207" strokeWidth="2" />
        <circle cx="40" cy="70" r="4.5" fill="#3b82f6" stroke="#a16207" strokeWidth="2" />
        <circle cx="92" cy="70" r="4.5" fill="#22c55e" stroke="#a16207" strokeWidth="2" />
      </svg>
    )
  }
  if (cls === 'tier-heros') {
    return (
      <svg {...svg} role="img" aria-label="Héros">
        <circle cx="66" cy="66" r="62" fill="#fffbeb" stroke="#fde68a" strokeWidth="3" />
        <path d="M66 30 L94 42 V70 C94 87 82 98 66 103 C50 98 38 87 38 70 V42 Z" fill="#f59e0b" stroke="#b45309" strokeWidth="3" strokeLinejoin="round" />
        <path d="M66 48 l5.3 10.8 11.9 1.7 -8.6 8.4 2 11.8 -10.6 -5.6 -10.6 5.6 2 -11.8 -8.6 -8.4 11.9 -1.7 Z" fill="#fff" />
      </svg>
    )
  }
  if (cls === 'tier-champion') {
    return (
      <svg {...svg} role="img" aria-label="Champion">
        <circle cx="66" cy="66" r="62" fill="#f5f3ff" stroke="#ddd6fe" strokeWidth="3" />
        <path d="M50 30 L62 74 L54 74 Z" fill="#a78bfa" />
        <path d="M82 30 L70 74 L78 74 Z" fill="#7c3aed" />
        <circle cx="66" cy="84" r="24" fill="#fbbf24" stroke="#7c3aed" strokeWidth="3" />
        <path d="M66 70 l4.3 8.8 9.7 1.4 -7 6.8 1.6 9.6 -8.6 -4.5 -8.6 4.5 1.6 -9.6 -7 -6.8 9.7 -1.4 Z" fill="#7c3aed" />
      </svg>
    )
  }
  if (cls === 'tier-aventurier') {
    return (
      <svg {...svg} role="img" aria-label="Aventurier">
        <circle cx="66" cy="66" r="62" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="3" />
        <circle cx="66" cy="66" r="42" fill="#fff" stroke="#1d4ed8" strokeWidth="4" />
        <polygon points="66,30 75,66 66,58 57,66" fill="#ef4444" />
        <polygon points="66,102 57,66 66,74 75,66" fill="#1d4ed8" />
        <circle cx="66" cy="66" r="5" fill="#1d4ed8" />
      </svg>
    )
  }
  // Apprenti (défaut)
  return (
    <svg {...svg} role="img" aria-label="Apprenti">
      <circle cx="66" cy="66" r="62" fill="#ecfdf3" stroke="#86efac" strokeWidth="3" />
      <path d="M50 96 Q66 90 82 96" stroke="#a16207" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M66 94 V58" stroke="#15803d" strokeWidth="5" strokeLinecap="round" />
      <path d="M66 70 C64 56 50 50 40 54 C44 68 56 72 66 70 Z" fill="#22c55e" />
      <path d="M66 62 C68 48 82 44 92 48 C88 62 76 66 66 62 Z" fill="#16a34a" />
    </svg>
  )
}

// Thème héroïque : le niveau (titre) dépend du pourcentage de réussite.
function getTier(percent) {
  if (percent >= 100) {
    return {
      name: 'Légende',
      emoji: '🏆',
      cls: 'tier-legende',
      message:
        '100 % ! Tu es une LÉGENDE ! Personne ne t’arrête : tu maîtrises vraiment l’accord des participes passés.',
    }
  }
  if (percent >= 95) {
    return {
      name: 'Héros',
      emoji: '🦸',
      cls: 'tier-heros',
      message:
        'Impressionnant, tu es un vrai Héros ! Il te manque juste un souffle pour atteindre 100 % et devenir une Légende !',
    }
  }
  if (percent >= 75) {
    return {
      name: 'Champion',
      emoji: '🏅',
      cls: 'tier-champion',
      message:
        'Wouah ! Quel Champion ! Oseras-tu refaire le test pour aller jusqu’à 100 % et devenir une Légende ?',
    }
  }
  if (percent >= 50) {
    return {
      name: 'Aventurier',
      emoji: '🧭',
      cls: 'tier-aventurier',
      message:
        'Tu es un Aventurier ! Si tu refais encore le test, tu peux devenir encore meilleur… Sers-toi de tes fiches de grammaire.',
    }
  }
  return {
    name: 'Apprenti',
    emoji: '🌱',
    cls: 'tier-apprenti',
    message:
      'Tu es un Apprenti ! Refais le test pour monter de niveau ! Tu vas y arriver. Sers-toi de tes fiches de grammaire.',
  }
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
  const tier = getTier(percent)
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
      <TierImage cls={tier.cls} />
      <h1 className={`tier-title ${tier.cls}`}>
        {tier.emoji} {tier.name}
      </h1>
      <p className="lead">
        {name} —{' '}
        {outcome === 'finished'
          ? 'tu as terminé tout l’atelier !'
          : 'tu t’es arrêté ici, bravo pour ton travail.'}
      </p>

      <div className="scorebox">
        <div className="score-big">{scoreStr}</div>
        <div className="score-sub">
          bonnes réponses · {percent}% de réussite
        </div>
      </div>

      <div className={`tier-message ${tier.cls}`}>{tier.message}</div>

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
