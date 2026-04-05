import React, { useState } from 'react'
import InteractivePdfViewer from './components/InteractivePdfViewer'

function App() {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [pdfTimestamp, setPdfTimestamp] = useState(0);
  const [editStatus, setEditStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // Removed legacy editForm state

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setUploadStatus('SYSTEM: TRANSMITTING...');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      
      if (response.ok) {
        setUploadStatus(`SYNC_SUCCESS: ${file.name}`);
        setPdfTimestamp(Date.now());
      } else {
        setUploadStatus(`SYNC_ERROR: ${data.error}`);
      }
    } catch (err) {
      setUploadStatus(`FATAL: BACKEND_UNREACHABLE`);
    } finally {
      setIsUploading(false);
    }
  };


  const handleInteractiveEdit = async (editData) => {
    setEditStatus('EXECUTING_PATCH...');
    try {
      const response = await fetch('http://localhost:5000/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
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
    <div className="min-h-screen flex flex-col p-4 md:p-8 lg:p-12">
      {/* Top Bar - Refined for visibility */}
      <nav className="mb-12 flex flex-col md:flex-row justify-between items-stretch md:items-center bg-black text-white p-4 border-b-8 border-r-8 border-black">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <div className="w-10 h-10 bg-neo-yellow border-2 border-white shadow-[3px_3px_0_0_#FFF] flex items-center justify-center font-black text-black">E</div>
          <span className="text-3xl font-black tracking-tighter uppercase text-white">EDITRA.PDF</span>
          <div className="hidden xl:flex items-center gap-2 ml-4 border-l-2 border-white/30 pl-4 font-mono text-[10px] text-white/50">
            <span>STATUS: [ONLINE]</span>
            <span className="w-2 h-2 bg-neo-green rounded-full animate-pulse"></span>
          </div>
        </div>

        {/* Search Mock to fill middle space */}
        <div className="hidden lg:flex flex-1 max-w-md mx-8">
          <div className="w-full relative flex items-center">
            <span className="absolute left-3 text-white/50 font-mono text-xs">FIND_TOOL_</span>
            <input 
              type="text" 
              placeholder="COMMAND_PROMPT..." 
              className="w-full bg-white/10 border-2 border-white/20 p-2 pl-24 text-xs font-mono text-white focus:bg-white/20 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 md:gap-8 font-mono font-bold text-[11px] items-center justify-between md:justify-end">
          <div className="flex gap-4">
            <span className="text-neo-cyan hover:bg-neo-cyan hover:text-black px-1 transition-colors cursor-pointer">DASHBOARD</span>
            <span className="text-neo-pink hover:bg-neo-pink hover:text-black px-1 transition-colors cursor-pointer">COLLECTIONS</span>
            <span className="text-neo-purple hover:bg-neo-purple hover:text-black px-1 transition-colors cursor-pointer">TEMPLATES</span>
          </div>
          <div className="flex items-center gap-4 border-l-2 border-white/20 pl-4">
            <span className="hover:text-neo-yellow transition-colors cursor-pointer">DOCS</span>
            <div className="px-3 py-1 bg-neo-green text-black neo-tag shadow-none text-[10px]">AUTH_USER: ADITYA_LP</div>
          </div>
        </div>
      </nav>

      {/* Hero / Header Section */}
      <header className="mb-16 max-w-5xl">
        <div className="neo-tag bg-neo-pink text-white px-3 py-1 text-xs inline-block mb-4 shadow-none">LIMITED_EDITION_BRUTALIST_UI</div>
        <h1 className="text-7xl md:text-9xl font-black uppercase leading-[0.85] mb-6 tracking-tighter">
          EDIT <span className="text-neo-cyan">PDF</span><br/> 
          WITHOUT <br/>
          THE <span className="inline-block bg-neo-yellow text-black px-6 py-2 transform -rotate-1 border-4 border-black box-decoration-clone">BULLSH*T.</span>
        </h1>
        <p className="text-2xl md:text-3xl font-extrabold max-w-3xl border-l-8 border-black pl-8 mt-10 italic">
          The engineering-first PDF manipulation suite. <br/>
          No fluff. Just raw, unadulterated <span className="bg-black text-white px-2 not-italic">POWER.</span>
        </p>
      </header>

      {/* Working Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Input Column */}
        <div className="lg:col-span-4 space-y-10">
          
          {/* Uploader Card */}
          <section className="neo-card p-8 bg-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-2 bg-black text-white text-[10px] font-mono rotate-90 translate-x-4 -translate-y-2 group-hover:bg-neo-pink transition-colors">IO_MODULE_01</div>
            <h2 className="text-3xl font-black mb-6 flex items-center gap-2">
              <span className="bg-neo-cyan px-2 border-2 border-black shadow-[2px_2px_0_0_#000]">01</span> SOURCE_FILE
            </h2>
            
            <div className={`border-4 border-black border-dashed p-10 flex flex-col items-center justify-center transition-all cursor-pointer hover:bg-neo-bg relative ${file ? 'bg-neo-green/5' : ''}`}>
              <input 
                type="file" 
                accept=".pdf" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📂</div>
              <p className="font-black text-center uppercase tracking-tight text-sm">
                {file ? file.name : "DRAG_PDF_DATA_HERE"}
              </p>
              {!file && <p className="text-[10px] font-mono mt-4 text-gray-400">SUPPORTED_FORMATS: [.PDF]</p>}
            </div>

            <button 
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="neo-btn w-full mt-6 py-5 text-xl bg-neo-green hover:bg-black hover:text-white disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
            >
              {isUploading ? "PROCESS_INIT..." : "COMMIT_UPLOAD_DATA →"}
            </button>
            
            {uploadStatus && (
              <div className="mt-4 font-mono font-bold text-[10px] p-4 bg-black text-neo-green border-2 border-black overflow-hidden animate-pulse">
                &gt; {uploadStatus}
              </div>
            )}
          </section>

          {editStatus && (
            <div className="font-mono font-bold text-[10px] p-4 border-4 border-black bg-neo-yellow transform -rotate-1 animate-pulse">
              &gt; [SYSTEM_LOG] {editStatus}
            </div>
          )}
        </div>

        {/* Viewport Column */}
        <div className="lg:col-span-8 flex flex-col h-[950px]">
          <div className="neo-card bg-white flex flex-col h-full relative overflow-hidden border-b-[16px]">
            <div className="bg-black text-white p-4 flex justify-between items-center border-b-4 border-black">
              <div className="flex gap-3">
                <div className="w-4 h-4 bg-neo-red border-2 border-white"></div>
                <div className="w-4 h-4 bg-neo-yellow border-2 border-white"></div>
                <div className="w-4 h-4 bg-neo-green border-2 border-white"></div>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-mono font-black text-[10px] tracking-[0.3em] uppercase">VIEWPORT_PRIMARY_BUFFER_00</span>
                <span className="font-mono text-[8px] text-neo-cyan">ENCRYPTION: ACTIVE [SHA_256]</span>
              </div>
              <button 
                onClick={handleDownload}
                disabled={!pdfTimestamp}
                className="neo-btn bg-neo-cyan text-black px-6 py-2 text-xs font-black uppercase border-2 border-white hover:bg-white disabled:bg-gray-600 disabled:text-gray-400 shadow-none transform-none"
              >
                EXPORT_RAW_PDF
              </button>
            </div>

            <div className="flex-1 bg-neutral-300 overflow-hidden flex flex-col relative">
              {/* Corner decor - kept for style */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-4 border-l-4 border-black z-20"></div>
              <div className="absolute top-2 right-2 w-4 h-4 border-t-4 border-r-4 border-black z-20"></div>
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-4 border-l-4 border-black z-20"></div>
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-4 border-r-4 border-black z-20"></div>

              <InteractivePdfViewer 
                pdfTimestamp={pdfTimestamp} 
                onEdit={handleInteractiveEdit} 
              />
            </div>
            
            {/* Metadata Footer bar for Viewport */}
            <div className="bg-neo-bg border-t-4 border-black p-3 font-mono text-[9px] flex justify-between uppercase font-bold">
              <span>BUFF_SIZE: {pdfTimestamp > 0 ? "OPTIMIZED" : "0KB"}</span>
              <span>COORD_MATRIX: [SELECTABLE]</span>
              <span>RENDER_ENGINE: PYMUPDF_V1.23</span>
            </div>
          </div>
        </div>
      </div>

      {/* Extreme Footer */}
      <footer className="mt-32 bg-black text-white p-12 md:p-20 relative overflow-hidden">
        {/* Background text decoration */}
        <div className="absolute top-10 right-[-100px] text-[20rem] font-black opacity-10 rotate-12 select-none pointer-events-none text-neo-pink">
          EDITRA
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-12 border-b-2 border-white/20 pb-20">
          <div className="md:col-span-6">
            <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-8 leading-none">
              REDEFINE<br/>YOUR<br/><span className="text-neo-yellow">DOCUMENTS.</span>
            </h2>
            <div className="flex gap-4">
              <button className="neo-btn bg-neo-cyan text-black px-8 py-3 text-sm">GET_PRO_ACCESS</button>
              <button className="neo-btn bg-white text-black px-8 py-3 text-sm">VIEW_SOURCE</button>
            </div>
          </div>
          <div className="md:col-span-3">
             <h4 className="font-mono text-neo-pink mb-6 font-black tracking-widest text-xs">SYSTEM_RESOURCES</h4>
             <ul className="space-y-4 font-bold text-lg">
                <li className="hover:text-neo-cyan transition-colors cursor-pointer flex items-center gap-2"><span>→</span> ENGINE_SPEC</li>
                <li className="hover:text-neo-cyan transition-colors cursor-pointer flex items-center gap-2"><span>→</span> API_ENDPOINT</li>
                <li className="hover:text-neo-cyan transition-colors cursor-pointer flex items-center gap-2"><span>→</span> RELEASES</li>
                <li className="hover:text-neo-cyan transition-colors cursor-pointer flex items-center gap-2"><span>→</span> STATUS_BOARD</li>
             </ul>
          </div>
          <div className="md:col-span-3">
             <h4 className="font-mono text-neo-pink mb-6 font-black tracking-widest text-xs">NETWORK_LINKS</h4>
             <ul className="space-y-4 font-bold text-lg">
                <li className="hover:text-neo-yellow transition-colors cursor-pointer flex items-center gap-2"><span>⚡</span> TWITTER</li>
                <li className="hover:text-neo-yellow transition-colors cursor-pointer flex items-center gap-2"><span>⚡</span> DISCORD_SRV</li>
                <li className="hover:text-neo-yellow transition-colors cursor-pointer flex items-center gap-2"><span>⚡</span> GITHUB_REPO</li>
                <li className="hover:text-neo-yellow transition-colors cursor-pointer flex items-center gap-2"><span>⚡</span> LINKED_IN</li>
             </ul>
          </div>
        </div>
        
        <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-8 font-mono text-xs text-white/40 font-bold uppercase">
          <p>© 2026 EDITRA_CORP. ALL_RIGHTS_RESERVED. [UNCLASSIFIED]</p>
          <div className="flex gap-10">
            <span className="hover:text-white cursor-pointer">PRIVACY_POLICY</span>
            <span className="hover:text-white cursor-pointer">TERMS_OF_SERVICE</span>
            <span className="hover:text-white cursor-pointer">EULA_LICENSE</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
