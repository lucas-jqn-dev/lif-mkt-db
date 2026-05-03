import ReactDOM from 'react-dom'

export default function ConfirmDialog({ titulo, onConfirm, onCancel }) {
  return ReactDOM.createPortal(
    <div className="overlay" onClick={onCancel}>
      <div className="dialog" onClick={e => e.stopPropagation()}>
        <h3 className="dialog-title">¿Eliminar campaña?</h3>
        {titulo && (
          <p className="dialog-campaign-name">{titulo}</p>
        )}
        <p className="dialog-body">Esta acción no se puede deshacer.</p>
        <div className="dialog-actions">
          <button className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
          <button className="btn btn-danger" onClick={onConfirm}>Eliminar</button>
        </div>
      </div>
    </div>,
    document.body
  )
}
