import { createContext, useContext, useState, useCallback } from 'react'
import { useItems } from '../hooks/useItems'
import { itemsApi } from '../api/client'

const AppContext = createContext(null)

const POLL_INTERVAL = Number(import.meta.env.VITE_POLL_INTERVAL) || 10000

export function AppProvider({ children }) {
  const { items, loading, error, lastUpdated, refresh } = useItems(POLL_INTERVAL)

  // Toasts — declared first so confirmDelete can reference showToast
  const [toasts, setToasts] = useState([])
  const showToast = useCallback((message, type = 'ok') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  // Modal
  const [modal, setModal] = useState({ open: false, editId: null })
  const openCreate = useCallback(() => setModal({ open: true, editId: null }), [])
  const openEdit = useCallback((id) => setModal({ open: true, editId: id }), [])
  const closeModal = useCallback(() => setModal({ open: false, editId: null }), [])

  // Confirm dialog — stores id + titulo so the dialog can show the name
  const [confirm, setConfirm] = useState({ open: false, id: null, titulo: '' })
  const askDelete = useCallback((id, titulo = '') => setConfirm({ open: true, id, titulo }), [])
  const closeConfirm = useCallback(() => setConfirm({ open: false, id: null, titulo: '' }), [])
  const confirmDelete = useCallback(async () => {
    if (!confirm.id) return
    try {
      await itemsApi.remove(confirm.id)
      closeConfirm()
      refresh()
      showToast('Campaña eliminada', 'ok')
    } catch {
      showToast('Error al eliminar', 'error')
    }
  }, [confirm.id, closeConfirm, refresh, showToast])

  return (
    <AppContext.Provider value={{
      items, loading, error, lastUpdated, refresh,
      modal, openCreate, openEdit, closeModal,
      confirm, askDelete, closeConfirm, confirmDelete,
      toasts, showToast,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
