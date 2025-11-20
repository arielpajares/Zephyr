'use client';

import React, { useState, useEffect } from 'react';
import { Database, X, CheckCircle, Plus, Trash2, Play, MessageSquare, Image, Mic, Code, FileText } from 'lucide-react';

// --- TYPES & HELPERS ---
export interface SchemaField { id: string; name: string; type: string; required: boolean; }
export interface SchemaResource { id: string; name: string; table: string; fields: SchemaField[]; }

const generateSQL = (resources: SchemaResource[]) => {
  return resources.map(res => {
    const fieldsSql = res.fields.map(field => {
      let sqlType = 'VARCHAR(255)';
      if (field.type === 'decimal') sqlType = 'DECIMAL(10, 2)';
      if (field.type === 'boolean') sqlType = 'BOOLEAN';
      if (field.type === 'integer') sqlType = 'INT';
      if (field.type === 'text') sqlType = 'TEXT';
      const required = field.required ? 'NOT NULL' : 'NULL';
      return `    ${field.name} ${sqlType} ${required}`;
    }).join(',\n');
    return `CREATE TABLE ${res.table} (\n    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,\n${fieldsSql},\n    created_at TIMESTAMP NULL,\n    updated_at TIMESTAMP NULL\n);`;
  }).join('\n\n');
};

// --- SIMULACIÓN DE LA API DE IA (GROQ/GEMINI) ---
const callAIAPI = async (prompt: string, imageBase64: string | null = null): Promise<SchemaResource[]> => {
    // Simulamos un retraso de 1 a 3 segundos.
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
    
    console.log("Simulando llamada a API multimodal...");
    console.log("Prompt:", prompt);
    console.log("Imagen adjunta:", !!imageBase64);

    return [{
        id: '2', 
        name: 'Order', 
        table: 'orders', 
        fields: [
            { id: 'o1', name: 'customer_email', type: 'string', required: true },
            { id: 'o2', name: 'total_amount', type: 'decimal', required: true },
            { id: 'o3', name: 'status', type: 'string', required: true },
        ]
    }];
};

interface DataStudioProps {
  onClose: () => void;
}

