import { useState, useEffect, useCallback, useRef } from 'react'
import { itemsApi } from '../api/client'

function normalizeItem(raw) {
  return {
    id: raw._id || raw.id,
    titulo: (raw.titulo || '').toUpperCase(),
    categoria: raw.categoria || 'Otras',
    estado: raw.estado || 'EN IDEA',
    fecha: raw.fecha || '',
    hora: raw.hora || '',
    precio: Number(raw.precio) || 0,
    need_stand: Boolean(raw.need_stand),
    cans_amount: Number(raw.cans_amount) || 0,
    cans_cost: Number(raw.cans_cost) || 0,
    telefono: raw.telefono || '',
    correo: raw.correo || '',
    obs: raw.obs || '',
    latitud: raw.latitud != null ? Number(raw.latitud) : null,
    longitud: raw.longitud != null ? Number(raw.longitud) : null,
    lugar: raw.lugar || null,
  }
}

export function useItems(pollInterval = 10000) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const fetchingRef = useRef(false)
  const mountedRef = useRef(true)

  const fetchItems = useCallback(async () => {
    if (fetchingRef.current) return
    fetchingRef.current = true
    try {
      const { data } = await itemsApi.getAll()
      if (mountedRef.current) {
        setItems((data || []).map(normalizeItem))
        setError(null)
        setLastUpdated(Date.now())
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.response?.data?.message || err.message || 'Error al cargar datos')
      }
    } finally {
      fetchingRef.current = false
      if (mountedRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    fetchItems()
    return () => { mountedRef.current = false }
  }, [fetchItems])

  useEffect(() => {
    if (!pollInterval) return
    const id = setInterval(fetchItems, pollInterval)
    return () => clearInterval(id)
  }, [fetchItems, pollInterval])

  const refresh = useCallback(() => fetchItems(), [fetchItems])

  return { items, loading, error, lastUpdated, refresh }
}
