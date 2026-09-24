import { useEffect, useState } from 'react'
import { SETS } from './setsData'
import { statsConfig, isStatsConfigured } from './statsConfig'

// ---------------------------------------------------------------------------
// Communication Google Sheet (JSONP pour les lectures, POST pour les écritures)
// ---------------------------------------------------------------------------
function jsonpCall(params) {
  if (!isStatsConfigured()) return Promise.resolve(null)
  return new Promise((resolve) => {
    const cb = 'ppcb_' + Date.now() + '_' + Math.floor(Math.random() * 1e6)
    const script = document.createElement('script')
    let done = false
    const finish = (v) => {
      if (done) return
      done = true
      clearTimeout(timer)
      try {
        delete window[cb]
      } catch {
        /* ignore */
      }
      script.remove()
      resolve(v)
    }
    const timer = setTimeout(() => finish(null), 15000)
    window[cb] = (data) => finish(data)
    const sep = statsConfig.sheetsUrl.includes('?') ? '&' : '?'
    const qs = Object.entries(params)
      .map(([k, v]) => k + '=' + encodeURIComponent(v))
      .join('&')
    script.src = statsConfig.sheetsUrl + sep + qs + '&callback=' + cb
    script.onerror = () => finish(null)
    document.head.appendChild(script)
  })
}

