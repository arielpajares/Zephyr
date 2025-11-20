'use client';

import React, { useState } from 'react';
import { Plus, Folder, Trash2, Search } from 'lucide-react';

// --- Tipos ---
interface Project {
  id: string;
  name: string;
  path: string;
  status: 'running' | 'stopped';
  lastModified: string;
}

export default function ProjectsPage() {
  // Estado local de proyectos
  const [projects, setProjects] = useState<Project[]>([
    { id: '1', name: 'E-Commerce Platform', path: '~/Sites/ecommerce', status: 'running', lastModified: '2 hours ago' },
    { id: '2', name: 'Client Portfolio', path: '~/Sites/portfolio-v2', status: 'stopped', lastModified: '2 days ago' },
    { id: '3', name: 'Internal Dashboard', path: '~/Sites/admin-panel', status: 'stopped', lastModified: '5 days ago' },
  ]);

  const handleCreateProject = () => {
    const newProj: Project = {
      id: Date.now().toString(),
      name: 'New Zephyr App',
      path: '~/Sites/new-app',
      status: 'stopped',
      lastModified: 'Just now'
    };
    setProjects([...projects, newProj]);
  };

  const handleDeleteProject = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); 
    e.stopPropagation();
    if(confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#E9F1FA] p-8 font-sans text-slate-900">
       <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
             <div>
               <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Projects</h2>
               <p className="text-slate-500 mt-1">Manage your local Zephyr applications.</p>
             </div>
             <div className="flex gap-3">
                <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input 
                    type="text" 
                    placeholder="Search projects..." 
                    className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#00ABE4] focus:ring-2 focus:ring-[#00ABE4]/20 w-64"
                   />
                </div>
                <button 
                  onClick={handleCreateProject}
                  className="px-4 py-2 bg-[#00ABE4] text-white rounded-xl font-bold shadow-lg shadow-[#00ABE4]/20 hover:bg-[#0099cc] transition-all flex items-center gap-2"
                >
                  <Plus size={18} /> New Project
                </button>
             </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {projects.map(project => (
               <a 
                 key={project.id} 
                 href={`/workspace/project`}
                 className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-[#00ABE4]/50 transition-all cursor-pointer relative block"
               >
                 <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-[#E9F1FA] rounded-xl flex items-center justify-center text-[#00ABE4] group-hover:scale-110 transition-transform">
                       <Folder size={24} />
                    </div>
                    <div className="relative">
                       <button 
                         onClick={(e) => handleDeleteProject(e, project.id)}
                         className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors z-10 relative"
                       >
                          <Trash2 size={16} />
                       </button>
                    </div>
                 </div>
                 
                 <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-[#00ABE4] transition-colors">{project.name}</h3>
                 <p className="text-xs text-slate-400 font-mono mb-4 truncate">{project.path}</p>
                 
                 <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${project.status === 'running' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                       <span className="text-xs font-medium text-slate-500 capitalize">{project.status}</span>
                    </div>
                    <span className="text-xs text-slate-400">{project.lastModified}</span>
                 </div>
               </a>
             ))}
          </div>

          {/* Empty State */}
          {projects.length === 0 && (
             <div className="py-20 text-center border-2 border-dashed border-slate-300 rounded-3xl bg-slate-50/50">
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Folder size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-700">No projects found</h3>
                <p className="text-slate-500 mb-6">Get started by creating your first application.</p>
                <button onClick={handleCreateProject} className="text-[#00ABE4] font-bold hover:underline">Create Project</button>
             </div>
          )}
       </div>
    </div>
  );
}