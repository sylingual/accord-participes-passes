import { Fragment, useEffect, useRef, useState } from 'react'
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

// Médaillon « aquarelle / heroic fantasy » : fond dégradé, lavis flous,
// texture papier, bords irréguliers façon pinceau (filtres SVG).
function WcMedallion({ id, label, skyFrom, skyTo, border, bg, fg }) {
  const cc = `${id}-cc`
  const wc = `${id}-wc`
  const wcb = `${id}-wcb`
  const paper = `${id}-paper`
  const sky = `${id}-sky`
  return (
    <svg viewBox="0 0 200 200" className="tier-img" role="img" aria-label={label}>
      <defs>
        <radialGradient id={sky} cx="50%" cy="30%" r="85%">
          <stop offset="0%" stopColor={skyFrom} />
          <stop offset="100%" stopColor={skyTo} />
        </radialGradient>
        <clipPath id={cc}>
          <circle cx="100" cy="100" r="93" />
        </clipPath>
        <filter id={wc} x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves="4" seed="9" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id={wcb} x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="8" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur in="d" stdDeviation="2.6" />
        </filter>
        <filter id={paper} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" result="p" />
          <feColorMatrix in="p" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.05 0" />
        </filter>
      </defs>
      <g clipPath={`url(#${cc})`}>
        <rect x="0" y="0" width="200" height="200" fill={`url(#${sky})`} />
        <g filter={`url(#${wcb})`}>{bg}</g>
        <g filter={`url(#${wc})`}>{fg}</g>
        <rect x="0" y="0" width="200" height="200" filter={`url(#${paper})`} />
      </g>
      <circle cx="100" cy="100" r="92" fill="none" stroke={border} strokeWidth="6" opacity="0.9" filter={`url(#${wc})`} />
    </svg>
  )
}

const STAR =
  'M0 -22 L6.5 -7 L22 -6 L10 4 L14 20 L0 11 L-14 20 L-10 4 L-22 -6 L-6.5 -7 Z'

