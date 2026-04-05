/**
 * Toast.jsx - Notification toast component
 * 
 * Displays success/error messages with auto-dismiss
 */

export default function Toast({ message, type = 'success' }) {
  const icons = {
    success: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    error: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  }

  return (
    <div className={`toast toast-${type}`}>
      <div className="flex items-center gap-3">
        {icons[type]}
        <span>{message}</span>
      </div>
    </div>
  )
}
