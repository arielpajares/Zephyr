'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
    Database, X, CheckCircle, Plus, Trash2, Play, 
    MessageSquare, Image, Mic, Table as TableIcon, 
    Square, Upload, Download, Save, Key, Link as LinkIcon,
    Hash, Settings, Columns, GitMerge, ChevronDown,
    ArrowRight
} from 'lucide-react';

// --- TYPES & HELPERS ---

export interface SchemaForeignKey {
    table: string;     
    field: string;     
    onDelete: 'CASCADE' | 'SET NULL' | 'RESTRICT';
}

export interface SchemaField { 
    id: string; 
    name: string; 
    type: string; 
    length?: number; 
    required: boolean; 
    defaultValue?: string; 
    foreignKey?: SchemaForeignKey; 
    isPrimaryKey?: boolean;
    autoIncrement?: boolean;
    unsigned?: boolean;
}

export interface SchemaPrimaryKeyColumn {
    id: string;
    name: string;
    type: 'integer' | 'bigint' | 'uuid' | 'string';
    autoIncrement: boolean;
    length?: number;   
    unsigned?: boolean;
    foreignKey?: SchemaForeignKey; 
}

export interface SchemaResource { 
    id: string; 
    name: string; 
    table: string; 
    primaryKeys: SchemaPrimaryKeyColumn[]; 
    fields: SchemaField[]; 
}

// 1. GENERATOR: Visual -> SQL
const generateSQL = (resources: SchemaResource[]) => {
  if (!resources || resources.length === 0) return "-- No tables defined";
  
  return resources.map(res => {
    const pkColumnLines: string[] = [];
    const pkNames: string[] = [];
    const constraintLines: string[] = [];

    // Generate PK Columns Definitions
    res.primaryKeys.forEach(pk => {
        let pkDef = '';
        switch (pk.type) {
            case 'integer': pkDef = `INT`; break;
            case 'bigint': pkDef = `BIGINT`; break;
            case 'uuid': pkDef = `CHAR(36)`; break;
            case 'string': pkDef = `VARCHAR(${pk.length || 255})`; break;
            default: pkDef = `BIGINT`;
        }

        if ((pk.type === 'integer' || pk.type === 'bigint') && pk.unsigned !== false) {
            pkDef += ' UNSIGNED';
        }

        if (pk.autoIncrement && (pk.type === 'integer' || pk.type === 'bigint')) {
            pkDef += ' AUTO_INCREMENT';
        }
        
        pkColumnLines.push(`    ${pk.name} ${pkDef}`);
        pkNames.push(pk.name);

        if (pk.foreignKey) {
            const fkName = `fk_${res.table}_${pk.name}`;
            constraintLines.push(`    CONSTRAINT ${fkName} FOREIGN KEY (${pk.name}) REFERENCES ${pk.foreignKey.table}(${pk.foreignKey.field}) ON DELETE ${pk.foreignKey.onDelete}`);
        }
    });

    const fieldLines: string[] = [];

    res.fields.forEach(field => {
      let sqlType = 'VARCHAR(255)';
      const isNumeric = ['integer', 'bigInteger', 'decimal'].includes(field.type);

      switch (field.type) {
          case 'integer': sqlType = 'INT'; break;
          case 'bigInteger': sqlType = 'BIGINT'; break;
          case 'decimal': sqlType = 'DECIMAL(10, 2)'; break;
          case 'boolean': sqlType = 'BOOLEAN'; break;
          case 'text': sqlType = 'TEXT'; break;
          case 'date': sqlType = 'DATE'; break;
          case 'timestamp': sqlType = 'TIMESTAMP'; break;
          case 'uuid': sqlType = 'CHAR(36)'; break;
          case 'string': sqlType = `VARCHAR(${field.length || 255})`; break;
      }
      
      if (field.foreignKey && (field.type === 'integer' || field.type === 'bigInteger')) {
           sqlType += ' UNSIGNED';
      }

      const required = field.required ? 'NOT NULL' : 'NULL';
      let line = `    ${field.name} ${sqlType} ${required}`;

      if (field.defaultValue !== undefined && field.defaultValue !== '') {
          const isString = ['string', 'text', 'date', 'uuid'].includes(field.type);
          const isKeyword = ['CURRENT_TIMESTAMP', 'NULL'].includes(field.defaultValue.toUpperCase());
          if (isString && !isKeyword) line += ` DEFAULT '${field.defaultValue}'`;
          else line += ` DEFAULT ${field.defaultValue}`;
      }

      fieldLines.push(line);

      if (field.foreignKey) {
          const fkName = `fk_${res.table}_${field.name}`;
          constraintLines.push(`    CONSTRAINT ${fkName} FOREIGN KEY (${field.name}) REFERENCES ${field.foreignKey.table}(${field.foreignKey.field}) ON DELETE ${field.foreignKey.onDelete}`);
      }
    });

    const bodyParts = [
        ...pkColumnLines, 
        ...fieldLines, 
        '    created_at TIMESTAMP NULL', 
        '    updated_at TIMESTAMP NULL', 
        `    PRIMARY KEY (${pkNames.join(', ')})`,
        ...constraintLines
    ];

    return `CREATE TABLE ${res.table} (\n${bodyParts.join(',\n')}\n);`;
  }).join('\n\n');
};

