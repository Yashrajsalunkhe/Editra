import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="flex flex-col gap-0 pb-0">
      {/* Hero Section */}
      <section className="text-center xl:text-left flex flex-col xl:flex-row items-center justify-center gap-8 min-h-[calc(100vh-140px)] px-4 md:px-12 py-4 pt-0">
        <div className="flex-1 w-full max-w-2xl z-10 xl:-mt-12">
          <div className="neo-tag bg-neo-green text-black px-4 py-2 text-sm inline-block mb-6 uppercase font-black border-4 border-black transform -rotate-2 hover:rotate-2 transition-transform">VERSION_2.0_DEPLOYED</div>
          <h1 className="text-6xl sm:text-7xl md:text-[7.5rem] font-black uppercase leading-[0.8] mb-6 tracking-tighter text-black">
            EDIT <span className="text-neo-cyan px-2">PDF</span><br/> 
            WITHOUT <br/>
            THE <span className="inline-block bg-neo-yellow text-black px-6 py-1 transform rotate-1 border-[6px] border-black shadow-brutal box-decoration-clone mt-2">BULLSH*T.</span>
          </h1>
          <p className="text-xl md:text-2xl font-extrabold max-w-xl border-l-[12px] border-black pl-6 mb-8 italic bg-white p-4 shadow-brutal transform -rotate-1">
            The engineering-first PDF manipulation suite. <br/>
            No fluff. <span className="bg-black text-white px-3 mt-1 inline-block uppercase not-italic">Just raw POWER.</span>
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center xl:justify-start">
            <Link to="/upload" className="neo-btn font-black bg-[var(--color-neo-pink)] text-white hover:bg-black hover:text-[var(--color-neo-pink)] px-8 py-4 text-xl shadow-brutal">INITIALIZE_TOOL →</Link>
            <Link to="/pricing" className="neo-btn font-black bg-white text-black hover:bg-neo-yellow hover:text-black px-8 py-4 text-xl shadow-brutal">UPGRADE_PROTOCOL</Link>
          </div>
        </div>
        
        {/* Dynamic Graphic Container */}
        <div className="flex-1 w-full relative h-[400px] xl:h-[500px] flex items-center justify-center p-4 xl:-mt-12">
          <div className="bg-grid-brutal absolute inset-0 opacity-20 hidden xl:block"></div>
          <div className="relative group perspective-1000 z-10 xl:ml-12">
            <img 
               src="/hero_graphic.png" 
               alt="Neo-brutalist graphic showing folder and lightning" 
               className="w-full max-w-xs xl:max-w-md object-contain border-8 border-black shadow-[16px_16px_0_0_rgba(0,0,0,1)] transform rotate-2 hover:-translate-y-4 hover:shadow-[24px_24px_0_0_rgba(0,0,0,1)] transition-all duration-300 bg-white" 
             />
             <div className="absolute -bottom-6 -left-6 bg-neo-cyan text-black border-4 border-black font-black text-3xl xl:text-4xl p-4 xl:p-6 shadow-brutal transform -rotate-6 group-hover:-rotate-12 transition-transform duration-300 z-20">
               FILE.PDF
             </div>
             <div className="absolute -top-6 -right-6 bg-neo-yellow text-black border-4 border-black font-mono font-bold text-lg xl:text-xl px-4 xl:px-6 py-2 shadow-brutal transform rotate-6 z-20">
               &gt; ENHANCED_MODE
             </div>
          </div>
        </div>
      </section>

      {/* Marquee Section */}
      <section className="bg-neo-pink border-y-8 border-black overflow-hidden py-6 flex -mx-4 md:-mx-12 z-20 relative shadow-brutal-lg transform -rotate-1 scale-105 my-12">
        <div className="animate-marquee items-center gap-12 font-black text-5xl uppercase tracking-tighter text-black w-[200%]">
          <span>NO_SUBSCRIPTIONS</span><span className="text-white">✦</span>
          <span>RAW_POWER</span><span className="text-white">✦</span>
          <span>LOCAL_EDITING</span><span className="text-white">✦</span>
          <span>UNLIMITED_EXPORTS</span><span className="text-white">✦</span>
          <span>NO_SUBSCRIPTIONS</span><span className="text-white">✦</span>
          <span>RAW_POWER</span><span className="text-white">✦</span>
          <span>LOCAL_EDITING</span><span className="text-white">✦</span>
          <span>UNLIMITED_EXPORTS</span><span className="text-white">✦</span>
        </div>
      </section>

      {/* Feature Section */}
      <section className="bg-black text-white px-4 md:px-12 py-24 relative overflow-hidden -mx-4 md:-mx-12">
         <div className="absolute text-[26rem] font-black text-white/5 select-none pointer-events-none top-0 left-0 leading-none tracking-tighter mix-blend-overlay">FEATURES</div>
         <div className="flex justify-between items-end mb-20 relative z-10 border-b-8 border-neo-yellow pb-8">
           <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">SYSTEM<br/><span className="text-neo-yellow">CAPABILITIES.</span></h2>
           <div className="font-mono text-neo-pink font-black text-2xl hidden md:block border-4 border-neo-pink px-4 py-2 transform rotate-2">V_2.0_SPECS</div>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            <div className="bg-white text-black p-10 border-8 border-black shadow-[16px_16px_0_0_#FFF] hover:shadow-[16px_16px_0_0_var(--color-neo-cyan)] transition-shadow">
               <div className="text-7xl mb-8 bg-neo-bg inline-block p-4 border-4 border-black shadow-brutal transform -rotate-3">⚡</div>
               <h3 className="text-4xl font-black mb-6 uppercase tracking-tight border-b-8 border-black pb-4">LIGHTNING_FAST</h3>
               <p className="font-bold text-xl font-mono leading-relaxed">Process massive documents instantly directly in your viewport. No server latency. No waiting.</p>
            </div>
            <div className="bg-white text-black p-10 border-8 border-black shadow-[16px_16px_0_0_#FFF] hover:shadow-[16px_16px_0_0_var(--color-neo-pink)] transition-shadow transform md:translate-y-8">
               <div className="text-7xl mb-8 bg-black text-white inline-block p-4 border-4 border-black shadow-brutal transform rotate-3">🔒</div>
               <h3 className="text-4xl font-black mb-6 uppercase tracking-tight border-b-8 border-black pb-4">SECURE_CORE</h3>
               <p className="font-bold text-xl font-mono leading-relaxed">Your payloads are processed locally. What happens in your browser, stays in your browser completely.</p>
            </div>
            <div className="bg-white text-black p-10 border-8 border-black shadow-[16px_16px_0_0_#FFF] hover:shadow-[16px_16px_0_0_var(--color-neo-yellow)] transition-shadow transform md:translate-y-16">
               <div className="text-7xl mb-8 bg-neo-cyan inline-block p-4 border-4 border-black shadow-brutal transform -rotate-1">🛠️</div>
               <h3 className="text-4xl font-black mb-6 uppercase tracking-tight border-b-8 border-black pb-4">RAW_CONTROL</h3>
               <p className="font-bold text-xl font-mono leading-relaxed">Direct coordinate editing. Pixel-perfect modifications. Built stringently for professionals.</p>
            </div>
         </div>
      </section>

      {/* How it Works */}
      <section className="py-32 px-4 md:px-12 bg-white relative">
        <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-center mb-24 border-8 border-black bg-neo-bg py-8 shadow-[24px_24px_0_0_#000] transform -rotate-1 max-w-4xl mx-auto">HOW_IT_WORKS</h2>
        
        <div className="max-w-5xl mx-auto space-y-16">
          {/* Step 1 */}
          <div className="flex flex-col md:flex-row items-center gap-12 group">
            <div className="text-9xl font-black text-neo-pink text-stroke-3 tracking-tighter drop-shadow-[8px_8px_0_#000] w-32 shrink-0 group-hover:scale-110 transition-transform">01.</div>
            <div className="neo-card flex-1 p-10 border-8 bg-neo-yellow group-hover:bg-white transition-colors relative">
               <div className="absolute -top-4 -right-4 bg-black text-white px-4 py-1 font-mono font-bold text-sm transform rotate-6 border-2 border-white">ACTION_REQ</div>
               <h3 className="text-4xl font-black uppercase mb-4">DRAG_PAYLOAD</h3>
               <p className="text-2xl font-mono font-bold text-black border-l-8 border-black pl-6 py-2 bg-white/50">Pull your targeted .PDF document into the main interface buffer zone.</p>
            </div>
          </div>
          {/* Step 2 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12 group">
            <div className="text-9xl font-black text-neo-cyan text-stroke-3 tracking-tighter drop-shadow-[8px_8px_0_#000] w-32 shrink-0 text-right group-hover:scale-110 transition-transform">02.</div>
            <div className="neo-card flex-1 p-10 border-8 bg-black text-white group-hover:bg-neo-cyan group-hover:text-black transition-colors relative">
               <h3 className="text-4xl font-black uppercase mb-4">EXECUTE_EDIT</h3>
               <p className="text-2xl font-mono font-bold border-l-8 border-neo-cyan pl-6 py-2 bg-white/10">Manipulate coordinates, redact text, or insert graphics with brutal efficiency.</p>
            </div>
          </div>
          {/* Step 3 */}
          <div className="flex flex-col md:flex-row items-center gap-12 group">
            <div className="text-9xl font-black text-neo-green text-stroke-3 tracking-tighter drop-shadow-[8px_8px_0_#000] w-32 shrink-0 group-hover:scale-110 transition-transform">03.</div>
            <div className="neo-card flex-1 p-10 border-8 bg-white group-hover:bg-neo-pink group-hover:text-white transition-colors relative">
               <div className="absolute -top-4 -right-4 bg-neo-yellow text-black px-4 py-1 font-mono font-bold text-sm transform -rotate-3 border-4 border-black">FINAL_STEP</div>
               <h3 className="text-4xl font-black uppercase mb-4">EXPORT_PROTOCOL</h3>
               <p className="text-2xl font-mono font-bold border-l-8 border-black pl-6 py-2 bg-black/5">Download the fully rendered document without any watermarks or wait times.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Massive CTA Section - Creative Redesign */}
      <section className="relative py-20 px-4 md:px-12 overflow-hidden flex justify-center items-center bg-[var(--color-neo-cyan)] min-h-[60vh]">
         {/* Warning Tape Borders */}
         <div className="absolute top-0 left-0 w-full h-8 bg-warning-tape border-y-8 border-black z-10"></div>
         <div className="absolute bottom-0 left-0 w-full h-8 bg-warning-tape border-y-8 border-black z-10"></div>
         
         {/* Background elements */}
         <div className="absolute inset-0 bg-grid-brutal opacity-20"></div>
         
         <div className="absolute text-[30vw] font-black tracking-tighter text-black opacity-10 -rotate-12 whitespace-nowrap pointer-events-none select-none z-0">
           INIT_INIT_INIT_
         </div>

         {/* Floating decorative elements */}
         <div className="absolute top-10 left-10 md:left-20 text-6xl md:text-8xl transform -rotate-12 drop-shadow-[5px_5px_0_#FFF] z-10">☠️</div>
         <div className="absolute bottom-10 right-10 md:right-20 text-6xl md:text-8xl transform rotate-12 drop-shadow-[5px_5px_0_#FFF] z-10">🔥</div>

         {/* Brutalist Dialog Box */}
         <div className="neo-card bg-[var(--color-neo-bg)] w-full max-w-5xl z-20 shadow-[32px_32px_0_0_var(--color-neo-pink)] hover:shadow-[24px_24px_0_0_#000] transform -rotate-1 hover:rotate-0 transition-all duration-300">
           {/* Dialog Title Bar */}
           <div className="bg-black text-white px-4 md:px-6 py-3 flex justify-between items-center border-b-8 border-black">
             <div className="font-mono font-bold space-x-2 md:space-x-4 md:text-xl tracking-widest flex items-center gap-2">
               <span className="w-4 h-4 md:w-5 md:h-5 bg-[var(--color-neo-red)] rounded border-2 border-white animate-blink"></span>
               SYSTEM_OVERRIDE.EXE
             </div>
             <div className="flex gap-2">
                <div className="w-8 h-8 bg-white border-4 border-black"></div>
                <div className="w-8 h-8 border-4 border-white flex items-center justify-center font-black text-xl hover:bg-neo-red hover:text-black cursor-pointer transition-colors">X</div>
             </div>
           </div>
           
           {/* Dialog Content */}
           <div className="p-6 md:p-12 flex flex-col items-center text-center relative overflow-hidden">
             
             <div className="bg-[var(--color-neo-yellow)] px-6 py-2 border-4 border-black font-black uppercase text-xl mb-8 shadow-brutal transform rotate-2 z-10">
               FINAL AUTHORIZATION REQUIRED
             </div>
             
             <h2 className="text-5xl sm:text-6xl md:text-8xl font-black uppercase leading-[0.85] tracking-tighter mb-10 z-10 text-black">
               YOUR WORK IS <br/><span className="text-[var(--color-neo-pink)] text-stroke-2 drop-shadow-[6px_6px_0_#000]">WAITING.</span>
             </h2>

             <div className="w-full max-w-3xl font-mono text-base md:text-xl font-bold bg-white border-8 border-black p-4 md:p-6 mb-10 shadow-brutal text-left z-10">
               <p className="text-black mb-1 md:mb-2">&gt; CHECKING_CREDENTIALS... <span className="bg-neo-green px-2 text-xs md:text-sm ml-2 border-2 border-black">OK</span></p>
               <p className="text-black mb-1 md:mb-2">&gt; VERIFYING_LOCAL_SANDBOX... <span className="bg-neo-green px-2 text-xs md:text-sm ml-2 border-2 border-black">OK</span></p>
               <p className="text-black mb-4">&gt; WAITING_FOR_USER_ACTION... </p>
               <p className="text-[var(--color-neo-purple)] bg-[var(--color-neo-bg)] p-3 md:p-4 border-l-8 border-[var(--color-neo-purple)] text-sm md:text-lg">
                 Initialize deployment of the PDF parser module? [Y/N]<span className="animate-blink inline-block ml-2 w-3 md:w-4 h-5 md:h-6 bg-black translate-y-1"></span>
               </p>
             </div>

             <div className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full justify-center z-10">
               <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="neo-btn font-black bg-white text-black hover:bg-black hover:text-white px-6 md:px-8 py-4 md:py-5 text-lg md:text-xl shadow-brutal flex-1 max-w-[250px] whitespace-nowrap">
                 &lt; ABORT
               </button>
               <Link to="/upload" className="neo-btn font-black bg-[var(--color-neo-green)] text-black hover:bg-[var(--color-neo-yellow)] hover:text-black px-6 md:px-12 py-4 md:py-5 text-xl md:text-2xl shadow-[8px_8px_0_0_#000] md:shadow-[12px_12px_0_0_#000] flex-1 max-w-[500px] border-[6px]">
                 DEPLOY_TOOLS_NOW
               </Link>
             </div>
           </div>
         </div>
      </section>
    </div>
  );
}

export default LandingPage;
