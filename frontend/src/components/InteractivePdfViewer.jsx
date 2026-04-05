import React, { useState, useEffect, useRef } from 'react';

const InteractivePdfViewer = ({ pdfTimestamp, onEdit }) => {
  const [pageData, setPageData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [newText, setNewText] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    if (pdfTimestamp > 0) {
      loadPage(currentPage);
    }
  }, [pdfTimestamp, currentPage]);

  const loadPage = async (page) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/page_data/${page}`);
      const data = await response.json();
      if (response.ok) {
        setPageData(data);
      }
    } catch (err) {
      console.error("Failed to load page data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockClick = (block) => {
    setEditingBlock(block);
    setNewText(block.text);
  };

  const handleSave = () => {
    if (editingBlock) {
      onEdit({
        page: currentPage,
        old_text: editingBlock.text,
        new_text: newText,
        x: editingBlock.bbox[0],
        y: editingBlock.bbox[1]
      });
      setEditingBlock(null);
    }
  };

  if (pdfTimestamp === 0) {
    return (
      <div className="w-full h-full border-8 border-black border-dotted flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm">
        <div className="text-9xl mb-6 grayscale opacity-20 transform hover:scale-110 transition-transform">📄</div>
        <h3 className="text-4xl font-black uppercase text-black/20 tracking-tighter">DATA: NULL_STREAM</h3>
        <div className="mt-8 flex gap-2">
          <div className="w-4 h-4 bg-black/10 animate-bounce"></div>
          <div className="w-4 h-4 bg-black/10 animate-bounce [animation-delay:0.2s]"></div>
          <div className="w-4 h-4 bg-black/10 animate-bounce [animation-delay:0.4s]"></div>
        </div>
      </div>
    );
  }

  if (loading || !pageData) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-neo-bg">
        <div className="text-2xl font-black animate-pulse uppercase">RECONSTRUCTING_PAGE...</div>
      </div>
    );
  }

  // Calculate scale. The image is 1.5x zoom (points * 1.5).
  // We need to map PDF points to pixels on the displayed image.
  const scale = 1.5; 

  return (
    <div className="relative w-full h-full overflow-auto bg-neutral-300 p-4 flex flex-col items-center">
      {/* Page Controls */}
      <div className="sticky top-0 z-50 mb-4 flex gap-4 bg-black p-2 border-2 border-white shadow-[4px_4px_0_0_#FFF]">
        <button 
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-4 py-1 bg-neo-yellow text-black font-black uppercase text-xs disabled:opacity-50"
        >
          PREV_CHUNKS
        </button>
        <span className="text-white font-mono text-xs flex items-center">
          PAGE_ID: {currentPage} / {pageData.page_count}
        </span>
        <button 
          onClick={() => setCurrentPage(Math.min(pageData.page_count, currentPage + 1))}
          disabled={currentPage === pageData.page_count}
          className="px-4 py-1 bg-neo-cyan text-black font-black uppercase text-xs disabled:opacity-50"
        >
          NEXT_CHUNKS
        </button>
      </div>

      <div 
        ref={containerRef}
        className="relative border-4 border-black bg-white shadow-neo-lg"
        style={{ width: pageData.width * scale, height: pageData.height * scale }}
      >
        <img 
          src={pageData.image} 
          alt={`Page ${currentPage}`}
          className="absolute inset-0 w-full h-full select-none pointer-events-none"
        />
        
        {/* Interaction Layer */}
        {pageData.blocks.map((block, idx) => (
          <div
            key={idx}
            onClick={() => handleBlockClick(block)}
            className="absolute border border-transparent hover:border-neo-pink hover:bg-neo-pink/10 cursor-text group"
            style={{
              left: block.bbox[0] * scale,
              top: block.bbox[1] * scale,
              width: (block.bbox[2] - block.bbox[0]) * scale,
              height: (block.bbox[3] - block.bbox[1]) * scale,
            }}
          >
            {/* Tooltip on hover */}
            <div className="hidden group-hover:block absolute -top-8 left-0 z-20 bg-black text-white text-[8px] font-mono whitespace-nowrap px-2 py-1 uppercase">
              CLICK_TO_PATCH: "{block.text.length > 20 ? block.text.slice(0, 20) + '...' : block.text}"
            </div>
          </div>
        ))}

        {/* Editing Modal/Popover */}
        {editingBlock && (
          <div 
            className="absolute z-[100] bg-white border-4 border-black p-4 shadow-[8px_8px_0_0_#000] w-64"
            style={{
              left: Math.min(editingBlock.bbox[0] * scale, pageData.width * scale - 260),
              top: Math.min(editingBlock.bbox[1] * scale + 24, pageData.height * scale - 150),
            }}
          >
            <h4 className="font-black uppercase text-[10px] mb-2 bg-neo-pink text-white px-2 py-1 inline-block">BUFFER_WRITE</h4>
            <div className="mb-4">
               <label className="block text-[8px] font-mono text-gray-400 mb-1">ORIGINAL_DATA</label>
               <div className="text-[10px] font-bold p-2 bg-neo-bg truncate border border-black">{editingBlock.text}</div>
            </div>
            <div className="mb-4">
               <label className="block text-[8px] font-mono text-gray-400 mb-1">NEW_PAYLOAD</label>
               <textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="w-full p-2 border-2 border-black font-bold text-xs bg-neo-yellow/10 focus:bg-neo-yellow/20 outline-none h-20"
                autoFocus
               />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleSave}
                className="flex-1 bg-neo-green text-black font-black uppercase text-[10px] py-2 border-2 border-black shadow-[2px_2px_0_0_#000] active:shadow-none translate-y-0 active:translate-x-0.5 active:translate-y-0.5"
              >
                COMMIT
              </button>
              <button 
                onClick={() => setEditingBlock(null)}
                className="px-4 bg-neo-bg text-black font-black uppercase text-[10px] py-2 border-2 border-black"
              >
                CANCEL
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractivePdfViewer;