const AISchemaAssistant = ({ onSchemaGenerated }: { onSchemaGenerated: (schema: SchemaResource[]) => void }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const handleSubmit = async () => {
        if (!prompt && !imageFile) return;

        setIsLoading(true);
        let base64Image: string | null = null;

        if (imageFile) {
            // Lógica real de FileReader para convertir a Base64
            base64Image = "base64_data_of_image";
        }
        
        try {
            const newSchema = await callAIAPI(prompt, base64Image);
            onSchemaGenerated(newSchema);
        } catch (error) {
            console.error("Error al generar esquema:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 p-8 overflow-y-auto bg-white">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-slate-800 flex items-center justify-center gap-3">
                        <MessageSquare size={30} className='text-[#00ABE4]' />
                        AI Schema Assistant
                    </h2>
                    <p className="text-slate-500 mt-2">Describe the application you want to build and the AI will design your database schema.</p>
                </div>

                {/* Input Multimodal */}
                <textarea 
                    placeholder="Ej: 'I need a blog platform where users can post articles, with fields for title, content, and publication date.'"
                    className="w-full p-4 h-32 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-[#00ABE4] resize-none text-sm"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={isLoading}
                />

                <div className="flex justify-between items-center gap-4">
                    {/* Botones de Carga */}
                    <div className="flex gap-4">
                        <label className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${imageFile ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                            <Image size={18} /> 
                            {imageFile ? `Image: ${imageFile.name.substring(0, 15)}...` : 'Upload Image (Optional)'}
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                                className="hidden" 
                            />
                        </label>
                        <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all flex items-center gap-2" disabled={isLoading}>
                            <Mic size={18} /> Record Audio (Simulated)
                        </button>
                    </div>

                    {/* Botón de Generación */}
                    <button 
                        onClick={handleSubmit}
                        disabled={isLoading || (!prompt && !imageFile)}
                        className={`px-6 py-2 rounded-xl text-sm font-bold shadow-lg transition-all flex items-center gap-3 ${
                            isLoading || (!prompt && !imageFile) 
                            ? 'bg-slate-400 cursor-not-allowed' 
                            : 'bg-[#00ABE4] text-white hover:bg-[#0099cc] shadow-[#00ABE4]/30'
                        }`}
                    >
                        {isLoading ? (
                             <span className="flex items-center gap-2"><svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Generating...</span>
                        ) : (
                            <><Play size={16} fill="currentColor" /> Generate Schema</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};


export default function DataStudio({ onClose }: DataStudioProps) {
  const [activeView, setActiveView] = useState<'visual' | 'sql' | 'ai'>('visual');
  const [resources, setResources] = useState<SchemaResource[]>([
    { id: '1', name: 'Product', table: 'products', fields: [
      { id: 'f1', name: 'title', type: 'string', required: true },
      { id: 'f2', name: 'price', type: 'decimal', required: true },
      { id: 'f3', name: 'is_active', type: 'boolean', required: false }
    ]}
  ]);

  const sqlPreview = generateSQL(resources);
  // Nuevo estado para el input SQL editable
  const [rawSqlInput, setRawSqlInput] = useState(sqlPreview);
  
  // Sincronizar el editor SQL con los cambios del editor visual
  useEffect(() => {
    // Solo actualiza si NO estamos en la vista SQL, para no sobreescribir lo que el usuario está escribiendo.
    if (activeView !== 'sql') {
        setRawSqlInput(sqlPreview);
    }
  }, [resources, sqlPreview, activeView]);


  // Manejador para el input SQL
  const handleSqlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRawSqlInput(e.target.value);
    // TODO: Aquí iría la lógica para intentar parsear SQL (rawSqlInput) de vuelta a SchemaResource[] y actualizar el estado 'resources'.
  };
  
  // Función para recibir el esquema generado por la IA
  const handleAISchemaGenerated = (newSchema: SchemaResource[]) => {
      setResources(newSchema); 
      // La dependencia 'resources' en el useEffect se encarga de actualizar rawSqlInput.
      setActiveView('visual'); 
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-6xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-slate-900/5">
        
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#00ABE4]/10 text-[#00ABE4] rounded-xl"><Database size={22} /></div>
            <div>
                <h3 className="font-bold text-slate-800 text-lg leading-tight">Data Studio</h3>
                <p className="text-xs text-slate-500 font-medium">SQL Schema Designer</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Control de Vistas */}
            <div className="flex bg-slate-200/80 p-1 rounded-lg">
               <button onClick={() => setActiveView('visual')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeView === 'visual' ? 'bg-white text-[#00ABE4] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Visual Editor</button>
               <button onClick={() => setActiveView('sql')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeView === 'sql' ? 'bg-white text-[#00ABE4] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>SQL Editor</button>
               <button onClick={() => setActiveView('ai')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${activeView === 'ai' ? 'bg-white text-[#00ABE4] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><MessageSquare size={14} /> AI</button>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"><X size={22}/></button>
          </div>
        </div>
        
        {/* Body */}
        <div className="flex-1 flex overflow-hidden">
            {activeView === 'ai' ? (
                <AISchemaAssistant onSchemaGenerated={handleAISchemaGenerated} />
            ) : (
                <>
                {/* Sidebar del Editor */}
                <div className="w-64 bg-slate-50 border-r border-slate-200 p-4 flex flex-col gap-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">Tables</div>
                    {resources.map(r => (
                        <button key={r.id} className="w-full text-left px-4 py-3 rounded-xl bg-white border border-[#00ABE4] text-[#00ABE4] text-sm font-bold shadow-sm flex justify-between items-center group">
                            {r.name}
                            <span className="w-2 h-2 rounded-full bg-[#00ABE4]"></span>
                        </button>
                    ))}
                    <button className="w-full py-3 border border-dashed border-slate-300 rounded-xl text-slate-400 text-xs font-bold hover:border-[#00ABE4] hover:text-[#00ABE4] transition-colors flex justify-center items-center gap-2">
                        <Plus size={14} /> New Table
                    </button>
                </div>

                {/* Main Editor/SQL Area */}
                <div className="flex-1 bg-white flex flex-col">
                    {activeView === 'visual' ? (
                        <div className="flex-1 p-8 overflow-auto">
                            <div className="max-w-3xl mx-auto">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-slate-800">{resources[0].name} <span className="text-slate-300 font-normal">Table</span></h2>
                                    <div className="px-3 py-1 bg-slate-100 rounded text-xs font-mono text-slate-500">{resources[0].table}</div>
                                </div>
                                
                                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                    <div className="bg-slate-50 p-3 grid grid-cols-12 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider gap-4 border-b border-slate-200">
                                       <div className="col-span-4 pl-2">Column Name</div>
                                       <div className="col-span-3">Data Type</div>
                                       <div className="col-span-3 text-center">Required</div>
                                       <div className="col-span-2 text-right pr-2">Actions</div>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {resources[0].fields.map(f => (
                                           <div key={f.id} className="p-3 grid grid-cols-12 items-center gap-4 hover:bg-slate-50/50 transition-colors group">
                                              <div className="col-span-4 pl-2 font-mono font-bold text-sm text-slate-700">{f.name}</div>
                                              <div className="col-span-3">
                                                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                   {f.type}
                                                 </span>
                                              </div>
                                              <div className="col-span-3 flex justify-center">
                                                 {f.required ? <CheckCircle size={16} className="text-[#00ABE4]" /> : <span className="w-4 h-4 rounded-full border border-slate-200"></span>}
                                              </div>
                                              <div className="col-span-2 flex justify-end pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                 <button className="text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                                              </div>
                                           </div>
                                        ))}
                                    </div>
                                    <button className="w-full py-3 bg-slate-50 text-xs font-bold text-[#00ABE4] hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 border-t border-slate-200">
                                       <Plus size={14} /> Add Column
                                    </button>
                                </div>
                            </div>
                         </div>
                    ) : (
                        <div className="flex-1 bg-[#0F172A] p-0 relative">
                            <div className="absolute top-0 left-0 right-0 bg-[#1E293B] px-4 py-2 flex justify-between items-center border-b border-slate-700">
                               <span className="text-xs text-slate-400 font-mono">generated_migration.php (Editor)</span>
                               <span className="text-[10px] bg-[#00ABE4] text-white px-2 py-0.5 rounded font-bold">RAW</span>
                            </div>
                            <textarea 
                               className="w-full h-full bg-transparent text-blue-300 font-mono text-sm p-6 pt-12 focus:outline-none resize-none" 
                               value={rawSqlInput} // Usa el estado editable
                               onChange={handleSqlChange} // Agrega el manejador
                            />
                        </div>
                    )}
                </div>
                </>
            )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
             <div className="flex items-center gap-2 text-xs text-slate-500">
                <CheckCircle size={14} className="text-green-500" />
                <span>Schema validated successfully</span>
             </div>
             <div className="flex gap-3">
               <button className="px-5 py-2.5 bg-white border border-slate-300 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-400 transition-all">
                 Save Draft
               </button>
               <button className="px-6 py-2.5 bg-[#00ABE4] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#00ABE4]/30 hover:bg-[#0099cc] hover:shadow-[#0099cc]/40 transition-all flex items-center gap-2 transform active:scale-95">
                 <Play size={16} fill="currentColor" /> Generate Files
               </button>
             </div>
        </div>
      </div>
    </div>
  );
}