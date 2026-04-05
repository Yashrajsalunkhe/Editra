/**
 * UploadBox.jsx - PDF File upload component
 * 
 * Features:
 * - Drag & drop support
 * - Click to browse
 * - PDF file type validation
 * - Upload progress animation
 */

import { useState, useRef, useCallback } from 'react'

export default function UploadBox({ onUpload, isUploading }) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  /**
   * Validate that the file is a PDF
   */
  const validateFile = (file) => {
    if (!file) return false
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file only.')
      return false
    }
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      alert('File size must be under 50MB.')
      return false
    }
    return true
  }

  const handleFile = useCallback((file) => {
    if (validateFile(file)) {
      onUpload(file)
    }
  }, [onUpload])

  /* Drag & Drop handlers */
  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer?.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleInputChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  return (
    <div className="w-full max-w-xl animate-fade-in">
      {/* Upload Zone */}
      <div
        className={`glass-card relative overflow-hidden cursor-pointer group transition-all duration-300 ${
          isDragging ? 'scale-[1.02]' : ''
        }`}
        style={{
          borderColor: isDragging ? 'var(--color-primary-400)' : undefined,
          boxShadow: isDragging ? 'var(--shadow-glow-strong)' : undefined,
        }}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        id="upload-zone"
      >
        {/* Gradient overlay on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
          }}
        />

        <div className="relative flex flex-col items-center gap-5 py-16 px-8">
          {/* Upload Icon */}
          <div
            className="relative w-20 h-20 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.1))',
              border: '1px solid rgba(99, 102, 241, 0.2)',
            }}
          >
            {isUploading ? (
              <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
            ) : (
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-primary-400)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-300 group-hover:-translate-y-1"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            )}

            {/* Decorative ring */}
            <div
              className="absolute inset-0 rounded-2xl pulse-glow"
              style={{ border: '1px solid rgba(99, 102, 241, 0.1)' }}
            />
          </div>

          {/* Text Content */}
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              {isUploading ? 'Uploading...' : 'Upload your PDF'}
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {isUploading
                ? 'Processing your document'
                : 'Drag & drop or click to browse'}
            </p>
          </div>

          {/* Accepted format info */}
          {!isUploading && (
            <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                PDF only
              </span>
              <span>•</span>
              <span>Max 50MB</span>
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={handleInputChange}
          id="file-input"
        />
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-3 gap-3 mt-6">
        {[
          { icon: '✏️', label: 'Edit Text', desc: 'Click to modify' },
          { icon: '📄', label: 'Multi-page', desc: 'Navigate pages' },
          { icon: '💾', label: 'Download', desc: 'Save changes' },
        ].map((feature) => (
          <div
            key={feature.label}
            className="glass-card flex flex-col items-center gap-1.5 py-4 px-3 text-center"
          >
            <span className="text-xl">{feature.icon}</span>
            <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
              {feature.label}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {feature.desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
