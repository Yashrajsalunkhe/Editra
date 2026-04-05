/**
 * TextOverlay.jsx - Editable text overlay for PDF text spans
 * 
 * Renders an input field at the position of a clicked text span,
 * allowing the user to edit PDF text in-place.
 * 
 * Props:
 * - span: { text, x, y, width, height, fontSize } - the text span data
 * - scale: current zoom scale of the PDF canvas
 * - pageNumber: current page number
 * - onSubmit: callback when edit is submitted
 * - onCancel: callback when edit is cancelled
 */

import { useState, useRef, useEffect } from 'react'

export default function TextOverlay({ span, scale, pageNumber, onSubmit, onCancel }) {
  const [value, setValue] = useState(span.text)
  const inputRef = useRef(null)

  // Auto-focus and select text on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [])

  /**
   * Handle submission of the edited text
   */
  const handleSubmit = () => {
    const trimmed = value.trim()
    // Only submit if text actually changed
    if (trimmed && trimmed !== span.text) {
      onSubmit({
        page: pageNumber,
        old_text: span.text,
        new_text: trimmed,
        x: span.x,
        y: span.y,
      })
    } else {
      onCancel()
    }
  }

  /**
   * Handle keyboard events
   * Enter → submit, Escape → cancel
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    }
  }

  // Calculate position and dimensions based on scale
  const style = {
    position: 'absolute',
    left: `${span.x * scale}px`,
    top: `${span.y * scale}px`,
    width: `${Math.max(span.width * scale, 100)}px`,
    minHeight: `${span.height * scale}px`,
    fontSize: `${(span.fontSize || 12) * scale}px`,
    lineHeight: `${span.height * scale}px`,
    padding: '2px 4px',
    background: 'rgba(99, 102, 241, 0.12)',
    border: '2px solid var(--color-primary-400)',
    borderRadius: '4px',
    color: '#000',
    fontFamily: 'sans-serif',
    outline: 'none',
    zIndex: 20,
    boxShadow: '0 0 16px rgba(99, 102, 241, 0.3)',
    boxSizing: 'border-box',
  }

  return (
    <>
      {/* Semi-transparent backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(0, 0, 0, 0.15)',
          zIndex: 15,
          cursor: 'default',
        }}
        onClick={onCancel}
      />

      {/* Editable input field */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSubmit}
        style={style}
        id="text-overlay-input"
      />

      {/* Action hints */}
      <div
        className="absolute flex items-center gap-2"
        style={{
          left: `${span.x * scale}px`,
          top: `${(span.y + span.height) * scale + 6}px`,
          zIndex: 25,
        }}
      >
        <span
          className="text-xs px-2 py-0.5 rounded"
          style={{
            background: 'var(--surface-elevated)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--surface-border)',
            fontSize: '10px',
          }}
        >
          Enter ↵ to save
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded"
          style={{
            background: 'var(--surface-elevated)',
            color: 'var(--text-muted)',
            border: '1px solid var(--surface-border)',
            fontSize: '10px',
          }}
        >
          Esc to cancel
        </span>
      </div>
    </>
  )
}
