import { useMemo, useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import { useApp } from '../context/AppContext'
import { money, fDate } from '../utils/formatters'
import { CAT_COLORS, catLabel, catClass } from '../utils/categories'

function AutoBounds({ positions }) {
  const map = useMap()
  useEffect(() => {
    if (positions.length > 0) {
      map.fitBounds(positions, { padding: [40, 40], maxZoom: 14 })
    }
  }, [map, positions])
  return null
}

export default function MapPage() {
  const { items, loading, error, openEdit } = useApp()

  const mappable = useMemo(
    () => items.filter(i => i.estado === 'ACTIVA' && i.latitud != null && i.longitud != null),
    [items]
  )

  const positions = mappable.map(i => [i.latitud, i.longitud])

  if (loading) return <div className="page-loading"><span className="spinner" /></div>
  if (error) return <div className="page-error"><span>⚠ {error}</span></div>

  return (
    <div className="page map-page">
      <div className="map-header">
        <h1 className="page-title">Mapa</h1>
        <span className="map-count">{mappable.length} campaña{mappable.length !== 1 ? 's' : ''} activa{mappable.length !== 1 ? 's' : ''} con ubicación</span>
      </div>

      <div className="map-container">
        <MapContainer
          center={[-33.45, -70.66]}
          zoom={10}
          style={{ height: '100%', width: '100%', borderRadius: 12 }}
          scrollWheelZoom
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {positions.length > 0 && <AutoBounds positions={positions} />}
          {mappable.map(item => (
            <CircleMarker
              key={item.id}
              center={[item.latitud, item.longitud]}
              radius={10}
              pathOptions={{
                color: CAT_COLORS[item.categoria],
                fillColor: CAT_COLORS[item.categoria],
                fillOpacity: 0.85,
                weight: 2,
              }}
            >
              <Popup>
                <div className="map-popup">
                  <strong>{item.titulo}</strong>
                  <span className={`cat-chip ${catClass(item.categoria)}`}>{catLabel(item.categoria)}</span>
                  <p>{fDate(item.fecha)} · {item.hora}</p>
                  <p>{money(item.precio + item.cans_cost)}</p>
                  {item.lugar?.nombre && <p className="popup-loc">{item.lugar.nombre}</p>}
                  <div className="popup-actions">
                    <button className="btn btn-sm btn-primary" onClick={() => openEdit(item.id)}>
                      Editar
                    </button>
                    <a
                      href={`https://www.google.com/maps?q=${item.latitud},${item.longitud}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-outline"
                    >
                      Google Maps
                    </a>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        {mappable.length === 0 && (
          <div className="map-empty">
            <p className="map-empty-title">Sin campañas activas con ubicación</p>
            <p className="map-empty-sub">Las campañas en estado ACTIVA con coordenadas aparecen aquí.<br />Edita una campaña para asignarle una ubicación.</p>
          </div>
        )}
      </div>

      <div className="map-legend">
        {Object.entries(CAT_COLORS).map(([cat, color]) => (
          <span key={cat} className="legend-item">
            <span className="legend-dot" style={{ background: color }} />
            {catLabel(cat)}
          </span>
        ))}
      </div>
    </div>
  )
}
