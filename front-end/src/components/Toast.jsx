import ReactDOM from 'react-dom'

export default function Toast({ toasts }) {
  if (toasts.length === 0) return null
  return ReactDOM.createPortal(
    <div className="toast-container">
      {toasts.map(({ id, message, type }) => (
        <div key={id} className={`toast toast--${type}`}>
          {message}
        </div>
      ))}
    </div>,
    document.body
  )
}
