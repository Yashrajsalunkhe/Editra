import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import InteractivePdfViewer from './components/InteractivePdfViewer';

function EditorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pdfTimestamp, setPdfTimestamp] = useState(location.state?.timestamp ?? Date.now());
  const [editStatus, setEditStatus] = useState('');

  const handleInteractiveEdit = async (editData) => {
    setEditStatus('EXECUTING_PATCH...');

    try {
      const response = await fetch('http://localhost:5000/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      const data = await response.json();

      if (response.ok) {
        setEditStatus('PATCH_SUCCESSFUL');
        setPdfTimestamp(Date.now());
      } else {
        setEditStatus(`PATCH_FAILED: ${data.error}`);
      }
    } catch (err) {
      setEditStatus(`SYSTEM_FAILURE: ${err.message}`);
    }
  };

  const handleDownload = () => {
    window.open('http://localhost:5000/download', '_blank');
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

        <button
          onClick={handleDownload}
          className="neo-btn bg-neo-cyan text-black px-6 py-2 text-xs font-black uppercase"
        >
          EXPORT_RAW_PDF
        </button>
      </nav>

      {editStatus && (
        <div className="mb-6 font-mono font-bold text-[10px] p-4 border-brutal shadow-brutal bg-neo-yellow transform -rotate-1 animate-pulse self-start z-10 relative">
          &gt; [SYSTEM_LOG] {editStatus}
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
          <span>COORD_MATRIX: [SELECTABLE]</span>
          <span>RENDER_ENGINE: PYMUPDF_V1.23</span>
        </div>
      </section>
    </div>
  );
}

export default EditorPage;
