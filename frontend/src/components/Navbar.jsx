import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="mb-12 flex flex-col md:flex-row justify-between items-stretch md:items-center bg-black text-white p-4 border-b-8 border-r-8 border-black">
      <div className="flex items-center gap-4 mb-4 md:mb-0">
        <div className="w-10 h-10 bg-neo-yellow border-2 border-white shadow-[3px_3px_0_0_#FFF] flex items-center justify-center font-black text-black">E</div>
        <Link to="/" className="text-3xl font-black tracking-tighter uppercase text-white hover:text-neo-cyan transition-colors">EDITRA.PDF</Link>
        <div className="hidden xl:flex items-center gap-2 ml-4 border-l-2 border-white/30 pl-4 font-mono text-[10px] text-white/50">
          <span>STATUS: [ONLINE]</span>
          <span className="w-2 h-2 bg-neo-green rounded-full animate-pulse"></span>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 md:gap-8 font-mono font-bold text-[11px] items-center justify-between md:justify-end">
        <div className="flex gap-4">
          <Link to="/upload" className="text-neo-cyan hover:bg-neo-cyan hover:text-black px-1 transition-colors">UPLOAD_HUB</Link>
          <Link to="/pricing" className="text-neo-pink hover:bg-neo-pink hover:text-black px-1 transition-colors">PRO_PLANS</Link>
          <Link to="/about" className="text-neo-purple hover:bg-neo-purple hover:text-black px-1 transition-colors">VISION</Link>
        </div>
        <div className="flex items-center gap-4 border-l-2 border-white/20 pl-4">
          <span className="hover:text-neo-yellow transition-colors cursor-pointer">DOCS</span>
          <div className="px-3 py-1 bg-neo-green text-black neo-tag shadow-none text-[10px]">AUTH_USER: ADITYA_LP</div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
