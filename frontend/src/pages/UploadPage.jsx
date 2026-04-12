import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);

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
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      // Handle both JSON and plain-text/HTML error responses from proxies.
      const rawBody = await response.text();
      let data = {};
      try {
        data = rawBody ? JSON.parse(rawBody) : {};
      } catch {
        data = { error: rawBody || `Request failed with status ${response.status}` };
      }
      
      if (response.ok) {
        setUploadStatus(`SYNC_SUCCESS: ${file.name}`);
        const timestamp = Date.now();
        // Go straight to editor
        navigate('/editor', { state: { timestamp } });
      } else {
        setUploadStatus(`SYNC_ERROR: ${data.error || `HTTP_${response.status}`}`);
      }
    } catch (err) {
      setUploadStatus(`FATAL: BACKEND_UNREACHABLE`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12">
      <header className="mb-16">
        <div className="neo-tag bg-neo-pink text-white px-3 py-1 text-xs inline-block mb-4 shadow-none">CORE_MODULE_ACCESS</div>
        <h1 className="text-7xl md:text-8xl font-black uppercase leading-[0.85] mb-6 tracking-tighter">
          UPLOAD_YOUR <br/>
          <span className="text-neo-cyan bg-black text-white px-4 inline-block mt-2">PAYLOAD.</span>
        </h1>
        <p className="text-2xl font-extrabold max-w-3xl border-l-8 border-black pl-8 mt-6">
          Strictly raw data processing. Drag your <span className="bg-neo-yellow text-black px-1">.PDF file</span> directly into the mainframe below.
        </p>
      </header>

      <div className="neo-card p-8 bg-white overflow-hidden relative group max-w-2xl">
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
          <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">📂</div>
          <p className="font-black text-center uppercase tracking-tight text-xl">
            {file ? file.name : "DRAG_PDF_DATA_HERE"}
          </p>
          {!file && <p className="text-xs font-mono mt-4 text-gray-400 font-bold">SUPPORTED_FORMATS: [.PDF]</p>}
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
      </div>
    </div>
  );
}

export default UploadPage;
