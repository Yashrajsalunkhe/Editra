import React from 'react';

function PricingPage() {
  return (
    <div className="py-16">
      <div className="text-center mb-20 relative">
        <h1 className="text-7xl md:text-9xl font-black uppercase leading-[0.85] tracking-tighter relative z-10">
          COMPUTE_<span className="text-neo-yellow stroke-black border-4 bg-black text-white px-4">TIERS.</span>
        </h1>
        <p className="text-2xl font-mono font-bold mt-8 max-w-2xl mx-auto z-10 relative">Choose your payload limits. No hidden fees. Strict data usage protocols apply.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto px-4">
        
        {/* Free Tier */}
        <div className="neo-card bg-white p-10 flex flex-col items-start border-8 border-black">
          <div className="bg-black text-white font-mono font-bold text-xs px-3 py-1 mb-6">TIER_1</div>
          <h2 className="text-5xl font-black uppercase mb-2">RAW_ACCESS</h2>
          <div className="text-6xl font-black mb-8 border-b-8 border-black pb-4 w-full">0<span className="text-2xl">USD/MO</span></div>
          
          <ul className="space-y-4 mb-10 w-full font-bold font-mono text-lg flex-1">
            <li className="flex items-center gap-2"><span className="text-neo-green font-black">✔</span> 5_PDFs_PER_DAY</li>
            <li className="flex items-center gap-2"><span className="text-neo-green font-black">✔</span> MAX_FILE_SIZE_10MB</li>
            <li className="flex items-center gap-2"><span className="text-neo-green font-black">✔</span> STANDARD_SUPPORT</li>
            <li className="flex items-center gap-2 text-gray-400"><span className="text-neo-red font-black">✖</span> BATCH_PROCESSING</li>
          </ul>
          
          <button className="neo-btn bg-neo-bg text-black w-full py-4 text-xl">INITIALIZE_FREE</button>
        </div>

        {/* Pro Tier */}
        <div className="neo-card bg-neo-cyan p-10 flex flex-col items-start border-8 border-black shadow-brutal-xl transform md:-translate-y-8">
          <div className="bg-neo-pink text-white font-mono font-black text-xs px-3 py-1 mb-6 shadow-brutal">TIER_2 [RECOMMENDED]</div>
          <h2 className="text-5xl font-black uppercase mb-2">PRO_CORE</h2>
          <div className="text-6xl font-black mb-8 border-b-8 border-black pb-4 w-full">25<span className="text-2xl font-black">USD/MO</span></div>
          
          <ul className="space-y-4 mb-10 w-full font-bold font-mono text-lg flex-1 text-black">
            <li className="flex items-center gap-2"><span className="text-black font-black">✔</span> UNLIMITED_PDFS</li>
            <li className="flex items-center gap-2"><span className="text-black font-black">✔</span> MAX_FILE_SIZE_200MB</li>
            <li className="flex items-center gap-2"><span className="text-black font-black">✔</span> PRIORITY_TERMINAL</li>
            <li className="flex items-center gap-2"><span className="text-black font-black">✔</span> BATCH_PROCESSING</li>
          </ul>
          
          <button className="neo-btn bg-black text-white hover:text-black w-full py-4 text-xl shadow-brutal">UPGRADE_PROTOCOL</button>
        </div>
        
      </div>
    </div>
  );
}

export default PricingPage;
