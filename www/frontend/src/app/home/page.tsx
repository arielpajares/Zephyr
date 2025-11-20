'use client';

import React, { useState } from 'react';
import { 
  Database, 
  Server, 
  Layout, 
  Zap, 
  ArrowRight
} from 'lucide-react';

// Importamos el componente externo (Asegúrate de que la ruta sea correcta en tu proyecto)
import DataStudio from '@/components/DataStudio';
import Link from 'next/link';

type ViewState = 'dashboard' | 'data-studio';

export default function ZephyrApp() {
  const [view, setView] = useState<ViewState>('dashboard');

  return (
    <div className="min-h-screen font-sans selection:bg-[#00ABE4] selection:text-white bg-[#E9F1FA]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {view === 'dashboard' && (
          <>
            {/* Hero Section */}
            <div className="mb-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 animate-fade-in-up">
              <div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                  Ship your stack <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ABE4] to-blue-600">
                    at the speed of wind.
                  </span>
                </h2>
                <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
                  Local development engine. Define your SQL schema visually, generate Laravel migrations, 
                  and scaffold Next.js frontends instantly.
                </p>
              </div>
              
              {/* Start New Project Button */}
              <div className="flex-shrink-0">
                <Link href="/workspace" className={`"group relative px-8 py-4 bg-[#00ABE4] text-white rounded-2xl font-bold text-lg shadow-xl shadow-[#00ABE4]/30 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-3 overflow-hidden"`}>
                   <span className="relative z-10">Start New Project</span>
                   <ArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" />
                   <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </Link>
              </div>
            </div>

            {/* Tools Grid */}
            <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
              <div className="bg-[#F8FAFC] rounded-[20px] p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <Zap size={20} className="text-[#00ABE4]" />
                      Core Tools
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Data Studio Card */}
                    <button 
                      onClick={() => setView('data-studio')}
                      className="group col-span-1 lg:col-span-2 p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-[#00ABE4] hover:shadow-md transition-all text-left flex flex-col md:flex-row items-start md:items-center gap-6 relative overflow-hidden"
                    >
                      <div className="w-20 h-20 rounded-2xl bg-[#E9F1FA] text-[#00ABE4] flex items-center justify-center shrink-0 group-hover:bg-[#00ABE4] group-hover:text-white transition-colors">
                          <Database size={40} />
                      </div>
                      <div className="flex-1">
                          <h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-[#00ABE4]">Data Studio</h3>
                          <p className="text-slate-500 mb-4 leading-relaxed">
                            Visually design your tables or write raw SQL. 
                            Automatically generates Migrations, Models, and API Controllers.
                          </p>
                          <div className="flex gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200">Visual Editor</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200">SQL Sync</span>
                          </div>
                      </div>
                      <div className="hidden md:block bg-slate-50 p-3 rounded-full group-hover:bg-[#00ABE4] group-hover:text-white transition-colors">
                         <ArrowRight size={24} />
                      </div>
                    </button>

                    {/* Other Tools */}
                    <button className="group p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-[#00ABE4] transition-all text-left">
                        <div className="flex items-center gap-3 mb-3 text-slate-800 font-bold text-lg">
                          <Layout className="text-[#00ABE4]" size={24} /> Frontend Scaffolder
                        </div>
                        <p className="text-sm text-slate-500">Generate Next.js Components based on your active schema.</p>
                    </button>
                    <button className="group p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-[#00ABE4] transition-all text-left">
                        <div className="flex items-center gap-3 mb-3 text-slate-800 font-bold text-lg">
                          <Server className="text-[#00ABE4]" size={24} /> Docker Manager
                        </div>
                        <p className="text-sm text-slate-500">One-click start for Laravel Sail (MySQL, Next.js).</p>
                    </button>
                  </div>
              </div>
            </div>
          </>
        )}

        {/* Data Studio View Overlay */}
        {view === 'data-studio' && (
           <DataStudio onClose={() => setView('dashboard')} />
        )}

      </main>
      
      <style jsx global>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}