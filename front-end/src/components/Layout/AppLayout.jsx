import { Outlet } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import Sidebar from './Sidebar'
import CampaignModal from '../CampaignModal'
import ConfirmDialog from '../ConfirmDialog'
import Toast from '../Toast'

export default function AppLayout() {
  const {
    modal, openCreate, closeModal, refresh, showToast,
    confirm, closeConfirm, confirmDelete,
    toasts,
  } = useApp()

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>

      <button className="fab" onClick={openCreate} aria-label="Nueva campaña" title="Nueva campaña">
        <svg viewBox="0 0 20 20" width="22" height="22" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
          <line x1="10" y1="4" x2="10" y2="16" />
          <line x1="4" y1="10" x2="16" y2="10" />
        </svg>
      </button>

      {modal.open && (
        <CampaignModal
          editId={modal.editId}
          onClose={closeModal}
          onSaved={() => { closeModal(); refresh() }}
          showToast={showToast}
        />
      )}

      {confirm.open && (
        <ConfirmDialog
          titulo={confirm.titulo}
          onConfirm={confirmDelete}
          onCancel={closeConfirm}
        />
      )}

      <Toast toasts={toasts} />
    </div>
  )
}