function postData(payload) {
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

// Exclut les caractères ambigus (0/O, 1/I/L)
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
function generateRandomCode(prefix) {
  let suffix = ''
  for (let i = 0; i < 4; i++) {
    suffix += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  }
  return prefix + '-' + suffix
}

const SESSION_KEY = 'pp-teacher-session'

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
function saveSession(data) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data))
  } catch {
    /* ignore */
  }
}
function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// Composant principal enseignant
// ---------------------------------------------------------------------------
export default function TeacherApp() {
  const [phase, setPhase] = useState('login')
  const [teacher, setTeacher] = useState(null)
  const [students, setStudents] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [codeCount, setCodeCount] = useState(10)
  const [generatedCodes, setGeneratedCodes] = useState([])
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    const saved = loadSession()
    if (saved) {
      setTeacher(saved)
      setPhase('dashboard')
      fetchData(saved.prefix)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleLogin(prefix, password) {
    setLoading(true)
    setError('')
    const res = await jsonpCall({ teacherLogin: prefix, password })
    setLoading(false)
    if (!res || !res.ok) {
      setError('Identifiant ou mot de passe incorrect.')
      return
    }
    const t = {
      prefix: prefix.toUpperCase(),
      nom: res.nom || prefix,
      groups: res.groups || '',
    }
    setTeacher(t)
    saveSession(t)
    setPhase('dashboard')
    fetchData(t.prefix)
  }

  async function fetchData(prefix) {
    setLoading(true)
    const res = await jsonpCall({ teacherStudents: prefix })
    setLoading(false)
    if (res) {
      setStudents(res.students || [])
      setResults(res.results || [])
    }
  }

  function handleLogout() {
    clearSession()
    setTeacher(null)
    setStudents([])
    setResults([])
    setGeneratedCodes([])
    setPhase('login')
  }

  function handleGenerateCodes() {
    if (generating || !teacher) return
    setGenerating(true)
    const codes = []
    for (let i = 0; i < codeCount; i++) {
      codes.push(generateRandomCode(teacher.prefix))
    }
    postData({ type: 'generate-codes', enseignant: teacher.prefix, codes })
    setGeneratedCodes(codes)
    setGenerating(false)
    setTimeout(() => fetchData(teacher.prefix), 3000)
  }

  function handleRefresh() {
    if (teacher) fetchData(teacher.prefix)
  }

  return (
    <div className="page">
      <div className="card teacher-card">
        {phase === 'login' && (
          <TeacherLogin
            loading={loading}
            error={error}
            onLogin={handleLogin}
          />
        )}
        {phase === 'dashboard' && teacher && (
          <TeacherDashboard
            teacher={teacher}
            students={students}
            results={results}
            loading={loading}
            codeCount={codeCount}
            setCodeCount={setCodeCount}
            generatedCodes={generatedCodes}
            generating={generating}
            onGenerateCodes={handleGenerateCodes}
            onRefresh={handleRefresh}
            onLogout={handleLogout}
          />
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Écran de connexion enseignant
// ---------------------------------------------------------------------------
function TeacherLogin({ loading, error, onLogin }) {
  const [prefix, setPrefix] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!prefix.trim() || !password) return
    onLogin(prefix.trim().toUpperCase(), password)
  }

  return (
    <form onSubmit={handleSubmit} className="welcome">
      <h1>Espace enseignant</h1>
      <p className="lead">
        Connectez-vous pour voir les résultats de vos élèves et gérer leurs
        codes.
      </p>
      <label className="field">
        <span>Votre identifiant (préfixe) :</span>
        <input
          type="text"
          value={prefix}
          onChange={(e) => setPrefix(e.target.value.toUpperCase())}
          placeholder="exemple : PP"
          autoFocus
          maxLength={10}
          autoComplete="off"
        />
      </label>
      <label className="field">
        <span>Mot de passe :</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          maxLength={50}
        />
      </label>
      {error && <p className="teacher-error">{error}</p>}
      <button
        type="submit"
        className="btn btn-primary"
        disabled={!prefix.trim() || !password || loading}
      >
        {loading ? 'Vérification…' : 'Se connecter'}
      </button>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Tableau de bord
// ---------------------------------------------------------------------------
function gradeClass(grade) {
  if (!grade) return ''
  const g = grade.toLowerCase()
  if (g.includes('légende') || g.includes('legende')) return 'grade-legende'
  if (g.includes('héros') || g.includes('heros')) return 'grade-heros'
  if (g.includes('champion')) return 'grade-champion'
  if (g.includes('aventurier')) return 'grade-aventurier'
  return 'grade-apprenti'
}

function TeacherDashboard({
  teacher,
  students,
  results,
  loading,
  codeCount,
  setCodeCount,
  generatedCodes,
  generating,
  onGenerateCodes,
  onRefresh,
  onLogout,
}) {
  const hasGroups = !!(teacher.groups && teacher.groups.trim())
  const setTitles = SETS.map((s) => s.title)

  const studentRows = students.map((s) => {
    const code = String(s.code).trim().toUpperCase()
    const studentResults = results.filter(
      (r) => String(r.code).trim().toUpperCase() === code
    )
    const scoresBySet = {}
    studentResults.forEach((r) => {
      const title = r.set || ''
      const pct = Number(String(r.percent).replace('%', '')) || 0
      const existing = scoresBySet[title]
      if (!existing || pct > (Number(String(existing.percent).replace('%', '')) || 0)) {
        scoresBySet[title] = r
      }
    })
    return { ...s, scoresBySet }
  })

  const registered = studentRows.filter((s) => s.prenom || s.nom)
  const unused = studentRows.filter((s) => !s.prenom && !s.nom)

  return (
    <div className="teacher-dashboard">
      <div className="teacher-header">
        <h1>Bonjour, {teacher.nom}</h1>
        <div className="teacher-actions">
          <button
            className="btn btn-small"
            onClick={onRefresh}
            disabled={loading}
          >
            {loading ? 'Chargement…' : 'Actualiser'}
          </button>
          <button className="btn btn-small btn-outline" onClick={onLogout}>
            Déconnexion
          </button>
        </div>
      </div>

      {/* Résultats */}
      <section className="teacher-section">
        <h2>
          Résultats des élèves
          {registered.length > 0 && (
            <span className="count-badge">{registered.length}</span>
          )}
        </h2>
        {registered.length === 0 ? (
          <p className="teacher-empty">Aucun élève inscrit pour le moment.</p>
        ) : (
          <div className="table-wrap">
            <table className="teacher-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Prénom</th>
                  <th>Nom</th>
                  {hasGroups && <th>Groupe</th>}
                  {setTitles.map((t) => (
                    <th key={t} className="set-col">
                      {t}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {registered.map((s) => (
                  <tr key={s.code}>
                    <td className="code-cell">{s.code}</td>
                    <td>{s.prenom}</td>
                    <td>{s.nom}</td>
                    {hasGroups && <td>{s.groupe}</td>}
                    {setTitles.map((t) => {
                      const r = s.scoresBySet[t]
                      return (
                        <td key={t} className="score-cell">
                          {r ? (
                            <span
                              className={`score-pill ${gradeClass(r.grade)}`}
                            >
                              {r.percent} {r.grade}
                            </span>
                          ) : (
                            <span className="no-score">&ndash;</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Génération de codes */}
      <section className="teacher-section">
        <h2>Générer des codes</h2>
        <p className="teacher-info">
          Les codes seront associés à votre préfixe
          <strong> {teacher.prefix}</strong>. Distribuez-les à vos élèves.
        </p>
        <div className="generate-row">
          <label className="field field-inline">
            <span>Nombre :</span>
            <input
              type="number"
              min={1}
              max={50}
              value={codeCount}
              onChange={(e) =>
                setCodeCount(
                  Math.max(1, Math.min(50, Number(e.target.value) || 1))
                )
              }
            />
          </label>
          <button
            className="btn btn-primary"
            onClick={onGenerateCodes}
            disabled={generating}
          >
            Générer
          </button>
        </div>
        {generatedCodes.length > 0 && (
          <div className="generated-codes">
            <h3>Codes générés :</h3>
            <div className="codes-grid">
              {generatedCodes.map((c) => (
                <span key={c} className="code-chip">
                  {c}
                </span>
              ))}
            </div>
            <button
              className="btn btn-small"
              onClick={() => {
                navigator.clipboard
                  .writeText(generatedCodes.join('\n'))
                  .catch(() => {})
              }}
            >
              Copier tous les codes
            </button>
          </div>
        )}
      </section>

      {/* Codes non utilisés */}
      {unused.length > 0 && (
        <section className="teacher-section">
          <h2>
            Codes non utilisés
            <span className="count-badge">{unused.length}</span>
          </h2>
          <div className="codes-grid">
            {unused.map((s) => (
              <span key={s.code} className="code-chip code-unused">
                {s.code}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
