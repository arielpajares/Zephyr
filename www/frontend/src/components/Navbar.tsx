'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wind, Terminal } from 'lucide-react'; // Import icons you need

export default function Navbar() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path ? 'text-[#00ABE4]' : '';

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo Section */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
               {/* Insert ZephyrLogo SVG/Img here */}
               <img 
                    src="/logo.svg" 
                    alt="Zephyr Logo"
                    className="w-10 h-10 object-cover relative z-10" 
                />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Zephyr <span className="text-xs bg-slate-100 px-1 rounded">LOCAL</span></h1>
            </div>
          </div>

          {/* Links Section */}
          <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
            <Link href="/home" className={`hover:text-[#00ABE4] transition-colors ${isActive('/')}`}>
              Overview
            </Link>
            <Link href="/workspace" className={`hover:text-[#00ABE4] transition-colors ${isActive('/schema')}`}>
              Workspace
            </Link>
            <Link href="/settings" className={`hover:text-[#00ABE4] transition-colors ${isActive('/settings')}`}>
              Configuration
            </Link>
            
            {/* Example Status Badge */}
            <div className="px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-600 border border-green-200">
              System Ready
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}