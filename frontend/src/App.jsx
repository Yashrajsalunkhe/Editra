/**
 * App.jsx - Root Application Component
 * 
 * Manages the overall application state and orchestrates the PDF editing workflow:
 * 1. Upload → 2. View & Edit → 3. Download
 */

import { useState, useCallback } from 'react'
import Toolbar from './components/Toolbar'
import UploadBox from './components/UploadBox'
import PDFViewer from './components/PDFViewer'
import Toast from './components/Toast'

function App() {
  // --- Application State ---
  const [pdfFile, setPdfFile] = useState(null)         // Local file for pdf.js rendering
  const [fileName, setFileName] = useState('')          // Uploaded file name
  const [isUploaded, setIsUploaded] = useState(false)   // Whether file is uploaded to backend
  const [isUploading, setIsUploading] = useState(false)  // Upload in progress
  const [editHistory, setEditHistory] = useState([])     // Track all edits for undo
  const [toast, setToast] = useState(null)               // Notification messages

  /**
   * Show a toast notification that auto-dismisses
   */
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  /**
   * Handle file upload to the backend server
   * Also stores the file locally for pdf.js rendering
   */
  const handleUpload = useCallback(async (file) => {
    setPdfFile(file)
    setFileName(file.name)
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      setIsUploaded(true)
      setEditHistory([])
      showToast('PDF uploaded successfully!', 'success')
    } catch (err) {
      showToast(err.message || 'Failed to upload PDF', 'error')
      setPdfFile(null)
      setFileName('')
    } finally {
      setIsUploading(false)
    }
  }, [showToast])

  /**
   * Send a text edit to the backend
   * The backend modifies the PDF using PyMuPDF
   */
  const handleEdit = useCallback(async (editData) => {
    try {
      const response = await fetch('/api/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Edit failed')
      }

      // Store edit in history for undo support
      setEditHistory(prev => [...prev, editData])
      showToast('Text updated successfully!', 'success')
      return true
    } catch (err) {
      showToast(err.message || 'Failed to apply edit', 'error')
      return false
    }
  }, [showToast])

  /**
   * Undo the last edit by applying inverse operation
   */
  const handleUndo = useCallback(async () => {
    if (editHistory.length === 0) return

    const lastEdit = editHistory[editHistory.length - 1]
    // Reverse the edit: swap old_text and new_text
    const undoEdit = {
      ...lastEdit,
      old_text: lastEdit.new_text,
      new_text: lastEdit.old_text,
    }

    try {
      const response = await fetch('/api/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(undoEdit),
      })

      if (!response.ok) throw new Error('Undo failed')

      setEditHistory(prev => prev.slice(0, -1))
      showToast('Edit undone', 'success')
    } catch (err) {
      showToast('Failed to undo edit', 'error')
    }
  }, [editHistory, showToast])

  /**
   * Download the modified PDF from the backend
   */
  const handleDownload = useCallback(async () => {
    try {
      const response = await fetch('/api/download')
      if (!response.ok) throw new Error('Download failed')

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `edited_${fileName}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      showToast('PDF downloaded!', 'success')
    } catch (err) {
      showToast('Failed to download PDF', 'error')
    }
  }, [fileName, showToast])

  /**
   * Reset the editor to initial state
   */
  const handleReset = useCallback(() => {
    setPdfFile(null)
    setFileName('')
    setIsUploaded(false)
    setEditHistory([])
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Toolbar */}
      <Toolbar
        fileName={fileName}
        isUploaded={isUploaded}
        editCount={editHistory.length}
        onUndo={handleUndo}
        onDownload={handleDownload}
        onReset={handleReset}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        {!pdfFile ? (
          /* Upload Screen */
          <UploadBox onUpload={handleUpload} isUploading={isUploading} />
        ) : (
          /* PDF Viewer + Editor */
          <PDFViewer
            file={pdfFile}
            isUploaded={isUploaded}
            onEdit={handleEdit}
          />
        )}
      </main>

      {/* Toast Notifications */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}

export default App