// 2. PARSER: SQL -> Visual 
const parseSQLToResources = (sql: string): SchemaResource[] => {
    const tables: SchemaResource[] = [];
    const tableRegex = /CREATE\s+TABLE\s+`?(\w+)`?\s*\(([\s\S]*?)\);/gim;
    let match;

    while ((match = tableRegex.exec(sql)) !== null) {
        const tableName = match[1];
        const body = match[2];
        
        const fields: SchemaField[] = [];
        const primaryKeys: SchemaPrimaryKeyColumn[] = [];
        const foreignKeys: Record<string, SchemaForeignKey> = {};
        let pkConstraintNames: string[] = [];

        const lines = body.split(/,\n/).map(l => l.trim()).filter(l => l);

        lines.forEach(line => {
            const upperLine = line.toUpperCase();
            if (upperLine.startsWith('PRIMARY KEY')) {
                const pkMatch = line.match(/\((.*?)\)/);
                if (pkMatch) pkConstraintNames = pkMatch[1].split(',').map(k => k.trim().replace(/`/g, ''));
                return;
            }

            if (upperLine.startsWith('CONSTRAINT') && upperLine.includes('FOREIGN KEY')) {
                const fkMatch = line.match(/FOREIGN KEY\s*\((.*?)\)\s*REFERENCES\s*(\w+)\s*\((.*?)\)\s*(ON DELETE\s+(\w+))?/i);
                if (fkMatch) {
                    const localField = fkMatch[1].replace(/`/g, '').trim();
                    foreignKeys[localField] = {
                        table: fkMatch[2].replace(/`/g, '').trim(),
                        field: fkMatch[3].replace(/`/g, '').trim(),
                        onDelete: fkMatch[5] ? (fkMatch[5].toUpperCase() === 'SET' ? 'SET NULL' : fkMatch[5].toUpperCase()) : 'RESTRICT'
                    } as any;
                }
            }
        });

        lines.forEach((line, index) => {
            const upperLine = line.toUpperCase();
            if (upperLine.startsWith('CONSTRAINT') || upperLine.startsWith('FOREIGN') || upperLine.startsWith('KEY') || upperLine.startsWith('PRIMARY KEY')) return;

            const parts = line.split(/\s+/);
            const colName = parts[0].replace(/`/g, '');

            if (colName === 'created_at' || colName === 'updated_at') return;

            const isAutoInc = upperLine.includes('AUTO_INCREMENT');
            const isUnsigned = upperLine.includes('UNSIGNED');
            const rawType = parts[1].toUpperCase();
            let uiType: any = 'string';
            let length = undefined;

            if (rawType.includes('BIGINT')) uiType = 'bigint';
            else if (rawType.includes('INT')) uiType = 'integer';
            else if (rawType.includes('DECIMAL')) uiType = 'decimal';
            else if (rawType.includes('BOOL') || rawType.includes('TINYINT')) uiType = 'boolean';
            else if (rawType.includes('TEXT')) uiType = 'text';
            else if (rawType.includes('DATE')) uiType = 'date';
            else if (rawType.includes('CHAR(36)')) uiType = 'uuid';
            else if (rawType.includes('VARCHAR')) {
                uiType = 'string';
                const lenMatch = rawType.match(/\((\d+)\)/);
                if (lenMatch) length = parseInt(lenMatch[1]);
            }

            if (pkConstraintNames.includes(colName) || upperLine.includes('PRIMARY KEY')) {
                primaryKeys.push({
                    id: `pk-${index}`, name: colName, type: (uiType === 'bigint' || uiType === 'integer' || uiType === 'uuid') ? uiType : 'string',
                    autoIncrement: isAutoInc, unsigned: isUnsigned, length: length, foreignKey: foreignKeys[colName]
                });
            } else {
                let fieldUiType = uiType === 'bigint' ? 'bigInteger' : uiType;
                const isRequired = upperLine.includes('NOT NULL');
                let defaultValue = '';
                const defaultMatch = line.match(/DEFAULT\s+('([^']*)'|(\S+))/i);
                if (defaultMatch) defaultValue = defaultMatch[2] || defaultMatch[3] || '';

                fields.push({
                    id: `parsed-${tableName}-${index}`, name: colName, type: fieldUiType, length,
                    required: isRequired, defaultValue: defaultValue, foreignKey: foreignKeys[colName] 
                });
            }
        });

        if (primaryKeys.length === 0) {
             primaryKeys.push({ id: 'def-pk', name: 'id', type: 'bigint', autoIncrement: true, unsigned: true });
        }

        tables.push({
            id: `parsed-${Date.now()}-${tables.length}`,
            name: tableName.charAt(0).toUpperCase() + tableName.slice(1),
            table: tableName,
            primaryKeys,
            fields
        });
    }
    return tables.length > 0 ? tables : [];
};

// --- API CALL ---
const callAIAPI = async (prompt: string, currentSchema: string, imageBase64: string | null = null, audioBase64: string | null = null): Promise<{sql: string, transcription?: string}> => {
    try {
        const response = await fetch('/internal/ai/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, currentSchema, image: imageBase64, audio: audioBase64 }),
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.error || "AI Processing Error");
        return { sql: data.sql, transcription: data.transcription }; 
    } catch (error) {
        console.error("API Failed:", error);
        throw error;
    }
};

interface DataStudioProps { onClose: () => void; }

// --- AI COMPONENT ---
const AISchemaAssistant = ({ currentSql, onSqlGenerated }: { currentSql: string, onSqlGenerated: (sql: string) => void }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];
            mediaRecorderRef.current.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
            mediaRecorderRef.current.onstop = () => { setAudioBlob(new Blob(chunksRef.current, { type: 'audio/webm' })); };
            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) { alert("Microphone access denied."); }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleSubmit = async () => {
        if (!prompt && !imageFile && !audioBlob) return;
        setIsLoading(true);
        const fileToBase64 = (blob: Blob): Promise<string> => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        };
        try {
            let base64Image = imageFile ? await fileToBase64(imageFile) : null;
            let base64Audio = audioBlob ? await fileToBase64(audioBlob) : null;
            const result = await callAIAPI(prompt, currentSql, base64Image, base64Audio);
            onSqlGenerated(result.sql);
        } catch (error) { alert("Generation failed."); } finally { setIsLoading(false); }
    };

    return (
        <div className="flex-1 p-8 overflow-y-auto bg-white">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-800 flex items-center justify-center gap-3"><MessageSquare size={30} className='text-[#00ABE4]' /> AI Schema Assistant</h2>
                    <p className="text-slate-500 mt-2">Describe your schema changes via text, image or voice.</p>
                </div>
                <textarea placeholder="E.g.: 'Make email unique and add phone number'" className="w-full p-4 h-32 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-[#00ABE4] resize-none text-sm" value={prompt} onChange={(e) => setPrompt(e.target.value)} disabled={isLoading} />
                <div className="flex flex-wrap gap-4 justify-between items-start">
                    <div className="flex flex-wrap gap-3">
                        <label className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2 border ${imageFile ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                            <Image size={18} /> {imageFile ? 'Diagram Attached' : 'Add Diagram'} <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} className="hidden" />
                        </label>
                        {!isRecording ? (
                            <button onClick={startRecording} disabled={!!audioBlob} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border ${audioBlob ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                <Mic size={18} /> {audioBlob ? 'Voice Recorded' : 'Record Voice'}
                            </button>
                        ) : (
                            <button onClick={stopRecording} className="px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 animate-pulse"><Square size={18} fill="currentColor" /> Stop</button>
                        )}
                    </div>
                    <button onClick={handleSubmit} disabled={isLoading} className={`px-8 py-3 rounded-xl text-sm font-bold shadow-lg transition-all flex items-center gap-3 ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#00ABE4] text-white hover:bg-[#0099cc] shadow-[#00ABE4]/20'}`}>{isLoading ? 'Processing...' : <><Play size={18} fill="currentColor" /> Apply Changes</>}</button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
export default function DataStudio({ onClose }: DataStudioProps) {
  const [activeView, setActiveView] = useState<'visual' | 'sql' | 'ai'>('visual');
  const [mode, setMode] = useState<'standalone' | 'project'>('project');
  const [tab, setTab] = useState<'columns' | 'settings' | 'relations'>('columns');
  const [isAddRelOpen, setIsAddRelOpen] = useState(false); // State for Add Relationship dropdown

  const [resources, setResources] = useState<SchemaResource[]>([
    { 
        id: '1', name: 'Product', table: 'products', 
        primaryKeys: [{ id: 'pk1', name: 'id', type: 'bigint', autoIncrement: true, unsigned: true }],
        fields: [
            { id: 'f1', name: 'title', type: 'string', required: true, defaultValue: '', isPrimaryKey: false, autoIncrement: false, unsigned: false },
            { id: 'f2', name: 'price', type: 'decimal', required: true, defaultValue: '0.00', isPrimaryKey: false, autoIncrement: false, unsigned: false }
        ]
    }
  ]);

  const [selectedTableIdx, setSelectedTableIdx] = useState(0);
  const sqlPreview = generateSQL(resources);
  const [rawSqlInput, setRawSqlInput] = useState(sqlPreview);

  useEffect(() => {
     if (typeof window !== 'undefined') setMode(window.location.href.includes('/project') ? 'project' : 'standalone');
  }, []);

  useEffect(() => {
    if (activeView !== 'sql') setRawSqlInput(generateSQL(resources));
  }, [resources, activeView]);

  // Actions
  const handleAddTable = () => {
      setResources([...resources, {
          id: Date.now().toString(), name: 'New Model', table: 'new_table',
          primaryKeys: [{ id: Date.now() + 'pk', name: 'id', type: 'bigint', autoIncrement: true, unsigned: true }],
          fields: [{ id: Date.now() + '-f', name: 'name', type: 'string', required: true, isPrimaryKey: false, autoIncrement: false, unsigned: false }]
      }]);
      setSelectedTableIdx(resources.length); setTab('settings');
  };

  const handleRemoveTable = (idx: number) => {
      const newRes = resources.filter((_, i) => i !== idx);
      setResources(newRes);
      if (selectedTableIdx >= newRes.length) setSelectedTableIdx(Math.max(0, newRes.length - 1));
  };

  const handleUpdateTable = (key: keyof SchemaResource, val: any) => {
      const updated = [...resources];
      // @ts-ignore
      updated[selectedTableIdx][key] = val;
      setResources(updated);
  };

  // PK Actions
  const handleAddPK = () => {
      const updated = [...resources];
      updated[selectedTableIdx].primaryKeys.push({
          id: Date.now().toString(), name: 'new_id', type: 'integer', autoIncrement: false, unsigned: true
      });
      setResources(updated);
  }

  const handleRemovePK = (pkIdx: number) => {
      const updated = [...resources];
      if (updated[selectedTableIdx].primaryKeys.length > 1) {
          updated[selectedTableIdx].primaryKeys.splice(pkIdx, 1);
          setResources(updated);
      } else {
          alert("A table must have at least one primary key.");
      }
  }

  const handleUpdatePK = (pkIdx: number, key: keyof SchemaPrimaryKeyColumn, val: any) => {
      const updated = [...resources];
      // @ts-ignore
      updated[selectedTableIdx].primaryKeys[pkIdx][key] = val;
      
      const currentPK = updated[selectedTableIdx].primaryKeys[pkIdx];
      if (key === 'type' && !['integer', 'bigint'].includes(String(val))) {
          currentPK.autoIncrement = false;
          currentPK.unsigned = false;
      }
      setResources(updated);
  };
  
  // NEW: PK Foreign Key Logic
  const handleUpdatePK_FK = (pkIdx: number, isFk: boolean) => {
      const updated = [...resources];
      if (isFk) {
          const otherTable = resources.find((_, i) => i !== selectedTableIdx) || resources[selectedTableIdx];
          updated[selectedTableIdx].primaryKeys[pkIdx].foreignKey = {
              table: otherTable.table, field: 'id', onDelete: 'CASCADE'
          };
      } else {
          updated[selectedTableIdx].primaryKeys[pkIdx].foreignKey = undefined;
      }
      setResources(updated);
  };

  const handleUpdatePK_FKDetail = (pkIdx: number, key: keyof SchemaForeignKey, val: any) => {
      const updated = [...resources];
      if (updated[selectedTableIdx].primaryKeys[pkIdx].foreignKey) {
          // @ts-ignore
          updated[selectedTableIdx].primaryKeys[pkIdx].foreignKey[key] = val;
      }
      setResources(updated);
  };

  const handleAddField = () => {
      const updated = [...resources];
      updated[selectedTableIdx].fields.push({ 
          id: Date.now().toString(), name: 'new_column', type: 'string', 
          required: false, isPrimaryKey: false, autoIncrement: false, unsigned: false, defaultValue: '' 
      });
      setResources(updated);
  };

  const handleRemoveField = (idx: number) => {
      const updated = [...resources];
      updated[selectedTableIdx].fields.splice(idx, 1);
      setResources(updated);
  };

  const handleUpdateField = (idx: number, key: keyof SchemaField, val: any) => {
      const updated = [...resources];
      // @ts-ignore
      updated[selectedTableIdx].fields[idx][key] = val;
      setResources(updated);
  };
  
  // FK Logic (Fields)
  const handleAddFK = (fieldIdx: number) => {
      const updated = [...resources];
      const otherTable = resources.find((_, i) => i !== selectedTableIdx) || resources[selectedTableIdx];
      updated[selectedTableIdx].fields[fieldIdx].foreignKey = {
          table: otherTable.table, field: 'id', onDelete: 'CASCADE'
      };
      updated[selectedTableIdx].fields[fieldIdx].type = 'bigInteger'; 
      setResources(updated);
      setIsAddRelOpen(false); // Close dropdown after adding
  };
  
  const handleRemoveFK = (fieldIdx: number) => {
      const updated = [...resources];
      updated[selectedTableIdx].fields[fieldIdx].foreignKey = undefined;
      setResources(updated);
  };

  const handleUpdateFKDetail = (fieldIdx: number, key: keyof SchemaForeignKey, val: any) => {
      const updated = [...resources];
      if (updated[selectedTableIdx].fields[fieldIdx].foreignKey) {
          // @ts-ignore
          updated[selectedTableIdx].fields[fieldIdx].foreignKey[key] = val;
      }
      setResources(updated);
  };

  const handleSqlUpdate = (newSql: string) => {
    setRawSqlInput(newSql);
    const parsed = parseSQLToResources(newSql);
    if (parsed.length > 0) { setResources(parsed); setSelectedTableIdx(0); }
  };

  const handleDownloadSQL = () => {
      const element = document.createElement("a");
      const file = new Blob([rawSqlInput], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = "schema.sql";
      document.body.appendChild(element); element.click(); document.body.removeChild(element);
  };

  const currentTable = resources[selectedTableIdx];

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-[90rem] h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#00ABE4]/10 text-[#00ABE4] rounded-xl"><Database size={22} /></div>
            <div><h3 className="font-bold text-slate-800 text-lg">Data Studio</h3><p className="text-xs text-slate-500 font-medium">{mode === 'standalone' ? 'Standalone Designer' : 'Project Editor'}</p></div>
          </div>
          <div className="flex gap-4">
            <div className="flex bg-slate-200/80 p-1 rounded-lg">
               <button onClick={() => setActiveView('visual')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeView === 'visual' ? 'bg-white text-[#00ABE4] shadow-sm' : 'text-slate-500'}`}>Visual</button>
               <button onClick={() => setActiveView('sql')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeView === 'sql' ? 'bg-white text-[#00ABE4] shadow-sm' : 'text-slate-500'}`}>SQL</button>
               <button onClick={() => setActiveView('ai')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${activeView === 'ai' ? 'bg-white text-[#00ABE4] shadow-sm' : 'text-slate-500'}`}><MessageSquare size={14} /> AI</button>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-full"><X size={22}/></button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
            {activeView === 'ai' ? ( <AISchemaAssistant currentSql={rawSqlInput} onSqlGenerated={(sql) => { handleSqlUpdate(sql); setActiveView('visual'); }} /> ) : (
                <>
                <div className="w-64 bg-slate-50 border-r border-slate-200 p-4 flex flex-col gap-2 overflow-y-auto">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">Tables</div>
                    {resources.map((r, idx) => (
                        <div key={r.id} className="flex items-center gap-2 group">
                            <button onClick={() => setSelectedTableIdx(idx)} className={`flex-1 text-left px-4 py-3 rounded-xl text-sm font-bold shadow-sm flex justify-between items-center transition-all ${selectedTableIdx === idx ? 'bg-white border border-[#00ABE4] text-[#00ABE4]' : 'bg-white border border-transparent text-slate-600 hover:bg-slate-100'}`}>{r.name} {selectedTableIdx === idx && <span className="w-2 h-2 rounded-full bg-[#00ABE4]"></span>}</button>
                            <button onClick={() => handleRemoveTable(idx)} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                        </div>
                    ))}
                    <button onClick={handleAddTable} className="w-full py-3 border border-dashed border-slate-300 rounded-xl text-slate-400 text-xs font-bold hover:border-[#00ABE4] hover:text-[#00ABE4] transition-colors flex justify-center items-center gap-2 mt-2"><Plus size={14} /> New Table</button>
                </div>

                <div className="flex-1 bg-white flex flex-col">
                    {activeView === 'visual' ? (
                        <div className="flex-1 p-8 overflow-auto flex flex-col">
                            {currentTable ? (
                                <div className="max-w-5xl mx-auto w-full">
                                    
                                    {/* Table Tabs */}
                                    <div className="flex items-center gap-6 mb-8 border-b border-slate-200 pb-1">
                                        <button onClick={() => setTab('columns')} className={`pb-3 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 ${tab === 'columns' ? 'border-[#00ABE4] text-[#00ABE4]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}><Columns size={16}/> Columns</button>
                                        <button onClick={() => setTab('settings')} className={`pb-3 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 ${tab === 'settings' ? 'border-[#00ABE4] text-[#00ABE4]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}><Settings size={16}/> Settings</button>
                                        <button onClick={() => setTab('relations')} className={`pb-3 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 ${tab === 'relations' ? 'border-[#00ABE4] text-[#00ABE4]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}><GitMerge size={16}/> Keys & Relations</button>
                                    </div>
                                    
                                    {/* TAB 1: COLUMNS */}
                                    {tab === 'columns' && (
                                        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                            <div className="bg-slate-50 p-3 grid grid-cols-12 text-[10px] font-extrabold text-slate-400 uppercase gap-2 text-center items-center">
                                            <div className="col-span-4 text-left pl-2">Column Name</div>
                                            <div className="col-span-3">Data Type</div>
                                            <div className="col-span-1">Len</div>
                                            <div className="col-span-2">Default Value</div>
                                            <div className="col-span-1">Required</div>
                                            <div className="col-span-1"></div>
                                            </div>
                                            <div className="divide-y divide-slate-100">
                                                {currentTable.fields.map((f, fIdx) => (
                                                    <div key={f.id} className="p-3 grid grid-cols-12 items-center gap-2 hover:bg-slate-50/50 group">
                                                        <div className="col-span-4"><input value={f.name} onChange={(e) => handleUpdateField(fIdx, 'name', e.target.value)} className="w-full font-mono font-bold text-sm bg-transparent outline-none border-b border-transparent focus:border-[#00ABE4]" placeholder="column_name"/></div>
                                                        <div className="col-span-3"><select value={f.type} onChange={(e) => handleUpdateField(fIdx, 'type', e.target.value)} className="w-full text-xs bg-white border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-[#00ABE4]"><option value="string">String</option><option value="integer">Integer</option><option value="bigInteger">BigInteger</option><option value="decimal">Decimal</option><option value="boolean">Boolean</option><option value="text">Text</option><option value="date">Date</option><option value="timestamp">Timestamp</option><option value="uuid">UUID</option></select></div>
                                                        <div className="col-span-1"><input disabled={!['string', 'text'].includes(f.type)} value={f.length || ''} onChange={(e) => handleUpdateField(fIdx, 'length', e.target.value)} className="w-full text-xs text-center bg-white border border-slate-200 rounded px-1 py-1.5 outline-none focus:border-[#00ABE4] disabled:bg-slate-50 disabled:text-slate-300" placeholder="-"/></div>
                                                        <div className="col-span-2"><input value={f.defaultValue || ''} onChange={(e) => handleUpdateField(fIdx, 'defaultValue', e.target.value)} className="w-full text-xs bg-white border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-[#00ABE4]" placeholder="NULL"/></div>
                                                        <div className="col-span-1 flex justify-center"><button onClick={() => handleUpdateField(fIdx, 'required', !f.required)}>{f.required ? <CheckCircle size={18} className="text-[#00ABE4]"/> : <div className="w-4.5 h-4.5 rounded border border-slate-300 hover:border-slate-400"></div>}</button></div>
                                                        <div className="col-span-1 flex justify-end"><button onClick={() => handleRemoveField(fIdx)} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button></div>
                                                    </div>
                                                ))}
                                            </div>
                                            <button onClick={handleAddField} className="w-full py-3 bg-slate-50 text-xs font-bold text-[#00ABE4] hover:bg-slate-100 transition-colors border-t border-slate-200"><Plus size={14} className="inline mr-1"/> Add Column</button>
                                        </div>
                                    )}

                                    {/* TAB 2: SETTINGS */}
                                    {tab === 'settings' && (
                                        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Model Name (Class)</label><input type="text" value={currentTable.name} onChange={(e) => handleUpdateTable('name', e.target.value)} className="w-full text-lg font-bold text-slate-800 border-b-2 border-slate-200 focus:border-[#00ABE4] outline-none bg-transparent py-1" /></div>
                                                <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Table Name (DB)</label><input type="text" value={currentTable.table} onChange={(e) => handleUpdateTable('table', e.target.value)} className="w-full font-mono text-sm text-slate-600 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#00ABE4] outline-none" /></div>
                                            </div>
                                        </div>
                                    )}

                                    {/* TAB 3: KEYS & RELATIONSHIPS */}
                                    {tab === 'relations' && (
                                        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-8">
                                            
                                            {/* Primary Keys Config (Moved here) */}
                                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                                                    <div className="flex items-center gap-2">
                                                        <Key size={18} className="text-[#00ABE4]" />
                                                        <span className="text-sm font-bold text-slate-700">Primary Keys</span>
                                                    </div>
                                                    <button onClick={handleAddPK} className="text-xs font-bold text-[#00ABE4] hover:bg-blue-50 px-2 py-1 rounded transition-colors">+ Add Composite Key</button>
                                                </div>
                                                
                                                <div className="space-y-4">
                                                    {currentTable.primaryKeys.map((pk, pkIdx) => {
                                                        const isNumericPK = ['integer', 'bigint'].includes(pk.type);
                                                        return (
                                                            <div key={pk.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group">
                                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                                    <div><label className="block text-[10px] text-slate-400 mb-1 uppercase font-bold">PK Name</label><input type="text" value={pk.name} onChange={(e) => handleUpdatePK(pkIdx, 'name', e.target.value)} className="w-full font-mono text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#00ABE4]" /></div>
                                                                    <div><label className="block text-[10px] text-slate-400 mb-1 uppercase font-bold">Data Type</label><select value={pk.type} onChange={(e) => handleUpdatePK(pkIdx, 'type', e.target.value)} className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#00ABE4]"><option value="bigint">Big Integer</option><option value="integer">Integer</option><option value="uuid">UUID</option><option value="string">String</option></select></div>
                                                                </div>
                                                                <div className="flex gap-8 items-center">
                                                                     <div onClick={() => isNumericPK && handleUpdatePK(pkIdx, 'autoIncrement', !pk.autoIncrement)} className={`flex items-center gap-3 cursor-pointer ${!isNumericPK ? 'opacity-40 pointer-events-none' : ''}`}>
                                                                         {pk.autoIncrement ? <CheckCircle size={20} className="text-[#00ABE4]"/> : <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>}
                                                                         <div><p className="text-sm font-bold text-slate-700">Auto Increment</p></div>
                                                                     </div>
                                                                     <div onClick={() => isNumericPK && handleUpdatePK(pkIdx, 'unsigned', !pk.unsigned)} className={`flex items-center gap-3 cursor-pointer ${!isNumericPK ? 'opacity-40 pointer-events-none' : ''}`}>
                                                                         {pk.unsigned !== false ? <CheckCircle size={20} className="text-[#00ABE4]"/> : <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>}
                                                                         <div><p className="text-sm font-bold text-slate-700">Unsigned</p></div>
                                                                     </div>
                                                                     
                                                                     {/* FK TOGGLE FOR PK */}
                                                                     <div className="ml-auto flex flex-col gap-1 border-l border-slate-100 pl-4">
                                                                        <div onClick={() => handleUpdatePK_FK(pkIdx, !pk.foreignKey)} className="flex items-center gap-2 cursor-pointer">
                                                                            {!!pk.foreignKey ? <CheckCircle size={20} className="text-blue-500"/> : <div className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-blue-400"></div>}
                                                                            <span className="text-xs font-bold text-slate-500">Is Foreign Key?</span>
                                                                        </div>
                                                                        {pk.foreignKey && (
                                                                             <div className="flex gap-1 mt-1">
                                                                                <select className="text-[10px] bg-blue-50 border border-blue-100 rounded px-1" value={pk.foreignKey.table} onChange={(e) => handleUpdatePK_FKDetail(pkIdx, 'table', e.target.value)}>
                                                                                    {resources.filter(r => r.id !== currentTable.id).map(r => <option key={r.id} value={r.table}>{r.table}</option>)}
                                                                                </select>
                                                                                <select className="text-[10px] bg-blue-50 border border-blue-100 rounded px-1" value={pk.foreignKey.onDelete} onChange={(e) => handleUpdatePK_FKDetail(pkIdx, 'onDelete', e.target.value)}>
                                                                                    <option value="CASCADE">Casc</option><option value="SET NULL">Null</option>
                                                                                </select>
                                                                             </div>
                                                                        )}
                                                                     </div>
                                                                </div>
                                                                {currentTable.primaryKeys.length > 1 && (
                                                                    <button onClick={() => handleRemovePK(pkIdx)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500"><Trash2 size={14}/></button>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Foreign Keys */}
                                            <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-2xl">
                                                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-blue-200">
                                                    <GitMerge size={18} className="text-blue-500" />
                                                    <span className="text-sm font-bold text-blue-700">Relationships (Foreign Keys)</span>
                                                </div>

                                                <div className="space-y-3">
                                                    {currentTable.fields.filter(f => f.foreignKey).map((f, fIdx) => {
                                                        const realIdx = currentTable.fields.findIndex(x => x.id === f.id);
                                                        return (
                                                            <div key={f.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm">
                                                                <div className="p-2 bg-slate-100 rounded-lg"><LinkIcon size={16} className="text-slate-500"/></div>
                                                                <div className="flex-1 grid grid-cols-3 gap-4 items-center">
                                                                    <div>
                                                                        <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Local Column</label>
                                                                        <input value={f.name} onChange={(e) => handleUpdateField(realIdx, 'name', e.target.value)} className="w-full font-mono text-sm font-bold text-slate-700 bg-transparent outline-none border-b border-slate-200 focus:border-[#00ABE4]" />
                                                                    </div>
                                                                    <div className="flex items-center justify-center"><ArrowRight size={16} className="text-slate-300"/></div>
                                                                    <div>
                                                                        <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Connects To</label>
                                                                        <select className="w-full text-sm font-bold text-blue-600 bg-blue-50 rounded px-2 py-1 outline-none" value={f.foreignKey!.table} onChange={(e) => handleUpdateFKDetail(realIdx, 'table', e.target.value)}>
                                                                            {resources.filter(r => r.id !== currentTable.id).map(r => <option key={r.id} value={r.table}>{r.table}</option>)}
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                                <div className="border-l border-slate-100 pl-4 flex flex-col gap-2">
                                                                    <select className="text-[10px] font-bold text-slate-500 bg-slate-50 rounded px-2 py-1" value={f.foreignKey!.onDelete} onChange={(e) => handleUpdateFKDetail(realIdx, 'onDelete', e.target.value)}>
                                                                        <option value="CASCADE">On Delete: Cascade</option>
                                                                        <option value="SET NULL">On Delete: Set Null</option>
                                                                        <option value="RESTRICT">On Delete: Restrict</option>
                                                                    </select>
                                                                </div>
                                                                <button onClick={() => handleRemoveFK(realIdx)} className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={16}/></button>
                                                            </div>
                                                        );
                                                    })}

                                                    {/* Click-to-add Interaction */}
                                                    <div className="relative">
                                                        <button 
                                                            onClick={() => setIsAddRelOpen(!isAddRelOpen)}
                                                            className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold text-sm hover:border-[#00ABE4] hover:text-[#00ABE4] hover:bg-blue-50/30 transition-all flex justify-center items-center gap-2"
                                                        >
                                                            <Plus size={18}/> Add Relationship
                                                        </button>
                                                        
                                                        {isAddRelOpen && (
                                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 shadow-xl rounded-xl p-2 z-10 animate-in fade-in zoom-in-95 duration-200">
                                                                <div className="flex justify-between items-center px-2 py-1 mb-2 border-b border-slate-100">
                                                                    <p className="text-[10px] text-slate-400 uppercase font-bold">Pick a field to link:</p>
                                                                    <button onClick={() => setIsAddRelOpen(false)}><X size={14} className="text-slate-400 hover:text-slate-600"/></button>
                                                                </div>
                                                                {currentTable.fields.filter(f => !f.foreignKey).map((f, idx) => (
                                                                    <button key={f.id} onClick={() => handleAddFK(idx)} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded-lg text-slate-700 font-mono flex justify-between items-center">
                                                                        <span>{f.name}</span>
                                                                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500">{f.type}</span>
                                                                    </button>
                                                                ))}
                                                                <button onClick={handleAddField} className="w-full text-left px-3 py-2 text-sm text-[#00ABE4] font-bold hover:bg-blue-50 rounded-lg border-t border-slate-100 mt-1">
                                                                    + Create New Field
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                    <TableIcon size={48} className="mb-4 opacity-20" />
                                    <p>Select a table from the sidebar to edit.</p>
                                </div>
                            )}
                         </div>
                    ) : (
                        <div className="flex-1 bg-[#0F172A] p-0 relative">
                            <div className="absolute top-0 left-0 right-0 bg-[#1E293B] px-4 py-2 text-xs text-slate-400 font-mono">generated_migration.sql</div>
                            <textarea className="w-full h-full bg-transparent text-blue-300 font-mono text-sm p-6 pt-12 focus:outline-none resize-none" value={rawSqlInput} onChange={(e) => handleSqlUpdate(e.target.value)} spellCheck={false}/>
                        </div>
                    )}
                </div>
                </>
            )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
             <div className="flex items-center gap-2 text-xs text-slate-500"><CheckCircle size={14} className="text-green-500"/> <span>Synced</span></div>
             <div className="flex gap-3">
               {mode === 'standalone' ? (
                   <button onClick={handleDownloadSQL} className="px-6 py-2.5 bg-[#00ABE4] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#00ABE4]/30 hover:bg-[#0099cc] transition-all flex items-center gap-2"><Download size={16}/> Download SQL</button>
               ) : (
                   <>
                    <button className="px-5 py-2.5 bg-white border border-slate-300 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-400 transition-all flex items-center gap-2"><Save size={16}/> Save Draft</button>
                    <button className="px-6 py-2.5 bg-[#00ABE4] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#00ABE4]/30 hover:bg-[#0099cc] transition-all flex items-center gap-2"><Play size={16} fill="currentColor"/> Generate Files</button>
                   </>
               )}
             </div>
        </div>
      </div>
    </div>
  );
}