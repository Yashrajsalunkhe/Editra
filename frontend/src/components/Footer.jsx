import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="mt-32 bg-black text-white p-12 md:p-20 relative overflow-hidden border-t-8 border-black shadow-[inset_0_8px_0_0_rgba(255,255,255,0.2)]">
      <div className="absolute top-10 right-[-100px] text-[20rem] font-black opacity-10 rotate-12 select-none pointer-events-none text-neo-pink hidden lg:block">
        EDITRA
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-12 border-b-2 border-white/20 pb-20">
        <div className="md:col-span-6">
          <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-8 leading-none">
            REDEFINE<br/>YOUR<br/><span className="text-neo-yellow">DOCUMENTS.</span>
          </h2>
          <div className="flex gap-4 flex-wrap">
            <Link to="/pricing" className="neo-btn bg-neo-cyan text-black px-8 py-3 text-sm hover:scale-105 transition-transform inline-block">GET_PRO_ACCESS</Link>
            <button className="neo-btn bg-white text-black px-8 py-3 text-sm hover:scale-105 transition-transform">VIEW_SOURCE</button>
          </div>
        </div>
        <div className="md:col-span-3">
            <h4 className="font-mono text-neo-pink mb-6 font-black tracking-widest text-xs">SYSTEM_RESOURCES</h4>
            <ul className="space-y-4 font-bold text-lg">
              <li><Link to="/about" className="hover:text-neo-cyan transition-colors flex items-center gap-2"><span>→</span> ABOUT_US</Link></li>
              <li><Link to="/pricing" className="hover:text-neo-cyan transition-colors flex items-center gap-2"><span>→</span> PRICING</Link></li>
              <li className="hover:text-neo-cyan transition-colors cursor-pointer flex items-center gap-2"><span>→</span> API_ENDPOINT</li>
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
  );
}

export default Footer;
