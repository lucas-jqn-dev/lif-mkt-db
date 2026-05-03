import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { money, fDate, daysAway } from '../utils/formatters'
import { CAT_COLORS, CATEGORIES, catLabel, catClass, estClass } from '../utils/categories'

function DonutChart({ segments, title }) {
  const size = 140
  const strokeW = 20
  const r = (size - strokeW) / 2
  const circ = 2 * Math.PI * r
  const cx = size / 2
  const cy = size / 2
  const total = segments.reduce((s, x) => s + x.value, 0)

  let angle = -90
  const arcs = segments
    .filter(s => s.value > 0)
    .map(({ value, color, cat }) => {
      const pct = value / total
      const dash = pct * circ
      const startAngle = angle
      angle += pct * 360
      return (
        <circle
          key={cat}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeW}
          strokeDasharray={`${dash} ${circ}`}
          style={{ transform: `rotate(${startAngle}deg)`, transformOrigin: `${cx}px ${cy}px` }}
        />
      )
    })

  return (
    <div className="donut-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#2a2a2a" strokeWidth={strokeW} />
        {total > 0 ? arcs : null}
        {total > 0 ? (
          <>
            <text x={cx} y={cy - 8} textAnchor="middle" fill="rgba(255,255,255,.4)" fontSize="9">TOTAL</text>
            <text x={cx} y={cy + 9} textAnchor="middle" fill="white" fontSize="10" fontWeight="700">
              {total >= 1_000_000
                ? `$${(total / 1_000_000).toFixed(1)}M`
                : total >= 1_000
                ? `$${(total / 1_000).toFixed(0)}K`
                : money(total)}
            </text>
          </>
        ) : (
          <text x={cx} y={cy + 4} textAnchor="middle" fill="rgba(255,255,255,.25)" fontSize="10">Sin datos</text>
        )}
      </svg>
      {title && <p className="donut-title">{title}</p>}
      <div className="donut-legend">
        {segments.filter(s => s.value > 0).map(({ color, cat }) => (
          <span key={cat} className="legend-item">
            <span className="legend-dot" style={{ background: color }} />
            {catLabel(cat)}
          </span>
        ))}
      </div>
    </div>
  )
}

function CampaignCard({ item, onEdit, onDelete }) {
  const away = daysAway(item.fecha)
  return (
    <div className="campaign-card">
      <div className="campaign-card-header">
        <span className="campaign-card-title">{item.titulo}</span>
        <span className={`badge ${estClass(item.estado)}`}>{item.estado}</span>
      </div>
      <div className="campaign-card-meta">
        <span>{fDate(item.fecha)} {item.hora}</span>
        {away && <span className="days-away">{away}</span>}
      </div>
      <div className="campaign-card-meta">
        <span>{money(item.precio + item.cans_cost)}</span>
        <span>{item.cans_amount} latas</span>
        {item.need_stand && <span className="stand-badge">Stand</span>}
      </div>
      {item.lugar?.nombre && (
        <p className="campaign-card-loc">{item.lugar.nombre}</p>
      )}
      <div className="campaign-card-actions">
        <button className="btn-icon" onClick={() => onEdit(item.id)} title="Editar">✎</button>
        <button className="btn-icon btn-icon--danger" onClick={() => onDelete(item.id, item.titulo)} title="Eliminar">✕</button>
      </div>
    </div>
  )
}

function Sk({ w = '100%', h = 16, r = 6 }) {
  return <span className="sk" style={{ width: w, height: h, borderRadius: r }} />
}

