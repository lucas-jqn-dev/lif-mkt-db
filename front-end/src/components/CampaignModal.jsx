import { useState, useEffect, useCallback, useRef } from 'react'
import ReactDOM from 'react-dom'
import { MapContainer, TileLayer, CircleMarker, useMapEvents, useMap } from 'react-leaflet'
import { useApp } from '../context/AppContext'
import { itemsApi } from '../api/client'
import { CATEGORIES, STATES } from '../utils/categories'

const EMPTY_FORM = {
  titulo: '',
  categoria: 'Influencer',
  estado: 'EN IDEA',
  fecha: '',
  hora: '',
  lat: null,
  lng: null,
  nombre: '',
  precio: '',
  need_stand: false,
  cans_amount: '',
  cans_cost: '',
  telefono: '',
  correo: '',
  obs: '',
}

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'es' } }
    )
    const data = await res.json()
    return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  }
}

async function forwardGeocode(query) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=ar,cl`,
    { headers: { 'Accept-Language': 'es' } }
  )
  const data = await res.json()
  return data[0] || null
}

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      reverseGeocode(lat, lng).then(nombre => onPick(lat, lng, nombre))
    },
  })
  return null
}

function FlyToMarker({ lat, lng }) {
  const map = useMap()
  useEffect(() => {
    if (lat != null && lng != null) {
      map.flyTo([lat, lng], map.getZoom() < 12 ? 13 : map.getZoom())
    }
  }, [lat, lng, map])
  return null
}

function LocationPicker({ lat, lng, nombre, onPick, hasError }) {
  const [search, setSearch] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchErr, setSearchErr] = useState('')

  async function handleSearch() {
    if (!search.trim()) return
    setSearching(true)
    setSearchErr('')
    try {
      const result = await forwardGeocode(search.trim())
      if (result) {
        onPick(parseFloat(result.lat), parseFloat(result.lon), result.display_name)
      } else {
        setSearchErr('No se encontraron resultados')
      }
    } catch {
      setSearchErr('Error al buscar')
    } finally {
      setSearching(false)
    }
  }

  const center = lat != null && lng != null ? [lat, lng] : [-33.45, -70.66]

  return (
    <div className={`location-picker${hasError ? ' location-picker--error' : ''}`}>
      <div className="location-search">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSearch() } }}
          placeholder="Buscar dirección..."
        />
        <button type="button" className="btn btn-outline btn-sm" onClick={handleSearch} disabled={searching}>
          {searching ? '…' : 'Buscar'}
        </button>
      </div>
      {searchErr && <p className="location-err">{searchErr}</p>}
      {nombre && <p className="location-name">{nombre}</p>}
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: 220, width: '100%', borderRadius: 8, marginTop: 8 }}
        scrollWheelZoom
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ClickHandler onPick={onPick} />
        {lat != null && lng != null && (
          <>
            <FlyToMarker lat={lat} lng={lng} />
            <CircleMarker
              center={[lat, lng]}
              radius={9}
              pathOptions={{ color: '#bb0c00', fillColor: '#bb0c00', fillOpacity: 1, weight: 2 }}
            />
          </>
        )}
      </MapContainer>
      <p className="location-hint">Haz clic en el mapa para seleccionar ubicación</p>
    </div>
  )
}

function validate(form) {
  const err = {}
  if (!form.titulo.trim()) err.titulo = 'El título es obligatorio'
  if (!form.fecha) err.fecha = 'La fecha es obligatoria'
  if (!form.hora) err.hora = 'La hora es obligatoria'
  if (!form.precio) err.precio = 'El costo del evento es obligatorio'
  if (form.lat == null || form.lng == null) err.location = 'Selecciona una ubicación en el mapa'
  if (form.cans_amount === '' || Number(form.cans_amount) < 0) err.cans_amount = 'Ingresa la cantidad de latas'
  if (form.cans_cost === '' || Number(form.cans_cost) < 0) err.cans_cost = 'Ingresa el costo de latas'
  return err
}

export default function CampaignModal({ editId, onClose, onSaved, showToast }) {
  const { items } = useApp()
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [showDirtyConfirm, setShowDirtyConfirm] = useState(false)
  const initialFormRef = useRef(JSON.stringify(EMPTY_FORM))

  useEffect(() => {
    if (editId) {
      const item = items.find(i => i.id === editId)
      if (item) {
        const filled = {
          titulo: item.titulo,
          categoria: item.categoria,
          estado: item.estado,
          fecha: item.fecha,
          hora: item.hora,
          lat: item.latitud,
          lng: item.longitud,
          nombre: item.lugar?.nombre || '',
          precio: item.precio !== 0 ? item.precio : '',
          need_stand: item.need_stand,
          cans_amount: item.cans_amount !== 0 ? item.cans_amount : '',
          cans_cost: item.cans_cost !== 0 ? item.cans_cost : '',
          telefono: item.telefono,
          correo: item.correo,
          obs: item.obs,
        }
        setForm(filled)
        initialFormRef.current = JSON.stringify(filled)
      }
    } else {
      initialFormRef.current = JSON.stringify(EMPTY_FORM)
    }
  }, [editId, items])

  const isDirty = JSON.stringify(form) !== initialFormRef.current

  function requestClose() {
    if (isDirty && !saving) {
      setShowDirtyConfirm(true)
    } else {
      onClose()
    }
  }

  const set = useCallback((name, value) => {
    setForm(f => ({ ...f, [name]: value }))
    setErrors(e => ({ ...e, [name]: undefined }))
  }, [])

  const field = name => ({
    value: form[name],
    onChange: e => set(name, e.target.value),
    className: errors[name] ? 'input-invalid' : '',
  })

  function handlePick(lat, lng, nombre) {
    setForm(f => ({ ...f, lat, lng, nombre }))
    setErrors(e => ({ ...e, location: undefined }))
  }

  async function handleSave(e) {
    e.preventDefault()
    const err = validate(form)
    if (Object.keys(err).length > 0) {
      setErrors(err)
      const firstErrKey = Object.keys(err)[0]
      document.querySelector(`[data-field="${firstErrKey}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setSaving(true)
    try {
      const payload = {
        titulo: form.titulo.trim().toUpperCase(),
        categoria: form.categoria,
        estado: form.estado,
        fecha: form.fecha,
        hora: form.hora,
        precio: Number(form.precio) || 0,
        need_stand: form.need_stand,
        cans_amount: Number(form.cans_amount) || 0,
        cans_cost: Number(form.cans_cost) || 0,
        telefono: form.telefono,
        correo: form.correo,
        obs: form.obs,
        latitud: form.lat,
        longitud: form.lng,
        lugar: { lat: form.lat, lng: form.lng, nombre: form.nombre },
      }
      if (editId) {
        await itemsApi.update(editId, payload)
        showToast('Campaña actualizada', 'ok')
      } else {
        await itemsApi.create(payload)
        showToast('Campaña creada', 'ok')
      }
      onSaved()
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al guardar', 'error')
    } finally {
      setSaving(false)
    }
  }

  return ReactDOM.createPortal(
    <div className="overlay" onClick={requestClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{editId ? 'Editar campaña' : 'Nueva campaña'}</h2>
          <button className="modal-close" onClick={requestClose} aria-label="Cerrar">✕</button>
        </div>

        <form className="modal-body" onSubmit={handleSave}>
          <div className="form-grid">

            {/* Título */}
            <div className="field-group field-group--span2" data-field="titulo">
              <label>Título *</label>
              <input type="text" placeholder="Nombre del evento" {...field('titulo')} />
              {errors.titulo && <span className="field-err">{errors.titulo}</span>}
            </div>

            {/* Categoría + Estado */}
            <div className="field-group">
              <label>Categoría</label>
              <select value={form.categoria} onChange={e => set('categoria', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="field-group">
              <label>Estado</label>
              <select value={form.estado} onChange={e => set('estado', e.target.value)}>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Fecha + Hora */}
            <div className="field-group" data-field="fecha">
              <label>Fecha *</label>
              <input type="date" {...field('fecha')} />
              {errors.fecha && <span className="field-err">{errors.fecha}</span>}
            </div>
            <div className="field-group" data-field="hora">
              <label>Hora *</label>
              <input type="time" {...field('hora')} />
              {errors.hora && <span className="field-err">{errors.hora}</span>}
            </div>

            {/* Ubicación — moved above cost fields */}
            <div className="field-group field-group--span2" data-field="location">
              <label>Ubicación *</label>
              {errors.location && <span className="field-err">{errors.location}</span>}
              <LocationPicker
                lat={form.lat}
                lng={form.lng}
                nombre={form.nombre}
                onPick={handlePick}
                hasError={!!errors.location}
              />
            </div>

            {/* Costo evento + Stand */}
            <div className="field-group">
              <label>Costo evento ($) *</label>
              <input type="number" min="0" placeholder="1500" {...field('precio')} />
              {errors.precio && <span className="field-err">{errors.precio}</span>}
            </div>
            <div className="field-group field-group--center">
              <label>¿Necesita llevar stand?</label>
              <input
                type="checkbox"
                checked={form.need_stand}
                onChange={e => set('need_stand', e.target.checked)}
                className="checkbox"
              />
            </div>

            {/* Latas */}
            <div className="field-group" data-field="cans_amount">
              <label>Cantidad de latas *</label>
              <input type="number" min="0" placeholder="0" {...field('cans_amount')} />
              {errors.cans_amount && <span className="field-err">{errors.cans_amount}</span>}
            </div>
            <div className="field-group" data-field="cans_cost">
              <label>Costo total en latas ($) *</label>
              <input type="number" min="0" placeholder="0" {...field('cans_cost')} />
              {errors.cans_cost && <span className="field-err">{errors.cans_cost}</span>}
            </div>

            {/* Contacto */}
            <div className="field-group">
              <label>Teléfono contacto</label>
              <input type="tel" placeholder="+56 9 0000 0000" {...field('telefono')} />
            </div>
            <div className="field-group">
              <label>Correo contacto</label>
              <input type="email" placeholder="contacto@ejemplo.com" {...field('correo')} />
            </div>

            {/* Obs */}
            <div className="field-group field-group--span2">
              <label>Observaciones</label>
              <textarea rows={2} placeholder="Notas adicionales..." {...field('obs')} />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={requestClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando…' : editId ? 'Actualizar' : 'Crear campaña'}
            </button>
          </div>
        </form>

        {/* Dirty-form close confirmation */}
        {showDirtyConfirm && (
          <div className="dirty-confirm-overlay" onClick={() => setShowDirtyConfirm(false)}>
            <div className="dirty-confirm" onClick={e => e.stopPropagation()}>
              <p className="dirty-confirm-text">Hay cambios sin guardar. ¿Salir de todas formas?</p>
              <div className="dirty-confirm-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => setShowDirtyConfirm(false)}>
                  Seguir editando
                </button>
                <button className="btn btn-danger btn-sm" onClick={onClose}>
                  Descartar cambios
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
