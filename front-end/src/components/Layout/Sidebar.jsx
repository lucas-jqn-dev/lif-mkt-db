import { NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import ConfirmDialog from '../ConfirmDialog'
import logo from '../../../assets/logo-lif-white.png'

const NAV_ITEMS = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor" aria-hidden>
        <rect x="1" y="1" width="6" height="6" rx="1.2" />
        <rect x="9" y="1" width="6" height="6" rx="1.2" />
        <rect x="1" y="9" width="6" height="6" rx="1.2" />
        <rect x="9" y="9" width="6" height="6" rx="1.2" />
      </svg>
    ),
  },
  {
    to: '/timeline',
    label: 'Timeline',
    icon: (
      <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden>
        <rect x="1.5" y="3" width="13" height="11.5" rx="1.5" />
        <line x1="5" y1="1" x2="5" y2="4.5" />
        <line x1="11" y1="1" x2="11" y2="4.5" />
        <line x1="1.5" y1="7" x2="14.5" y2="7" />
      </svg>
    ),
  },
  {
    to: '/map',
    label: 'Mapa',
    icon: (
      <svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor" aria-hidden>
        <path d="M8 1a4 4 0 0 1 4 4c0 3.2-4 9.5-4 9.5S4 8.2 4 5a4 4 0 0 1 4-4zm0 2.4a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2z" />
      </svg>
    ),
  },
  {
    to: '/all',
    label: 'Todas',
    icon: (
      <svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor" aria-hidden>
        <rect x="1" y="3" width="14" height="2" rx="1" />
        <rect x="1" y="7" width="14" height="2" rx="1" />
        <rect x="1" y="11" width="14" height="2" rx="1" />
      </svg>
    ),
  },
]

function SyncIndicator({ lastUpdated, hasError }) {
  const [, tick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => tick(n => n + 1), 15000)
    return () => clearInterval(id)
  }, [])

  if (hasError) {
    return <span className="sync-indicator sync-indicator--error">⚠ Sin conexión</span>
  }
  if (!lastUpdated) {
    return <span className="sync-indicator sync-indicator--idle">Cargando…</span>
  }
  const sec = Math.round((Date.now() - lastUpdated) / 1000)
  const label = sec < 60 ? `${sec}s` : `${Math.floor(sec / 60)}min`
  return <span className="sync-indicator sync-indicator--ok">● Actualizado hace {label}</span>
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const { lastUpdated, error } = useApp()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function close() { setOpen(false) }

  return (
    <>
      <button className="hamburger" onClick={() => setOpen(o => !o)} aria-label="Abrir menú">
        <span /><span /><span />
      </button>

      {open && <div className="sidebar-overlay" onClick={close} />}

      <nav className={`sidebar${open ? ' sidebar--open' : ''}`}>
        <div className="sidebar-logo-wrap">
          <img src={logo} alt="LIF Energy" className="sidebar-logo" />
          <span className="sidebar-brand">Marketing Hub</span>
        </div>

        <ul className="nav-list">
          {NAV_ITEMS.map(({ to, label, icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`}
                onClick={close}
              >
                <span className="nav-icon">{icon}</span>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="sidebar-bottom">
          <SyncIndicator lastUpdated={lastUpdated} hasError={!!error} />
          <div className="sidebar-user">
            <span className="user-name">{user?.username || user?.name || 'Usuario'}</span>
            <button className="btn-logout" onClick={() => setConfirmLogout(true)}>Salir</button>
          </div>
        </div>
      </nav>

      {confirmLogout && (
        <ConfirmDialog
          title="¿Cerrar sesión?"
          body={null}
          confirmLabel="Salir"
          onConfirm={handleLogout}
          onCancel={() => setConfirmLogout(false)}
        />
      )}
    </>
  )
}
