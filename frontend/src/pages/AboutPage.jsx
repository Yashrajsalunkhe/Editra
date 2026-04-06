import React from 'react';

function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <div className="neo-tag bg-neo-cyan text-black px-3 py-1 text-sm inline-block mb-6 uppercase shadow-brutal">FILE_PATH: /SYSTEM/ABOUT</div>
      
      <h1 className="text-7xl md:text-9xl font-black uppercase leading-[0.85] mb-12 tracking-tighter">
        MANIFESTO.<br/>
        <span className="text-neo-pink block mt-2 border-b-8 border-black">THE_AGENDA.</span>
      </h1>

      <article className="prose prose-xl font-bold max-w-none text-black">
        <p className="text-3xl leading-tight border-l-[12px] border-neo-yellow pl-8 mb-12">
          We grew tired of soft, rounded, pastel-colored software that treats professionals like children. We wanted control.
        </p>

        <h2 className="text-4xl font-black uppercase bg-black text-white px-4 py-2 inline-block shadow-brutal mb-8 transform -rotate-1">01. THE_PROBLEM</h2>
        <p className="mb-10 text-xl font-mono">
          Modern tools are bloated. They exist to harvest your data, throttle your speed, and trap you in endless subscriptions for basic features. We rejected this premise entirely.
        </p>

        <h2 className="text-4xl font-black uppercase bg-black text-neo-green px-4 py-2 inline-block shadow-brutal mb-8 transform rotate-1">02. THE_SOLUTION</h2>
        <p className="mb-10 text-xl font-mono">
          EDITRA is built like a tank. It does exactly what it needs to do: modify raw PDF data structure quickly, efficiently, and without unnecessary visual fluff. The brutalist UI is a conscious choice: form follows pure, uncompromising function.
        </p>

        <div className="neo-card bg-neo-bg p-8 border-4 border-black shadow-brutal-lg mt-16 text-center transform -rotate-2">
           <h3 className="text-3xl font-black uppercase mb-4">JOIN_THE_RESISTANCE</h3>
           <p className="font-mono mb-8 font-bold text-gray-700">Stop using weak tools.</p>
           <button className="neo-btn bg-neo-purple text-white px-8 py-4 text-xl w-full md:w-auto">GET_PRO_ACCESS →</button>
        </div>
      </article>
    </div>
  );
}

export default AboutPage;
