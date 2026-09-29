import { useEffect, useState } from 'react'
import { statsConfig, isStatsConfigured } from './statsConfig'
import { supabase } from './supabaseClient'

// ---------------------------------------------------------------------------
// Communication Google Sheet (JSONP lectures, POST ecritures) - donnees eleves
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
    script.src = statsConfig.sheetsUrl + sep + qs + '&_t=' + Date.now() + '&callback=' + cb
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
  const [phase, setPhase] = useState('login') // login | register | dashboard
  const [teacher, setTeacher] = useState(null)
  const [students, setStudents] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState(false)
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
    const { data, error: rpcError } = await supabase.rpc('login_teacher', {
      p_prefixe: prefix,
      p_password: password,
    })
    setLoading(false)
    if (rpcError || !data || !data.ok) {
      setError('Identifiant ou mot de passe incorrect.')
      return
    }
    const t = {
      prefix: prefix.toUpperCase(),
      nom: data.nom || prefix,
      groups: data.groups || '',
    }
    setTeacher(t)
    saveSession(t)
    setPhase('dashboard')
    fetchData(t.prefix)
  }

  async function handleRegister(inviteCode, prefix, nom, password, groupes) {
    setLoading(true)
    setError('')
    const { data, error: rpcError } = await supabase.rpc('register_teacher', {
      p_invitation_code: inviteCode,
      p_prefixe: prefix,
      p_nom: nom,
      p_password: password,
      p_groupes: groupes,
    })
    setLoading(false)
    if (rpcError) {
      setError('Erreur de connexion. Veuillez reessayer.')
      return
    }
    if (!data || !data.ok) {
      setError(data?.error || 'Inscription impossible.')
      return
    }
    const t = {
      prefix: data.prefixe,
      nom: data.nom,
      groups: data.groupes || '',
    }
    setTeacher(t)
    saveSession(t)
    setPhase('dashboard')
    fetchData(t.prefix)
  }

  async function fetchData(prefix) {
    setLoading(true)
    setFetchError(false)
    let res = null
    try {
      const url =
        statsConfig.sheetsUrl +
        '?teacherStudents=' +
        encodeURIComponent(prefix) +
        '&_t=' +
        Date.now()
      const resp = await fetch(url, { redirect: 'follow' })
      res = await resp.json()
    } catch {
      res = await jsonpCall({ teacherStudents: prefix })
    }
    setLoading(false)
    if (res && res.students) {
      setStudents(res.students)
      setResults(res.results || [])
    } else {
      setStudents([])
      setResults([])
      setFetchError(true)
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
            onSwitchToRegister={() => {
              setError('')
              setPhase('register')
            }}
          />
        )}
        {phase === 'register' && (
          <TeacherRegister
            loading={loading}
            error={error}
            onRegister={handleRegister}
            onSwitchToLogin={() => {
              setError('')
              setPhase('login')
            }}
          />
        )}
        {phase === 'dashboard' && teacher && (
          <TeacherDashboard
            teacher={teacher}
            students={students}
            results={results}
            loading={loading}
            fetchError={fetchError}
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
// Ecran de connexion
// ---------------------------------------------------------------------------
function TeacherLogin({ loading, error, onLogin, onSwitchToRegister }) {
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
      <p className="auth-switch">
        Pas encore de compte ?{' '}
        <button type="button" className="link-btn" onClick={onSwitchToRegister}>
          Créer un compte
        </button>
      </p>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Ecran d'inscription (avec code d'invitation)
// ---------------------------------------------------------------------------
function TeacherRegister({ loading, error, onRegister, onSwitchToLogin }) {
  const [inviteCode, setInviteCode] = useState('')
  const [prefix, setPrefix] = useState('')
  const [nom, setNom] = useState('')
  const [password, setPassword] = useState('')
  const [groupes, setGroupes] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!inviteCode.trim() || !prefix.trim() || !nom.trim() || !password)
      return
    onRegister(
      inviteCode.trim(),
      prefix.trim().toUpperCase(),
      nom.trim(),
      password,
      groupes.trim()
    )
  }

  return (
    <form onSubmit={handleSubmit} className="welcome">
      <h1>Inscription enseignant</h1>
      <p className="lead">
        Vous avez reçu un code d'invitation ? Créez votre compte enseignant.
      </p>
      <label className="field">
        <span>Code d'invitation :</span>
        <input
          type="text"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          placeholder="Le code fourni par l'administrateur"
          autoFocus
          maxLength={40}
          autoComplete="off"
        />
      </label>
      <label className="field">
        <span>Votre préfixe (2-10 lettres, unique) :</span>
        <input
          type="text"
          value={prefix}
          onChange={(e) =>
            setPrefix(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))
          }
          placeholder="exemple : DUPONT"
          maxLength={10}
          autoComplete="off"
        />
        <small className="field-hint">
          Ce préfixe apparaîtra dans les codes de vos élèves (ex:{' '}
          {prefix || 'DUPONT'}-ABCD)
        </small>
      </label>
      <label className="field">
        <span>Votre nom :</span>
        <input
          type="text"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="exemple : Mme Dupont"
          maxLength={60}
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
      <label className="field">
        <span>Groupes (optionnel, séparez par des virgules) :</span>
        <input
          type="text"
          value={groupes}
          onChange={(e) => setGroupes(e.target.value)}
          placeholder="exemple : 1,2  ou laisser vide"
          maxLength={40}
        />
        <small className="field-hint">
          Si renseigné, vos élèves choisiront leur groupe à l'inscription.
        </small>
      </label>
      {error && <p className="teacher-error">{error}</p>}
      <button
        type="submit"
        className="btn btn-primary"
        disabled={
          !inviteCode.trim() ||
          !prefix.trim() ||
          !nom.trim() ||
          !password ||
          loading
        }
      >
        {loading ? 'Inscription…' : "S'inscrire"}
      </button>
      <p className="auth-switch">
        Déjà un compte ?{' '}
        <button type="button" className="link-btn" onClick={onSwitchToLogin}>
          Se connecter
        </button>
      </p>
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

function formatPercent(val) {
  if (!val && val !== 0) return ''
  const s = String(val)
  if (s.includes('%')) return s
  const n = parseFloat(s)
  if (isNaN(n)) return s
  return Math.round(n * 100) + '%'
}

function TeacherDashboard({
  teacher,
  students,
  results,
  loading,
  fetchError,
  codeCount,
  setCodeCount,
  generatedCodes,
  generating,
  onGenerateCodes,
  onRefresh,
  onLogout,
}) {
  const [filter, setFilter] = useState('')
  const hasGroups = !!(teacher.groups && teacher.groups.trim())

  const studentMap = {}
  students.forEach((s) => {
    studentMap[String(s.code).trim().toUpperCase()] = s
  })

  const enrichedResults = results.map((r) => {
    const info = studentMap[String(r.code).trim().toUpperCase()] || {}
    return { ...r, prenom: info.prenom || '', nom: info.nom || '', groupe: info.groupe || '' }
  })

  const needle = filter.trim().toLowerCase()
  const filteredResults = needle
    ? enrichedResults.filter((r) =>
        [r.code, r.prenom, r.nom, r.groupe, r.set, r.grade, r.date]
          .join(' ')
          .toLowerCase()
          .includes(needle)
      )
    : enrichedResults

  const registered = students.filter((s) => s.prenom || s.nom)
  const unused = students.filter((s) => !s.prenom && !s.nom)

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

      {fetchError && (
        <div className="teacher-warning">
          <strong>Impossible de charger les donnees.</strong> Verifiez que
          le Google Apps Script a bien ete mis a jour et redeploye
          (Extensions &gt; Apps Script &gt; Deployer &gt; Gerer les
          deployments &gt; Modifier &gt; Nouvelle version &gt; Deployer).
        </div>
      )}

      <section className="teacher-section">
        <h2>
          Résultats des élèves
          {registered.length > 0 && (
            <span className="count-badge">{registered.length}</span>
          )}
        </h2>
        {enrichedResults.length === 0 && !fetchError ? (
          <p className="teacher-empty">Aucun résultat pour le moment.</p>
        ) : (
          <>
            <input
              type="text"
              className="filter-input"
              placeholder="Filtrer par nom, prénom, code, set, niveau..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            {filteredResults.length === 0 ? (
              <p className="teacher-empty">Aucun résultat ne correspond au filtre.</p>
            ) : (
              <div className="table-wrap">
                <table className="teacher-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Code</th>
                      <th>Prénom</th>
                      <th>Nom</th>
                      {hasGroups && <th>Groupe</th>}
                      <th>Set</th>
                      <th>Score</th>
                      <th>Réussite</th>
                      <th>Niveau</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.map((r, i) => (
                      <tr key={i}>
                        <td className="date-cell">{r.date}</td>
                        <td className="code-cell">{r.code}</td>
                        <td>{r.prenom}</td>
                        <td>{r.nom}</td>
                        {hasGroups && <td>{r.groupe}</td>}
                        <td>{r.set}</td>
                        <td>{r.score}</td>
                        <td>{formatPercent(r.percent)}</td>
                        <td>
                          <span className={`score-pill ${gradeClass(r.grade)}`}>
                            {r.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>

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
