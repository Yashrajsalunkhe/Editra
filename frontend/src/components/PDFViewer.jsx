/**
 * PDFViewer.jsx - Core PDF rendering and text editing component
 * 
 * Uses pdf.js (pdfjs-dist) to:
 * 1. Load and render PDF pages on a canvas
 * 2. Extract text content with positions
 * 3. Render clickable text spans as an overlay
 * 4. Allow inline text editing via TextOverlay
 * 
 * Supports multi-page navigation and zoom controls.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import TextOverlay from './TextOverlay'

// Configure pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).toString()

/* ---------- Zoom Levels ---------- */
const ZOOM_LEVELS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0]
const DEFAULT_ZOOM_INDEX = 2 // 1.0x

export default function PDFViewer({ file, isUploaded, onEdit }) {
  // --- State ---
  const [pdfDoc, setPdfDoc] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX)
  const [textSpans, setTextSpans] = useState([])
  const [activeSpan, setActiveSpan] = useState(null)
  const [isRendering, setIsRendering] = useState(false)
  const [renderKey, setRenderKey] = useState(0) // Force re-render after edit

  // --- Refs ---
  const canvasRef = useRef(null)
  const containerRef = useRef(null)

  const scale = ZOOM_LEVELS[zoomIndex]

  /**
   * Load PDF document when file changes
   */
  useEffect(() => {
    if (!file) return

    const loadPDF = async () => {
      try {
        const arrayBuffer = await file.arrayBuffer()
        const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        setPdfDoc(doc)
        setTotalPages(doc.numPages)
        setCurrentPage(1)
      } catch (err) {
        console.error('Failed to load PDF:', err)
      }
    }

    loadPDF()
  }, [file])

  /**
   * Render current page whenever page number, zoom, or renderKey changes
   */
  useEffect(() => {
    if (!pdfDoc) return

    const renderPage = async () => {
      setIsRendering(true)
      setActiveSpan(null)

      try {
        const page = await pdfDoc.getPage(currentPage)
        const viewport = page.getViewport({ scale })
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')

        // Set canvas dimensions
        canvas.width = viewport.width
        canvas.height = viewport.height

        // Render the page
        await page.render({
          canvasContext: ctx,
          viewport,
        }).promise

        // Extract text content with positions
        const textContent = await page.getTextContent()
        const spans = []

        textContent.items.forEach((item) => {
          if (!item.str.trim()) return // Skip empty items

          // Transform coordinates from PDF space to canvas space
          const tx = pdfjsLib.Util.transform(viewport.transform, item.transform)

          spans.push({
            text: item.str,
            x: tx[4],                        // x position (already scaled)
            y: tx[5] - item.height,           // y position (adjusted for baseline)
            width: item.width * scale,
            height: item.height * scale,
            fontSize: item.height,
            // Store unscaled values for backend
            rawX: item.transform[4],
            rawY: item.transform[5],
          })
        })

        setTextSpans(spans)
      } catch (err) {
        console.error('Failed to render page:', err)
      } finally {
        setIsRendering(false)
      }
    }

    renderPage()
  }, [pdfDoc, currentPage, scale, renderKey])

  /**
   * Handle text span click - show edit overlay
   */
  const handleSpanClick = useCallback((span) => {
    if (!isUploaded) return // Can't edit until uploaded
    setActiveSpan(span)
  }, [isUploaded])

  /**
   * Handle edit submission
   * Sends edit data to backend and re-renders
   */
  const handleEditSubmit = useCallback(async (editData) => {
    const success = await onEdit(editData)
    setActiveSpan(null)

    if (success) {
      // Reload the PDF from backend to show changes
      try {
        const response = await fetch('/api/download')
        if (response.ok) {
          const blob = await response.blob()
          const arrayBuffer = await blob.arrayBuffer()
          const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
          setPdfDoc(doc)
          setRenderKey(prev => prev + 1)
        }
      } catch (err) {
        console.error('Failed to reload PDF:', err)
      }
    }
  }, [onEdit])

  /**
   * Cancel editing
   */
  const handleEditCancel = useCallback(() => {
    setActiveSpan(null)
  }, [])

  /* ---------- Navigation Handlers ---------- */
  const goToPrevPage = () => setCurrentPage((p) => Math.max(1, p - 1))
  const goToNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1))
  const zoomIn = () => setZoomIndex((i) => Math.min(ZOOM_LEVELS.length - 1, i + 1))
  const zoomOut = () => setZoomIndex((i) => Math.max(0, i - 1))

  return (
    <div className="w-full max-w-5xl animate-fade-in flex flex-col gap-4">
      {/* Page & Zoom Controls */}
      <div
        className="glass-card flex items-center justify-between px-4 py-2.5"
        id="pdf-controls"
      >
        {/* Page Navigation */}
        <div className="flex items-center gap-2">
          <button
            className="btn-icon"
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
            style={{ opacity: currentPage <= 1 ? 0.4 : 1 }}
            id="btn-prev-page"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <span className="text-sm font-medium px-2" style={{ color: 'var(--text-secondary)' }}>
            Page <span style={{ color: 'var(--text-primary)' }}>{currentPage}</span> of {totalPages}
          </span>

          <button
            className="btn-icon"
            onClick={goToNextPage}
            disabled={currentPage >= totalPages}
            style={{ opacity: currentPage >= totalPages ? 0.4 : 1 }}
            id="btn-next-page"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          {isRendering && (
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="spinner" style={{ width: 14, height: 14 }} />
              Rendering...
            </div>
          )}
          {isUploaded && !isRendering && (
            <span className="badge">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              Click text to edit
            </span>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            className="btn-icon"
            onClick={zoomOut}
            disabled={zoomIndex <= 0}
            style={{ opacity: zoomIndex <= 0 ? 0.4 : 1 }}
            id="btn-zoom-out"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>

          <span className="text-xs font-medium min-w-[40px] text-center" style={{ color: 'var(--text-secondary)' }}>
            {Math.round(scale * 100)}%
          </span>

          <button
            className="btn-icon"
            onClick={zoomIn}
            disabled={zoomIndex >= ZOOM_LEVELS.length - 1}
            style={{ opacity: zoomIndex >= ZOOM_LEVELS.length - 1 ? 0.4 : 1 }}
            id="btn-zoom-in"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>
        </div>
      </div>

      {/* PDF Canvas Container */}
      <div
        ref={containerRef}
        className="glass-card overflow-auto flex justify-center p-6"
        style={{
          maxHeight: 'calc(100vh - 180px)',
          minHeight: '400px',
        }}
        id="pdf-container"
      >
        <div className="relative inline-block" style={{ lineHeight: 0 }}>
          {/* PDF Canvas */}
          <canvas
            ref={canvasRef}
            className="block"
            style={{
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)',
              borderRadius: '4px',
            }}
            id="pdf-canvas"
          />

          {/* Clickable text span overlays */}
          {isUploaded && textSpans.map((span, index) => (
            <div
              key={`${currentPage}-${index}-${span.text}`}
              className="absolute cursor-pointer transition-all duration-150"
              style={{
                left: `${span.x}px`,
                top: `${span.y}px`,
                width: `${span.width}px`,
                height: `${span.height}px`,
                zIndex: 10,
                borderRadius: '2px',
                background: 'transparent',
              }}
              onClick={() => handleSpanClick(span)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)'
                e.currentTarget.style.outline = '1px solid rgba(99, 102, 241, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.outline = 'none'
              }}
              title={`Click to edit: "${span.text}"`}
            />
          ))}

          {/* Active edit overlay */}
          {activeSpan && (
            <TextOverlay
              span={{
                ...activeSpan,
                // Use pixel positions (already scaled from rendering)
                x: activeSpan.x / scale,
                y: activeSpan.y / scale,
                width: activeSpan.width / scale,
                height: activeSpan.height / scale,
              }}
              scale={scale}
              pageNumber={currentPage}
              onSubmit={handleEditSubmit}
              onCancel={handleEditCancel}
            />
          )}
        </div>
      </div>

      {/* Page thumbnails / Quick navigation for multi-page */}
      {totalPages > 1 && (
        <div
          className="glass-card flex items-center justify-center gap-2 px-4 py-3 overflow-x-auto"
          id="page-thumbnails"
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              className="flex items-center justify-center min-w-[36px] h-9 rounded-lg text-xs font-medium transition-all duration-200"
              style={{
                background: pageNum === currentPage
                  ? 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-700))'
                  : 'var(--surface-elevated)',
                color: pageNum === currentPage ? 'white' : 'var(--text-secondary)',
                border: `1px solid ${pageNum === currentPage ? 'var(--color-primary-500)' : 'var(--surface-border)'}`,
                cursor: 'pointer',
              }}
              onClick={() => setCurrentPage(pageNum)}
            >
              {pageNum}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
