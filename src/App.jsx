import { Fragment, useEffect, useRef, useState } from 'react'
import { SETS } from './setsData'
import { statsConfig, isStatsConfigured } from './statsConfig'

// Enregistre une ligne de résultat dans le Google Sheet (fire-and-forget).
function logStat(payload) {
  if (!isStatsConfigured()) return
  try {
    fetch(statsConfig.sheetsUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {})
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// Utilitaires
// ---------------------------------------------------------------------------
function normalize(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[.,;:!?«»"'’()[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function isCorrect(input, answers) {
  const n = normalize(input)
  return answers.some((a) => normalize(a) === n)
}

function RichText({ text }) {
  const parts = (text || '').split(/(\*\*[^*]+\*\*)/g)
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

function blanksOf(card) {
  if (card.kind === 'verbs') return card.items.map((it) => ({ answers: it.answers }))
  if (card.kind === 'sentence') return [{ answers: card.answers }]
  if (card.kind === 'segmented')
    return card.segments
      .filter((s) => typeof s === 'object')
      .map((s) => ({ answers: [s.a] }))
  return []
}

const storeKey = (name) => 'pp-atelier:' + name.trim().toLowerCase()
function loadState(name) {
  try {
    const raw = localStorage.getItem(storeKey(name))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
function saveState(name, data) {
  try {
    localStorage.setItem(storeKey(name), JSON.stringify(data))
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// Application
// ---------------------------------------------------------------------------
export default function App() {
  const [phase, setPhase] = useState('welcome') // welcome | menu | set
  const [name, setName] = useState('')
  const [group, setGroup] = useState('') // '1' | '2'
  const [scores, setScores] = useState({}) // { setId: {correct, answered, percent, grade, cls, date} }
  const [linkReactions, setLinkReactions] = useState({}) // { url: 'up' | 'down' }
  const [currentSetId, setCurrentSetId] = useState(null)

  function startSession(e) {
    e.preventDefault()
    if (!name.trim() || !group) return
    const saved = loadState(name)
    if (saved) {
      setScores(saved.scores || {})
      setLinkReactions(saved.linkReactions || {})
      if (saved.group && !group) setGroup(saved.group)
    }
    setPhase('menu')
  }

  useEffect(() => {
    if (phase !== 'welcome' && name.trim())
      saveState(name, { scores, linkReactions, group })
  }, [scores, linkReactions, group, phase, name])

  // Réaction 👍/👎 sur un lien : on n'enregistre PAS qui a cliqué, seulement
  // un compteur global (delta) par exercice dans le Google Sheet.
  function reactLink(link, reaction) {
    setLinkReactions((r) => {
      const prev = r[link.url] || ''
      const next = prev === reaction ? '' : reaction // reclic = retire
      const up = (next === 'up' ? 1 : 0) - (prev === 'up' ? 1 : 0)
      const down = (next === 'down' ? 1 : 0) - (prev === 'down' ? 1 : 0)
      if (up !== 0 || down !== 0) {
        logStat({ type: 'reaction', title: link.title, url: link.url, up, down })
      }
      return { ...r, [link.url]: next }
    })
  }

  function recordScore(setId, correct, answered) {
    const percent = answered ? Math.round((correct / answered) * 100) : 0
    const t = getTier(percent)
    setScores((s) => ({
      ...s,
      [setId]: {
        correct,
        answered,
        percent,
        grade: t.name,
        cls: t.cls,
        date: new Date().toLocaleDateString('fr-FR'),
      },
    }))
  }

  const currentSet = SETS.find((s) => s.id === currentSetId)

  return (
    <div className="page">
      <div className="card">
        {phase === 'welcome' && (
          <Welcome
            name={name}
            setName={setName}
            group={group}
            setGroup={setGroup}
            onStart={startSession}
          />
        )}
        {phase === 'menu' && (
          <Menu
            name={name}
            scores={scores}
            onOpen={(id) => {
              setCurrentSetId(id)
              setPhase('set')
            }}
          />
        )}
        {phase === 'set' && currentSet && (
          <SetView
            set={currentSet}
            name={name}
            group={group}
            linkReactions={linkReactions}
            onReact={reactLink}
            onRecord={recordScore}
            onBack={() => setPhase('menu')}
          />
        )}
      </div>
    </div>
  )
}

function Welcome({ name, setName, group, setGroup, onStart }) {
  return (
    <form onSubmit={onStart} className="welcome">
      <h1>L’accord des participes passés</h1>
      <p className="lead">
        Un atelier <strong>en autonomie</strong> en 5 sets. Écris ton prénom,
        puis choisis le set où tu veux t’entraîner. Chaque set te donne un
        <strong> niveau</strong> (Apprenti → Légende) !
      </p>
      <label className="field">
        <span>Ton prénom :</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ton prénom/nom"
          autoFocus
          maxLength={60}
        />
      </label>
      <div className="field">
        <span>Ton groupe :</span>
        <div className="group-choice">
          <button
            type="button"
            className={`group-btn ${group === '1' ? 'on' : ''}`}
            onClick={() => setGroup('1')}
          >
            Groupe 1
          </button>
          <button
            type="button"
            className={`group-btn ${group === '2' ? 'on' : ''}`}
            onClick={() => setGroup('2')}
          >
            Groupe 2
          </button>
        </div>
      </div>
      <button
        type="submit"
        className="btn btn-primary"
        disabled={!name.trim() || !group}
      >
        Commencer →
      </button>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Menu des sets
// ---------------------------------------------------------------------------
function Menu({ name, scores, onOpen }) {
  return (
    <div className="menu">
      <h1 className="menu-title">Bonjour {name} 👋</h1>
      <p className="lead">Choisis un set d’exercices :</p>
      <div className="set-list">
        {SETS.map((set) => {
          const sc = scores[set.id]
          return (
            <button
              key={set.id}
              className="set-item"
              onClick={() => onOpen(set.id)}
            >
              <span className="set-item-icon">{set.icon}</span>
              <span className="set-item-main">
                <span className="set-item-title">
                  {set.num}. {set.title}
                </span>
                <span className="set-item-sub">{set.subtitle}</span>
              </span>
              <span className="set-item-badge">
                {set.kind === 'links' ? (
                  <span className="badge-links">{set.links.length} liens 🔗</span>
                ) : sc ? (
                  <span className={`badge-grade ${sc.cls}`}>
                    {sc.grade}
                    <small>
                      {sc.correct}/{sc.answered}
                    </small>
                  </span>
                ) : (
                  <span className="badge-todo">à faire →</span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Vue d'un set (aiguillage)
// ---------------------------------------------------------------------------
function SetView({ set, name, group, linkReactions, onReact, onRecord, onBack }) {
  return (
    <div className="setview">
      <button className="back-link" onClick={onBack}>
        ← Menu
      </button>
      <div className="setview-head">
        <span className="setview-icon">{set.icon}</span>
        <h1 className="setview-title">{set.title}</h1>
      </div>
      {set.kind === 'links' ? (
        <LinksView set={set} linkReactions={linkReactions} onReact={onReact} />
      ) : (
        <ExerciseRunner
          set={set}
          name={name}
          group={group}
          onRecord={onRecord}
          onBack={onBack}
        />
      )}
    </div>
  )
}

function LinksView({ set, linkReactions, onReact }) {
  return (
    <div className="links-view">
      <p className="links-intro">💡 {set.intro}</p>
      <p className="links-rate">
        Après chaque exercice, dis-nous si tu as aimé 👍 ou pas 👎 !
      </p>
      <ul className="links-list">
        {set.links.map((l) => {
          const reaction = linkReactions[l.url] || ''
          return (
            <li key={l.url}>
              <a
                className="link-title"
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {l.title} ↗
              </a>
              <span className="link-react">
                <button
                  type="button"
                  className={`react-btn ${reaction === 'up' ? 'on' : ''}`}
                  title="J’aime"
                  aria-label="J’aime"
                  onClick={() => onReact(l, 'up')}
                >
                  👍
                </button>
                <button
                  type="button"
                  className={`react-btn ${reaction === 'down' ? 'on down' : ''}`}
                  title="J’ai pas aimé"
                  aria-label="J’ai pas aimé"
                  onClick={() => onReact(l, 'down')}
                >
                  👎
                </button>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Moteur d'exercices (noté)
// ---------------------------------------------------------------------------
function ExerciseRunner({ set, name, group, onRecord, onBack }) {
  const cards = set.cards
  const paced = !!set.paced
  const [answers, setAnswers] = useState({})
  const [idx, setIdx] = useState(0) // paced : carte courante
  const [cardChecked, setCardChecked] = useState(false) // paced : carte validée ?
  const [graded, setGraded] = useState(false)
  const topRef = useRef(null)

  const setAnswer = (k, v) => setAnswers((a) => ({ ...a, [k]: v }))

  // Chaque validation / passage change d'écran → on remonte tout en haut.
  useEffect(() => {
    if (topRef.current) topRef.current.scrollIntoView({ block: 'start' })
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [idx, cardChecked, graded])

  function reset() {
    setAnswers({})
    setIdx(0)
    setCardChecked(false)
    setGraded(false)
  }

  if (graded) {
    return (
      <GradeScreen
        name={name}
        group={group}
        set={set}
        answers={answers}
        onRecord={onRecord}
        onBack={onBack}
        onRetry={reset}
      />
    )
  }

  // -------- paced : UNE carte par écran ------------------------------------
  if (paced) {
    const card = cards[idx]
    const isLast = idx === cards.length - 1
    return (
      <div ref={topRef}>
        <ProgressBar value={idx} total={cards.length} />
        <div className="cards">
          <CardView
            key={idx}
            card={card}
            cardIdx={idx}
            number={idx + 1}
            answers={answers}
            setAnswer={setAnswer}
            checked={cardChecked}
            showEn={false}
          />
        </div>
        {!cardChecked ? (
          <button
            className="btn btn-primary sticky-validate"
            onClick={() => setCardChecked(true)}
          >
            Valider
          </button>
        ) : isLast ? (
          <button className="btn btn-finish" onClick={() => setGraded(true)}>
            🏅 Voir mon niveau
          </button>
        ) : (
          <button
            className="btn btn-continue"
            onClick={() => {
              setIdx(idx + 1)
              setCardChecked(false)
            }}
          >
            Continuer →
          </button>
        )}
      </div>
    )
  }

  // -------- non paced : écran de saisie → écran de résultat ----------------
  return (
    <div ref={topRef}>
      {set.intro && <p className="links-intro">💡 {set.intro}</p>}
      <div className="cards">
        {cards.map((card, ci) => (
          <CardView
            key={ci}
            card={card}
            cardIdx={ci}
            number={ci + 1}
            answers={answers}
            setAnswer={setAnswer}
            checked={false}
            showEn={false}
          />
        ))}
      </div>
      <button
        className="btn btn-primary sticky-validate"
        onClick={() => setGraded(true)}
      >
        Valider mes réponses
      </button>
    </div>
  )
}

function ProgressBar({ value, total }) {
  const pct = Math.round((value / total) * 100)
  return (
    <div className="topline-paced">
      <div className="progress">
        <div className="progress-bar" style={{ width: `${pct}%` }} />
      </div>
      <span className="counter">
        {Math.min(value + 1, total)} / {total}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Cartes
// ---------------------------------------------------------------------------
function CardView(props) {
  const { card } = props
  if (card.kind === 'verbs') return <VerbsCard {...props} />
  if (card.kind === 'sentence') return <SentenceCard {...props} />
  return <SegmentedCard {...props} />
}

function VerbsCard({ card, cardIdx, answers, setAnswer, checked, showEn }) {
  return (
    <div className="ex-card">
      <div className="verb-list">
        {card.items.map((it, i) => {
          const key = `${cardIdx}:${i}`
          const val = answers[key] || ''
          const right = checked && isCorrect(val, it.answers)
          return (
            <div
              key={i}
              className={`verb-row ${checked ? (right ? 'ok' : 'ko') : ''}`}
            >
              <span className="verb-num">{i + 1}.</span>
              <span className="verb-inf">
                <em>{it.verb}</em>
                {showEn && <span className="verb-en"> ({it.verbEn})</span>}
              </span>
              <span className="arrow">→</span>
              <span className={`blank-wrap ${checked ? (right ? 'ok' : 'ko') : ''}`}>
                <input
                  className="blank blank-sm"
                  value={val}
                  disabled={checked}
                  onChange={(e) => setAnswer(key, e.target.value)}
                  placeholder="…"
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
                      🟠 <strong>{it.answers[0]}</strong>
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
            {card.items.map((it, i) => (
              <li key={i}>
                <em>{it.verb}</em> — {showEn ? it.ruleEn : it.rule}
                <div className="multi-example">
                  <RichText text={showEn ? it.exampleEn : it.example} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function SentenceCard({ card, cardIdx, number, answers, setAnswer, checked, showEn }) {
  const key = `${cardIdx}:0`
  const val = answers[key] || ''
  const right = checked && isCorrect(val, card.answers)
  const expected = card.answers[0] === '' ? '(rien)' : card.answers[0]
  return (
    <div
      className={`ex-card compact ${
        checked ? (right ? 'card-ok' : 'card-ko') : ''
      }`}
    >
      <p className="sentence">
        <span className="lead-num">{number}.</span> {card.before}
        <span className={`blank-wrap suffix ${checked ? (right ? 'ok' : 'ko') : ''}`}>
          <input
            className="blank blank-suffix"
            value={val}
            disabled={checked}
            onChange={(e) => setAnswer(key, e.target.value)}
            placeholder="…"
            aria-label="terminaison de l’accord"
            autoComplete="off"
            spellCheck={false}
          />
        </span>
        {card.after}
        {checked && (
          <span className="inline-result">
            {right ? (
              '✅'
            ) : (
              <>
                🟠 <strong>{expected}</strong>
              </>
            )}
          </span>
        )}
      </p>
      {checked && card.rule && (
        <div className="reminder">
          <div className="reminder-rule">
            <span className="reminder-label">Règle&nbsp;:</span>{' '}
            {showEn ? card.ruleEn : card.rule}
          </div>
          {card.example && (
            <div className="examples">
              <span className="examples-label">
                {showEn ? 'Example:' : 'Exemple :'}
              </span>
              <div className="example-line">
                <RichText text={showEn ? card.exampleEn : card.example} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SegmentedCard({ card, cardIdx, answers, setAnswer, checked, showEn }) {
  let bi = -1
  return (
    <div className="ex-card seg-card">
      {card.instruction && <p className="seg-instruction">{card.instruction}</p>}
      <p className="seg-text">
        {card.segments.map((s, i) => {
          if (typeof s === 'string') return <Fragment key={i}>{s}</Fragment>
          bi += 1
          const idx = bi
          const key = `${cardIdx}:${idx}`
          const val = answers[key] || ''
          const right = isCorrect(val, [s.a])
          const cls = checked ? (right ? 'ok' : 'ko') : ''
          if (s.t === 'select') {
            return (
              <span key={i} className={`seg-blank ${cls}`}>
                <select
                  value={val}
                  disabled={checked}
                  onChange={(e) => setAnswer(key, e.target.value)}
                >
                  <option value="">—</option>
                  {s.o.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                {checked && !right && <span className="seg-correct">{s.a}</span>}
              </span>
            )
          }
          return (
            <span key={i} className={`seg-blank ${cls}`}>
              <input
                className="blank blank-inline"
                value={val}
                disabled={checked}
                onChange={(e) => setAnswer(key, e.target.value)}
                placeholder="…"
                autoComplete="off"
                spellCheck={false}
              />
              {s.hint && <span className="blank-hint">({s.hint})</span>}
              {checked && !right && <span className="seg-correct">{s.a}</span>}
            </span>
          )
        })}
      </p>
      {checked && card.tip && (
        <div className="reminder seg-tip">
          <span className="reminder-label">💡 {showEn ? 'Tip:' : 'Astuce :'}</span>{' '}
          {showEn ? card.tipEn : card.tip}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Écran de niveau (grade)
// ---------------------------------------------------------------------------
function GradeScreen({ name, group, set, answers, onRecord, onBack, onRetry }) {
  let correct = 0
  let answered = 0
  set.cards.forEach((card, ci) => {
    blanksOf(card).forEach((bl, bi) => {
      answered++
      if (isCorrect(answers[`${ci}:${bi}`] || '', bl.answers)) correct++
    })
  })
  const percent = answered ? Math.round((correct / answered) * 100) : 0
  const scoreStr = `${correct} / ${answered}`
  const tier = getTier(percent)
  const dateStr = new Date().toLocaleString('fr-FR')
  const doneRef = useRef(false)
  const [showEn, setShowEn] = useState(false)

  useEffect(() => {
    if (doneRef.current) return
    doneRef.current = true
    onRecord(set.id, correct, answered)
    logStat({
      name,
      group: group ? `Groupe ${group}` : '',
      setId: set.id,
      set: set.title,
      score: scoreStr,
      correct,
      answered,
      percent,
      grade: tier.name,
      date: dateStr,
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
        {name} — set « {set.title} »
      </p>
      <div className="scorebox">
        <div className="score-big">{scoreStr}</div>
        <div className="score-sub">bonnes réponses · {percent}% de réussite</div>
      </div>
      <div className={`tier-message ${tier.cls}`}>{tier.message}</div>

      {percent === 100 && set.rewardVideo && (
        <div className="reward">
          <div className="reward-title">
            🎁 Récompense de Légende : ta chanson&nbsp;! 🎵
          </div>
          <div className="reward-video">
            <iframe
              src={`https://www.youtube.com/embed/${set.rewardVideo}`}
              title="Chanson récompense"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      )}

      <TierLadder currentCls={tier.cls} />

      <details className="corrige" open>
        <summary>Voir le corrigé</summary>
        <div className="set-header set-header-tools">
          <button
            type="button"
            className="link-btn set-lang"
            onClick={() => setShowEn((s) => !s)}
          >
            🇬🇧 {showEn ? 'français' : 'anglais'}
          </button>
        </div>
        <div className="cards corrige-cards">
          {set.cards.map((card, ci) => (
            <CardView
              key={ci}
              card={card}
              cardIdx={ci}
              number={ci + 1}
              answers={answers}
              setAnswer={() => {}}
              checked
              showEn={showEn}
            />
          ))}
        </div>
      </details>

      <div className="end-actions">
        <button className="btn btn-primary" onClick={onBack}>
          ← Retour au menu
        </button>
        <button className="btn btn-secondary" onClick={onRetry}>
          🔁 Refaire ce set
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Emblèmes aquarelle + niveaux (thème héroïque)
// ---------------------------------------------------------------------------
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
      <WcMedallion id="lg" label="Légende" skyFrom="#fffbeb" skyTo="#f59e0b" border="#a16207"
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
          </>
        }
      />
    )
  }
  if (cls === 'tier-heros') {
    return (
      <WcMedallion id="he" label="Héros" skyFrom="#fef3c7" skyTo="#fb923c" border="#b45309"
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
      <WcMedallion id="ch" label="Champion" skyFrom="#f5f3ff" skyTo="#a78bfa" border="#6d28d9"
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
      <WcMedallion id="av" label="Aventurier" skyFrom="#eff6ff" skyTo="#60a5fa" border="#1d4ed8"
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
            <polygon points="100,90 109,120 100,111 91,120" fill="#ef4444" />
            <polygon points="100,150 91,120 100,129 109,120" fill="#1d4ed8" />
            <circle cx="100" cy="120" r="5" fill="#1d4ed8" />
          </>
        }
      />
    )
  }
  return (
    <WcMedallion id="ap" label="Apprenti" skyFrom="#fef9c3" skyTo="#86efac" border="#15803d"
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
        </>
      }
    />
  )
}

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

function getTier(percent) {
  if (percent >= 100)
    return { name: 'Légende', emoji: '🏆', cls: 'tier-legende', message: '100 % ! Tu es une LÉGENDE ! Personne ne t’arrête : tu maîtrises vraiment ce set.' }
  if (percent >= 95)
    return { name: 'Héros', emoji: '🦸', cls: 'tier-heros', message: 'Impressionnant, tu es un vrai Héros ! Il te manque juste un souffle pour atteindre 100 % et devenir une Légende !' }
  if (percent >= 75)
    return { name: 'Champion', emoji: '🏅', cls: 'tier-champion', message: 'Wouah ! Quel Champion ! Oseras-tu refaire ce set pour aller jusqu’à 100 % et devenir une Légende ?' }
  if (percent >= 50)
    return { name: 'Aventurier', emoji: '🧭', cls: 'tier-aventurier', message: 'Tu es un Aventurier ! Refais ce set pour devenir encore meilleur… Sers-toi de tes fiches de grammaire.' }
  return { name: 'Apprenti', emoji: '🌱', cls: 'tier-apprenti', message: 'Tu es un Apprenti ! Refais ce set pour monter de niveau ! Tu vas y arriver. Sers-toi de tes fiches de grammaire.' }
}