function DashboardSkeleton() {
  return (
    <div className="page dashboard-page">
      <Sk w={160} h={28} r={6} />

      {/* Stat cards */}
      <div className="stats-grid" style={{ marginTop: 24 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="stat-card" style={{ gap: 10 }}>
            <Sk w="55%" h={11} />
            <Sk w="70%" h={28} />
          </div>
        ))}
      </div>

      {/* Analytics row */}
      <div className="analytics-row">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <Sk w="60%" h={11} />
            <Sk w={140} h={140} r={70} />
            <div style={{ display: 'flex', gap: 8 }}>
              <Sk w={56} h={10} />
              <Sk w={56} h={10} />
            </div>
          </div>
        ))}
        <div className="card cans-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <Sk w="55%" h={11} />
          <Sk w={80} h={48} />
          <Sk w="70%" h={12} />
        </div>
      </div>

      {/* Campaign cards section */}
      {Array.from({ length: 2 }).map((_, si) => (
        <div key={si} className="cat-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <Sk w={10} h={10} r={5} />
            <Sk w={100} h={14} />
            <Sk w={28} h={20} r={99} />
          </div>
          <div className="campaign-cards">
            {Array.from({ length: 3 }).map((_, ci) => (
              <div key={ci} className="campaign-card" style={{ gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Sk w="60%" h={14} />
                  <Sk w={56} h={20} r={99} />
                </div>
                <Sk w="45%" h={11} />
                <Sk w="55%" h={11} />
                <Sk w="80%" h={10} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { items, loading, error, openEdit, askDelete, openCreate } = useApp()

  const stats = useMemo(() => {
    const draft = items.filter(i => i.estado === 'EN IDEA')
    const pending = items.filter(i => i.estado === 'ACTIVA' || i.estado === 'PAUSADA')
    const realizada = items.filter(i => i.estado === 'REALIZADA')
    const cancelada = items.filter(i => i.estado === 'CANCELADA')

    const pendingSpend = pending.reduce((s, i) => s + i.precio + i.cans_cost, 0)
    const completedSpend = realizada.reduce((s, i) => s + i.precio + i.cans_cost, 0)

    const pendingByCat = CATEGORIES.map(cat => ({
      cat,
      color: CAT_COLORS[cat],
      value: pending.filter(i => i.categoria === cat).reduce((s, i) => s + i.precio + i.cans_cost, 0),
    }))

    const completedByCat = CATEGORIES.map(cat => ({
      cat,
      color: CAT_COLORS[cat],
      value: realizada.filter(i => i.categoria === cat).reduce((s, i) => s + i.precio + i.cans_cost, 0),
    }))

    const totalCans = pending.reduce((s, i) => s + i.cans_amount, 0)
    const packs = Math.ceil(totalCans / 24)

    return { draft, pending, realizada, cancelada, pendingSpend, completedSpend, pendingByCat, completedByCat, totalCans, packs }
  }, [items])

  if (loading) return <DashboardSkeleton />
  if (error) return <div className="page-error"><span>⚠ {error}</span></div>

  if (items.length === 0) {
    return (
      <div className="page dashboard-page">
        <h1 className="page-title">Dashboard</h1>
        <div className="dashboard-empty">
          <div className="dashboard-empty-icon">◈</div>
          <h2>No hay campañas todavía</h2>
          <p>Crea la primera campaña para empezar a ver métricas y seguimiento.</p>
          <button className="btn btn-primary" onClick={openCreate}>
            + Crear primera campaña
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page dashboard-page">
      <h1 className="page-title">Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Campañas activas</span>
          <span className="stat-value">{stats.pending.length}</span>
        </div>
        <div className="stat-card stat-card--red">
          <span className="stat-label">Gasto pendiente</span>
          <span className="stat-value">{money(stats.pendingSpend)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Gasto completado</span>
          <span className="stat-value">{money(stats.completedSpend)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Canceladas</span>
          <span className="stat-value">{stats.cancelada.length}</span>
        </div>
        <div className="stat-card stat-card--draft">
          <span className="stat-label">Ideas / Borradores</span>
          <span className="stat-value stat-value--draft">{stats.draft.length}</span>
        </div>
      </div>

      <div className="analytics-row">
        <div className="card">
          <h2 className="card-title">Distribución pendiente</h2>
          <DonutChart segments={stats.pendingByCat} title="Por categoría" />
        </div>
        <div className="card">
          <h2 className="card-title">Distribución realizada</h2>
          <DonutChart segments={stats.completedByCat} title="Por categoría" />
        </div>
        <div className="card cans-card">
          <h2 className="card-title">Latas pendientes</h2>
          <div className="cans-value">{stats.totalCans.toLocaleString('es-CL')}</div>
          <div className="cans-sub">
            latas · <strong>{stats.packs}</strong> packs <span className="cans-note">(x24)</span>
          </div>
        </div>
      </div>

      {CATEGORIES.map(cat => {
        const catItems = stats.pending.filter(i => i.categoria === cat)
        if (catItems.length === 0) return null
        return (
          <section key={cat} className="cat-section">
            <h2 className="cat-section-title">
              <span className="cat-dot" style={{ background: CAT_COLORS[cat] }} />
              {catLabel(cat)}
              <span className="cat-count">{catItems.length}</span>
            </h2>
            <div className="campaign-cards">
              {catItems.map(item => (
                <CampaignCard key={item.id} item={item} onEdit={openEdit} onDelete={askDelete} />
              ))}
            </div>
          </section>
        )
      })}

      {stats.draft.length > 0 && (
        <section className="cat-section draft-section">
          <h2 className="cat-section-title">
            <span className="cat-dot" style={{ background: '#6B7280' }} />
            Ideas / Borradores
            <span className="cat-count">{stats.draft.length}</span>
            <span className="draft-note">No cuentan como gasto</span>
          </h2>
          <div className="campaign-cards">
            {stats.draft.map(item => (
              <CampaignCard key={item.id} item={item} onEdit={openEdit} onDelete={askDelete} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
