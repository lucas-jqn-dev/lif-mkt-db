import ReactDOM from 'react-dom'

export default function ConfirmDialog({
  titulo,
  title = '¿Eliminar campaña?',
  body = 'Esta acción no se puede deshacer.',
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
}) {
  return ReactDOM.createPortal(
    <div className="overlay" onClick={onCancel}>
      <div className="dialog" onClick={e => e.stopPropagation()}>
        <h3 className="dialog-title">{title}</h3>
        {titulo && <p className="dialog-campaign-name">{titulo}</p>}
        {body && <p className="dialog-body">{body}</p>}
        <div className="dialog-actions">
          <button className="btn btn-ghost" onClick={onCancel}>{cancelLabel}</button>
          <button className="btn btn-danger" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>,
    document.body
  )
}
