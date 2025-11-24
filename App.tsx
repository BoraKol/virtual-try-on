import React, { useState } from 'react';
import { EditorTab } from './components/EditorTab';
import { VTOTab } from './components/VTOTab';
import { AppMode } from './types';
import { Wand2, Shirt, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.EDITOR);

  return (
    <div className="min-h-screen bg-[#0f0f12] text-slate-200 selection:bg-indigo-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800 bg-[#0f0f12]/80 backdrop-blur-md sticky top-0">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
              <Zap className="text-white" size={20} fill="currentColor" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Virtual Try On Studio
            </h1>
          </div>
          
          <div className="text-xs font-medium text-slate-500 px-3 py-1 border border-slate-800 rounded-full">
             Powered by Gemini 3 Pro Image
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 inline-flex gap-1 shadow-xl">
            <button
              onClick={() => setMode(AppMode.EDITOR)}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                ${mode === AppMode.EDITOR 
                  ? 'bg-slate-800 text-white shadow-lg ring-1 ring-slate-700' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}
              `}
            >
              <Wand2 size={16} />
              Magic Editor
            </button>
            <button
              onClick={() => setMode(AppMode.VTO)}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                ${mode === AppMode.VTO 
                  ? 'bg-slate-800 text-white shadow-lg ring-1 ring-slate-700' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}
              `}
            >
              <Shirt size={16} />
              Virtual Try-On
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 pb-20">
        {mode === AppMode.EDITOR ? <EditorTab /> : <VTOTab />}
      </main>
    </div>
  );
};

export default App;
