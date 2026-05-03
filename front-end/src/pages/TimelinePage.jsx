import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { fDate, daysAway, money } from '../utils/formatters'
import { CAT_COLORS, CATEGORIES, STATES, catLabel, catClass, estClass } from '../utils/categories'

function formatDayHeader(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`)
  return d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function TimelinePage() {
  const { items, loading, error, openEdit, askDelete } = useApp()
  const [rangeDays, setRangeDays] = useState(30)
  const [catFilter, setCatFilter] = useState('all')
  const [stateFilter, setStateFilter] = useState('all')

  const hasActiveFilters = catFilter !== 'all' || stateFilter !== 'all'

  function clearFilters() {
    setCatFilter('all')
    setStateFilter('all')
  }

  const groups = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const limit = new Date(today)
    limit.setDate(today.getDate() + rangeDays)

    const filtered = items
      .filter(item => {
        if (!item.fecha) return false
        const d = new Date(`${item.fecha}T00:00:00`)
        if (d < today || d > limit) return false
        if (catFilter !== 'all' && item.categoria !== catFilter) return false
        if (stateFilter !== 'all' && item.estado !== stateFilter) return false
        return true
      })
      .sort((a, b) => a.fecha.localeCompare(b.fecha))

    const map = {}
    filtered.forEach(item => {
      if (!map[item.fecha]) map[item.fecha] = []
      map[item.fecha].push(item)
    })
    return Object.entries(map)
  }, [items, rangeDays, catFilter, stateFilter])

  const totalItems = groups.reduce((s, [, arr]) => s + arr.length, 0)

  if (loading) return <div className="page-loading"><span className="spinner" /></div>
  if (error) return <div className="page-error"><span>⚠ {error}</span></div>

  return (
    <div className="page timeline-page">
      <h1 className="page-title">Timeline</h1>

      <div className="filters-bar">
        <div className="filter-group">
          <label>Próximos {rangeDays} días</label>
          <input
            type="range"
            min={7} max={365} step={7}
            value={rangeDays}
            onChange={e => setRangeDays(Number(e.target.value))}
            className="range-slider"
          />
        </div>
        <div className="filter-group">
          <label>Categoría</label>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="select-filter">
            <option value="all">Todas</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{catLabel(c)}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Estado</label>
          <select value={stateFilter} onChange={e => setStateFilter(e.target.value)} className="select-filter">
            <option value="all">Todos</option>
            {STATES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        {hasActiveFilters && (
          <div className="filter-group filter-group--clear">
            <label>&nbsp;</label>
            <button className="btn btn-ghost btn-sm clear-filters-btn" onClick={clearFilters}>
              ✕ Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {groups.length === 0 ? (
        <div className="empty-state">No hay campañas en los próximos {rangeDays} días{hasActiveFilters ? ' con los filtros aplicados' : ''}</div>
      ) : (
        <div className="timeline">
          {groups.map(([date, dayItems]) => (
            <div key={date} className="timeline-day-group">
              <div className="timeline-day-sep">
                <span className="timeline-day-label">{formatDayHeader(date)}</span>
                <span className="timeline-day-count">{dayItems.length}</span>
              </div>
              {dayItems.map(item => {
                const away = daysAway(item.fecha)
                return (
                  <div key={item.id} className={`timeline-item ${catClass(item.categoria)}`}>
                    <div className="timeline-dot" style={{ background: CAT_COLORS[item.categoria] }} />
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span className="timeline-title">{item.titulo}</span>
                        <span className={`badge ${estClass(item.estado)}`}>{item.estado}</span>
                      </div>
                      <div className="timeline-meta">
                        <span className="timeline-date">
                          {item.hora}
                          {away && <span className="days-away">{away}</span>}
                        </span>
                        <span className={`cat-chip ${catClass(item.categoria)}`}>{catLabel(item.categoria)}</span>
                      </div>
                      <div className="timeline-row">
                        <span>{money(item.precio + item.cans_cost)}</span>
                        <span>{item.cans_amount} latas</span>
                        {item.need_stand && <span className="stand-badge">Stand</span>}
                      </div>
                      {item.lugar?.nombre && (
                        <p className="timeline-loc">{item.lugar.nombre}</p>
                      )}
                      {item.obs && <p className="timeline-obs">{item.obs}</p>}
                      <div className="timeline-actions">
                        <button className="btn-icon" onClick={() => openEdit(item.id)} title="Editar">✎</button>
                        <button className="btn-icon btn-icon--danger" onClick={() => askDelete(item.id, item.titulo)} title="Eliminar">✕</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
