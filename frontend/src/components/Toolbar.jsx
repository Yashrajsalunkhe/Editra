/**
 * Toolbar.jsx - Top navigation bar with editor controls
 * 
 * Features:
 * - App branding
 * - File name display
 * - Edit count badge
 * - Undo, Download, and Reset actions
 */

import { useState } from 'react'

/* ---------- SVG Icon Components ---------- */
const Icons = {
  Logo: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  Undo: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  ),
  Download: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Close: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
}

export default function Toolbar({
  fileName,
  isUploaded,
  editCount,
  onUndo,
  onDownload,
  onReset,
}) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    await onDownload()
    setIsDownloading(false)
  }

  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-5 py-3"
      style={{
        background: 'rgba(15, 15, 26, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--surface-border)',
      }}
    >
      {/* Left: Branding */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-9 h-9 rounded-lg"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-accent-500))',
          }}
        >
          <Icons.Logo />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Editra
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)', marginTop: '-2px' }}>
            PDF Editor
          </p>
        </div>
      </div>

      {/* Center: File info */}
      {fileName && (
        <div className="hidden sm:flex items-center gap-3 animate-fade-in">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
            style={{
              background: 'var(--surface-elevated)',
              border: '1px solid var(--surface-border)',
              color: 'var(--text-secondary)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span className="max-w-[200px] truncate">{fileName}</span>
          </div>

          {editCount > 0 && (
            <span className="badge-success badge">
              {editCount} edit{editCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {isUploaded && (
          <>
            {/* Undo Button */}
            <button
              className="btn-icon tooltip"
              data-tooltip="Undo last edit"
              onClick={onUndo}
              disabled={editCount === 0}
              style={{ opacity: editCount === 0 ? 0.4 : 1 }}
              id="btn-undo"
            >
              <Icons.Undo />
            </button>

            {/* Download Button */}
            <button
              className="btn-primary"
              onClick={handleDownload}
              disabled={isDownloading}
              id="btn-download"
            >
              {isDownloading ? (
                <span className="spinner" style={{ width: 16, height: 16 }} />
              ) : (
                <Icons.Download />
              )}
              <span className="hidden sm:inline">Download</span>
            </button>

            {/* Reset / Close */}
            <button
              className="btn-icon tooltip"
              data-tooltip="Close file"
              onClick={onReset}
              id="btn-reset"
            >
              <Icons.Close />
            </button>
          </>
        )}
      </div>
    </header>
  )
}
