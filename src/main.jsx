import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import TeacherApp from './TeacherApp.jsx'
import './styles.css'

const isTeacher =
  window.location.pathname.replace(/\/+$/, '') === '/enseignant'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isTeacher ? <TeacherApp /> : <App />}
  </React.StrictMode>,
)
