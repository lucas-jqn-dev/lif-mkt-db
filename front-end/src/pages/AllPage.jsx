import { useMemo, useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { money, fDate, daysAway } from '../utils/formatters'
import { CAT_COLORS, CATEGORIES, STATES, catLabel, catClass, estClass } from '../utils/categories'

const PAGE_SIZE = 50

export default function AllPage() {
  const { items, loading, error, openEdit, askDelete } = useApp()
  const [catFilter, setCatFilter] = useState(null)
  const [stateFilters, setStateFilters] = useState([])
  const [sortField, setSortField] = useState('fecha')
  const [sortDir, setSortDir] = useState('asc')
  const [limit, setLimit] = useState(PAGE_SIZE)

  const hasActiveFilters = catFilter !== null || stateFilters.length > 0

  function clearFilters() {
    setCatFilter(null)
    setStateFilters([])
  }

  // Reset pagination when filters/sort change
  useEffect(() => { setLimit(PAGE_SIZE) }, [catFilter, stateFilters, sortField, sortDir])

  function toggleState(s) {
    setStateFilters(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

  function handleSort(field) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const filtered = useMemo(() => {
    let list = [...items]
    if (catFilter) list = list.filter(i => i.categoria === catFilter)
    if (stateFilters.length > 0) list = list.filter(i => stateFilters.includes(i.estado))
    list.sort((a, b) => {
      let va = a[sortField] ?? ''
      let vb = b[sortField] ?? ''
      if (typeof va === 'string') va = va.toLowerCase()
      if (typeof vb === 'string') vb = vb.toLowerCase()
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return list
  }, [items, catFilter, stateFilters, sortField, sortDir])

  const visible = filtered.slice(0, limit)
  const hasMore = filtered.length > limit

  function SortIcon({ field }) {
    if (sortField !== field) return <span className="sort-icon">↕</span>
    return <span className="sort-icon sort-icon--active">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  if (loading) return <div className="page-loading"><span className="spinner" /></div>
  if (error) return <div className="page-error"><span>⚠ {error}</span></div>

  return (
    <div className="page all-page">
      <div className="page-header">
        <h1 className="page-title">Todas las campañas</h1>
        <span className="result-count">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="filters-bar">
        <div className="filter-group">
          <label>Categoría</label>
          <div className="chip-group">
            <button
              className={`chip${catFilter === null ? ' chip--active' : ''}`}
              onClick={() => setCatFilter(null)}
            >
              Todas
            </button>
            {CATEGORIES.map(c => (
              <button
                key={c}
                className={`chip${catFilter === c ? ' chip--active' : ''}`}
                style={catFilter === c ? { borderColor: CAT_COLORS[c], color: CAT_COLORS[c] } : {}}
                onClick={() => setCatFilter(prev => prev === c ? null : c)}
              >
                {catLabel(c)}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <label>Estado</label>
          <div className="chip-group">
            {STATES.map(s => (
              <button
                key={s}
                className={`chip${stateFilters.includes(s) ? ' chip--active' : ''}`}
                onClick={() => toggleState(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        {hasActiveFilters && (
          <div className="filter-group">
            <label>&nbsp;</label>
            <button className="btn btn-ghost btn-sm clear-filters-btn" onClick={clearFilters}>
              ✕ Limpiar filtros
            </button>
          </div>
        )}
      </div>

      <div className="table-wrap">
        <table className="campaign-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('titulo')} className="th-sortable">
                Campaña <SortIcon field="titulo" />
              </th>
              <th onClick={() => handleSort('categoria')} className="th-sortable">
                Categoría <SortIcon field="categoria" />
              </th>
              <th onClick={() => handleSort('fecha')} className="th-sortable">
                Fecha <SortIcon field="fecha" />
              </th>
              <th onClick={() => handleSort('estado')} className="th-sortable">
                Estado <SortIcon field="estado" />
              </th>
              <th onClick={() => handleSort('precio')} className="th-sortable">
                Costo <SortIcon field="precio" />
              </th>
              <th>Stand</th>
              <th>Contacto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={8} className="empty-row">Sin resultados para los filtros seleccionados</td>
              </tr>
            ) : (
              visible.map(item => {
                const away = daysAway(item.fecha)
                return (
                  <tr key={item.id}>
                    <td>
                      <span className="td-title">{item.titulo}</span>
                      {item.obs && <span className="td-obs">{item.obs}</span>}
                    </td>
                    <td>
                      <span className={`cat-chip ${catClass(item.categoria)}`}>{catLabel(item.categoria)}</span>
                    </td>
                    <td>
                      <span className="td-date">{fDate(item.fecha)} {item.hora}</span>
                      {away && <span className="days-away days-away--sm">{away}</span>}
                    </td>
                    <td>
                      <span className={`badge ${estClass(item.estado)}`}>{item.estado}</span>
                    </td>
                    <td>
                      <span className="td-money">{money(item.precio + item.cans_cost)}</span>
                      <span className="td-cans">{item.cans_amount} latas</span>
                    </td>
                    <td className="td-center">
                      {item.need_stand ? <span className="stand-yes">Sí</span> : <span className="stand-no">No</span>}
                    </td>
                    <td>
                      {item.telefono && <span className="td-contact">{item.telefono}</span>}
                      {item.correo && <span className="td-contact">{item.correo}</span>}
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-icon" onClick={() => openEdit(item.id)} title="Editar">✎</button>
                        <button className="btn-icon btn-icon--danger" onClick={() => askDelete(item.id, item.titulo)} title="Eliminar">✕</button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="load-more">
          <button className="btn btn-ghost" onClick={() => setLimit(l => l + PAGE_SIZE)}>
            Ver más <span className="load-more-count">({filtered.length - limit} restantes)</span>
          </button>
        </div>
      )}
    </div>
  )
}