function TierImage({ cls }) {
  if (cls === 'tier-legende') {
    return (
      <WcMedallion
        id="lg"
        label="Légende"
        skyFrom="#fffbeb"
        skyTo="#f59e0b"
        border="#a16207"
        bg={
          <>
            <polygon points="100,20 84,120 116,120" fill="#fde68a" opacity="0.55" />
            <polygon points="100,20 40,120 70,120" fill="#fef3c7" opacity="0.4" />
            <polygon points="100,20 160,120 130,120" fill="#fef3c7" opacity="0.4" />
            <path d="M-5 176 L44 118 L96 166 L140 112 L205 172 V210 H-5 Z" fill="#b45309" opacity="0.8" />
            <path d="M-5 188 Q100 168 205 188 V210 H-5 Z" fill="#78350f" opacity="0.7" />
          </>
        }
        fg={
          <>
            <path d="M54 142 L46 84 L78 112 L100 70 L122 112 L154 84 L146 142 Z" fill="#facc15" stroke="#a16207" strokeWidth="4" strokeLinejoin="round" />
            <rect x="54" y="140" width="92" height="18" rx="5" fill="#eab308" stroke="#a16207" strokeWidth="4" />
            <circle cx="100" cy="102" r="7" fill="#ef4444" stroke="#a16207" strokeWidth="2" />
            <circle cx="70" cy="120" r="5" fill="#3b82f6" stroke="#a16207" strokeWidth="2" />
            <circle cx="130" cy="120" r="5" fill="#22c55e" stroke="#a16207" strokeWidth="2" />
            <circle cx="150" cy="56" r="4" fill="#fffbeb" />
            <circle cx="52" cy="66" r="3" fill="#fffbeb" />
          </>
        }
      />
    )
  }
  if (cls === 'tier-heros') {
    return (
      <WcMedallion
        id="he"
        label="Héros"
        skyFrom="#fef3c7"
        skyTo="#fb923c"
        border="#b45309"
        bg={
          <>
            <circle cx="100" cy="66" r="34" fill="#fde68a" opacity="0.85" />
            <circle cx="100" cy="66" r="52" fill="#fbbf24" opacity="0.25" />
            <path d="M-5 176 L48 128 L100 160 L152 124 L205 172 V210 H-5 Z" fill="#c2410c" opacity="0.85" />
            <path d="M-5 190 Q100 172 205 190 V210 H-5 Z" fill="#7c2d12" opacity="0.7" />
          </>
        }
        fg={
          <>
            <path d="M100 72 L140 88 V126 C140 152 120 168 100 176 C80 168 60 152 60 126 V88 Z" fill="#f59e0b" stroke="#b45309" strokeWidth="4" strokeLinejoin="round" />
            <g transform="translate(100 122)" fill="#fffbeb">
              <path d={STAR} />
            </g>
          </>
        }
      />
    )
  }
  if (cls === 'tier-champion') {
    return (
      <WcMedallion
        id="ch"
        label="Champion"
        skyFrom="#f5f3ff"
        skyTo="#a78bfa"
        border="#6d28d9"
        bg={
          <>
            <polygon points="100,100 20,30 40,20" fill="#ede9fe" opacity="0.5" />
            <polygon points="100,100 180,30 160,20" fill="#ede9fe" opacity="0.5" />
            <path d="M-5 178 Q100 156 205 178 V210 H-5 Z" fill="#7c3aed" opacity="0.65" />
          </>
        }
        fg={
          <>
            <path d="M60 150 C38 120 42 88 66 70" stroke="#16a34a" strokeWidth="7" fill="none" strokeLinecap="round" />
            <path d="M140 150 C162 120 158 88 134 70" stroke="#15803d" strokeWidth="7" fill="none" strokeLinecap="round" />
            <path d="M82 66 L96 112 L86 112 Z" fill="#a78bfa" />
            <path d="M118 66 L104 112 L114 112 Z" fill="#7c3aed" />
            <circle cx="100" cy="122" r="30" fill="#fbbf24" stroke="#7c3aed" strokeWidth="4" />
            <circle cx="100" cy="122" r="30" fill="none" stroke="#fde68a" strokeWidth="2" />
            <g transform="translate(100 122) scale(0.72)" fill="#7c3aed">
              <path d={STAR} />
            </g>
          </>
        }
      />
    )
  }
  if (cls === 'tier-aventurier') {
    return (
      <WcMedallion
        id="av"
        label="Aventurier"
        skyFrom="#eff6ff"
        skyTo="#60a5fa"
        border="#1d4ed8"
        bg={
          <>
            <path d="M-5 172 L44 92 L86 150 L122 96 L172 164 L205 122 V210 H-5 Z" fill="#3b82f6" opacity="0.8" />
            <path d="M44 92 L60 116 L28 116 Z" fill="#eff6ff" opacity="0.95" />
            <path d="M122 96 L138 120 L106 120 Z" fill="#eff6ff" opacity="0.95" />
            <path d="M-5 182 Q100 158 205 182 V210 H-5 Z" fill="#1e40af" opacity="0.7" />
            <circle cx="150" cy="52" r="16" fill="#dbeafe" opacity="0.8" />
          </>
        }
        fg={
          <>
            <circle cx="100" cy="120" r="35" fill="#fbfdff" opacity="0.94" stroke="#1d4ed8" strokeWidth="4" />
            <circle cx="100" cy="120" r="35" fill="none" stroke="#93c5fd" strokeWidth="1.5" />
            <polygon points="100,90 109,120 100,111 91,120" fill="#ef4444" />
            <polygon points="100,150 91,120 100,129 109,120" fill="#1d4ed8" />
            <circle cx="100" cy="120" r="5" fill="#1d4ed8" />
          </>
        }
      />
    )
  }
  // Apprenti (défaut)
  return (
    <WcMedallion
      id="ap"
      label="Apprenti"
      skyFrom="#fef9c3"
      skyTo="#86efac"
      border="#15803d"
      bg={
        <>
          <circle cx="150" cy="58" r="24" fill="#fef08a" opacity="0.75" />
          <path d="M-5 150 Q60 122 105 146 T205 150 V210 H-5 Z" fill="#86efac" opacity="0.85" />
          <path d="M-5 170 Q70 142 130 166 T205 170 V210 H-5 Z" fill="#22c55e" opacity="0.75" />
        </>
      }
      fg={
        <>
          <path d="M100 158 V104" stroke="#166534" strokeWidth="7" strokeLinecap="round" />
          <path d="M100 120 C94 96 68 90 52 98 C60 122 82 128 100 120 Z" fill="#22c55e" />
          <path d="M100 110 C106 86 132 80 148 88 C140 112 118 118 100 110 Z" fill="#16a34a" />
          <circle cx="100" cy="150" r="9" fill="#fde68a" opacity="0.85" />
          <circle cx="150" cy="50" r="4" fill="#fffbeb" />
          <circle cx="60" cy="74" r="3" fill="#fffbeb" />
        </>
      }
    />
  )
}

// Échelle des niveaux (pour montrer où l'élève peut monter).
const TIER_LADDER = [
  { name: 'Apprenti', cls: 'tier-apprenti', range: '0–49 %', emoji: '🌱' },
  { name: 'Aventurier', cls: 'tier-aventurier', range: '50–74 %', emoji: '🧭' },
  { name: 'Champion', cls: 'tier-champion', range: '75–94 %', emoji: '🏅' },
  { name: 'Héros', cls: 'tier-heros', range: '95–99 %', emoji: '🦸' },
  { name: 'Légende', cls: 'tier-legende', range: '100 %', emoji: '👑' },
]

function TierLadder({ currentCls }) {
  return (
    <div className="tier-ladder" aria-label="Progression des niveaux">
      {TIER_LADDER.map((t, i) => (
        <Fragment key={t.cls}>
          {i > 0 && <span className="tier-arrow">→</span>}
          <div
            className={`tier-step ${t.cls} ${
              t.cls === currentCls ? 'current' : 'muted'
            }`}
          >
            <span className="tier-step-emoji">{t.emoji}</span>
            <span className="tier-step-name">{t.name}</span>
            <span className="tier-step-range">{t.range}</span>
          </div>
        </Fragment>
      ))}
    </div>
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

      <TierLadder currentCls={tier.cls} />

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
