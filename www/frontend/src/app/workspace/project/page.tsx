'use client';

import React, { useState } from 'react';
import { Database, Layout, Server, ArrowRight } from 'lucide-react';
// Corregimos el import para usar ruta relativa en lugar del alias '@'
import DataStudio from '../../../components/DataStudio'; 

export default function ProjectDashboard({ params }: { params: { id: string } }) {
  const [showStudio, setShowStudio] = useState(false);
  
  // Simulación de datos basada en params
  const projectId = params?.id || '1'; 
  const projectName = projectId === '1' ? 'E-Commerce Platform' : `Project #${projectId}`;

  return (
    <div className="min-h-screen bg-[#E9F1FA] p-8 font-sans">
       <div className="max-w-7xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
          
          {/* Hero del Proyecto */}
          <div className="mb-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                 <a href="/workspace" className="text-slate-400 hover:text-[#00ABE4] transition-colors text-sm font-bold flex items-center gap-1">
                    ← Back
                 </a>
                 <span className="text-slate-300">•</span>
                 <span className="text-[#00ABE4] text-sm font-bold uppercase tracking-wider">Running</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">{projectName}</h2>
              <p className="text-lg text-slate-600 mt-2">Local Development Environment</p>
            </div>
            
            <button 
              onClick={() => setShowStudio(true)}
              className="group relative px-8 py-4 bg-[#00ABE4] text-white rounded-2xl font-bold text-lg shadow-xl shadow-[#00ABE4]/30 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-3 overflow-hidden"
            >
               <span className="relative z-10">Open Data Studio</span>
               <ArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" />
               <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </div>

          {/* Grid de Herramientas */}
          <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
            <div className="bg-[#F8FAFC] rounded-[20px] p-6 md:p-8">
                <div className="flex items-center gap-2 mb-6">
                   <Layout size={20} className="text-[#00ABE4]" />
                   <h3 className="text-lg font-bold text-slate-800">Project Tools</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Tarjeta Grande: Data Studio */}
                  <button 
                    onClick={() => setShowStudio(true)}
                    className="col-span-1 lg:col-span-2 p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-[#00ABE4] hover:shadow-md transition-all text-left flex items-center gap-6 group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-[#E9F1FA] text-[#00ABE4] flex items-center justify-center group-hover:bg-[#00ABE4] group-hover:text-white transition-colors">
                       <Database size={32} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-[#00ABE4] transition-colors">Data Studio</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">Design database schema visually and auto-generate Laravel Migrations & Models.</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#00ABE4] group-hover:text-white transition-all">
                       <ArrowRight size={20} />
                    </div>
                  </button>

                  {/* Tarjetas Pequeñas */}
                  <button className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-[#00ABE4] text-left hover:shadow-md transition-all group">
                      <div className="flex items-center gap-3 mb-2 text-slate-800 font-bold group-hover:text-[#00ABE4]">
                         <Layout className="text-[#00ABE4]" /> Frontend
                      </div>
                      <p className="text-xs text-slate-500">Scaffold Next.js Pages & Components</p>
                  </button>

                  <button className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-[#00ABE4] text-left hover:shadow-md transition-all group">
                      <div className="flex items-center gap-3 mb-2 text-slate-800 font-bold group-hover:text-[#00ABE4]">
                         <Server className="text-[#00ABE4]" /> Docker
                      </div>
                      <p className="text-xs text-slate-500">
                         Container Status: <span className="text-green-500 font-bold bg-green-50 px-1.5 py-0.5 rounded">Running</span>
                      </p>
                  </button>
                </div>
            </div>
          </div>

          {/* Data Studio Modal - Ahora usando el componente importado */}
          {showStudio && <DataStudio onClose={() => setShowStudio(false)} />}
       </div>
    </div>
  );
}