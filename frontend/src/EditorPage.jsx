import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import InteractivePdfViewer from './components/InteractivePdfViewer';

function EditorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pdfTimestamp, setPdfTimestamp] = useState(location.state?.timestamp ?? Date.now());
  const [editStatus, setEditStatus] = useState('');
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // ── Fetch initial history state ─────────────────────────────
  const fetchHistoryStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setCanUndo(data.can_undo);
        setCanRedo(data.can_redo);
      }
    } catch {
      // silently fail — history not critical
    }
  }, []);

  useEffect(() => {
    fetchHistoryStatus();
  }, [fetchHistoryStatus]);

  // ── Edit handler ────────────────────────────────────────────
  const handleInteractiveEdit = async (editData) => {
    setEditStatus('EXECUTING_PATCH...');
    setIsProcessing(true);

    try {
      const response = await fetch('/api/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      const data = await response.json();

      if (response.ok) {
        setEditStatus('PATCH_SUCCESSFUL');
        setPdfTimestamp(Date.now());
        // Update undo/redo state from response
        if (data.can_undo !== undefined) setCanUndo(data.can_undo);
        if (data.can_redo !== undefined) setCanRedo(data.can_redo);
      } else {
        setEditStatus(`PATCH_FAILED: ${data.error}`);
      }
    } catch (err) {
      setEditStatus(`SYSTEM_FAILURE: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Undo handler ────────────────────────────────────────────
  const handleUndo = useCallback(async () => {
    if (!canUndo || isProcessing) return;
    setEditStatus('REVERTING_PATCH...');
    setIsProcessing(true);

    try {
      const res = await fetch('/api/undo', { method: 'POST' });
      const data = await res.json();

      if (res.ok) {
        setEditStatus('UNDO_SUCCESSFUL');
        setPdfTimestamp(Date.now());
        setCanUndo(data.can_undo);
        setCanRedo(data.can_redo);
      } else {
        setEditStatus(`UNDO_FAILED: ${data.error}`);
      }
    } catch (err) {
      setEditStatus(`UNDO_FAILURE: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [canUndo, isProcessing]);

  // ── Redo handler ────────────────────────────────────────────
  const handleRedo = useCallback(async () => {
    if (!canRedo || isProcessing) return;
    setEditStatus('REPLAYING_PATCH...');
    setIsProcessing(true);

    try {
      const res = await fetch('/api/redo', { method: 'POST' });
      const data = await res.json();

      if (res.ok) {
        setEditStatus('REDO_SUCCESSFUL');
        setPdfTimestamp(Date.now());
        setCanUndo(data.can_undo);
        setCanRedo(data.can_redo);
      } else {
        setEditStatus(`REDO_FAILED: ${data.error}`);
      }
    } catch (err) {
      setEditStatus(`REDO_FAILURE: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [canRedo, isProcessing]);

  // ── Keyboard shortcuts ──────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Z = Undo, Ctrl+Shift+Z or Ctrl+Y = Redo
      if ((e.ctrlKey || e.metaKey) && !e.altKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
        } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
          e.preventDefault();
          handleRedo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const handleDownload = () => {
    window.open('/api/download', '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 lg:p-12 relative overflow-hidden bg-neo-bg">
      <nav className="mb-8 flex flex-wrap items-center justify-between gap-4 bg-black text-white p-4 border-brutal shadow-brutal-lg z-10 relative">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="neo-btn bg-white text-black px-4 py-2 text-xs"
          >
            BACK_TO_UPLOAD
          </button>
          <span className="text-xl md:text-2xl font-black tracking-tighter uppercase">EDITRA.PDF / EDIT_MODE</span>
        </div>

        {/* ── Undo / Redo Buttons ──────────────────────────── */}
        <div className="flex items-center gap-2">
          <button
            id="undo-btn"
            onClick={handleUndo}
            disabled={!canUndo || isProcessing}
            className={`neo-btn px-4 py-2 text-xs font-black uppercase flex items-center gap-1.5 transition-all duration-150
              ${canUndo && !isProcessing
                ? 'bg-neo-yellow text-black hover:scale-105 active:scale-95'
                : 'bg-neutral-700 text-neutral-500 cursor-not-allowed opacity-60'
              }`}
            title="Undo (Ctrl+Z)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            UNDO
          </button>

          <button
            id="redo-btn"
            onClick={handleRedo}
            disabled={!canRedo || isProcessing}
            className={`neo-btn px-4 py-2 text-xs font-black uppercase flex items-center gap-1.5 transition-all duration-150
              ${canRedo && !isProcessing
                ? 'bg-neo-pink text-white hover:scale-105 active:scale-95'
                : 'bg-neutral-700 text-neutral-500 cursor-not-allowed opacity-60'
              }`}
            title="Redo (Ctrl+Shift+Z)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10" />
            </svg>
            REDO
          </button>
        </div>

        <button
          onClick={handleDownload}
          className="neo-btn bg-neo-cyan text-black px-6 py-2 text-xs font-black uppercase"
        >
          EXPORT_RAW_PDF
        </button>
      </nav>

      {editStatus && (
        <div className={`mb-6 font-mono font-bold text-[10px] p-4 border-brutal shadow-brutal transform -rotate-1 self-start z-10 relative
          ${editStatus.includes('SUCCESSFUL') ? 'bg-neo-green animate-pulse' :
            editStatus.includes('FAILED') || editStatus.includes('FAILURE') ? 'bg-neo-red text-white' :
            'bg-neo-yellow animate-pulse'
          }`}
        >
          &gt; [SYSTEM_LOG] {editStatus}
          {(editStatus.includes('UNDO') || editStatus.includes('REDO')) && (
            <span className="ml-4 opacity-60">
              [CTRL+Z: UNDO | CTRL+SHIFT+Z: REDO]
            </span>
          )}
        </div>
      )}

      <section className="bg-white flex-1 min-h-[78vh] flex flex-col overflow-hidden border-brutal shadow-brutal-xl z-10 relative">
        <div className="bg-black text-white p-4 flex justify-between items-center border-b-4 border-black">
          <div className="flex gap-3">
            <div className="w-4 h-4 bg-neo-red border-2 border-white"></div>
            <div className="w-4 h-4 bg-neo-yellow border-2 border-white"></div>
            <div className="w-4 h-4 bg-neo-green border-2 border-white"></div>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-mono font-black text-[10px] tracking-[0.3em] uppercase">EDIT_VIEWPORT_PRIMARY_BUFFER_00</span>
            <span className="font-mono text-[8px] text-neo-cyan">ENCRYPTION: ACTIVE [SHA_256]</span>
          </div>
          <div className="font-mono text-[10px] text-neo-green">MODE: INTERACTIVE_PATCH</div>
        </div>

        <div className="flex-1 bg-neutral-300 overflow-hidden flex flex-col relative">
          <div className="absolute top-2 left-2 w-4 h-4 border-t-4 border-l-4 border-black z-20"></div>
          <div className="absolute top-2 right-2 w-4 h-4 border-t-4 border-r-4 border-black z-20"></div>
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-4 border-l-4 border-black z-20"></div>
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-4 border-r-4 border-black z-20"></div>

          <InteractivePdfViewer
            pdfTimestamp={pdfTimestamp}
            onEdit={handleInteractiveEdit}
          />
        </div>

        <div className="bg-neo-bg border-t-4 border-black p-3 font-mono text-[9px] flex justify-between uppercase font-bold">
          <span>BUFF_SIZE: READY</span>
          <span className="flex items-center gap-3">
            <span className={`inline-block w-2 h-2 rounded-full ${canUndo ? 'bg-neo-green' : 'bg-neutral-400'}`} />
            UNDO: {canUndo ? 'AVAILABLE' : 'EMPTY'}
            <span className="text-neutral-400">|</span>
            <span className={`inline-block w-2 h-2 rounded-full ${canRedo ? 'bg-neo-green' : 'bg-neutral-400'}`} />
            REDO: {canRedo ? 'AVAILABLE' : 'EMPTY'}
          </span>
          <span>SHORTCUTS: CTRL+Z / CTRL+SHIFT+Z</span>
        </div>
      </section>
    </div>
  );
}

export default EditorPage;
