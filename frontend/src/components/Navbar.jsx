import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Database, FileText, Cpu, Users, Shield } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <Cpu className="h-6 w-6 text-purple-400 animate-pulse" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">
              ViteReact Stack
            </span>
          </div>
          <div className="flex space-x-1 sm:space-x-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-slate-850 text-purple-400 border border-slate-700 shadow-[0_0_10px_rgba(168,85,247,0.1)]'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100 border border-transparent'
                }`
              }
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </NavLink>
            <NavLink
              to="/axios"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-slate-850 text-purple-400 border border-slate-700 shadow-[0_0_10px_rgba(168,85,247,0.1)]'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100 border border-transparent'
                }`
              }
            >
              <Database className="h-4 w-4" />
              <span>Axios Demo</span>
            </NavLink>
            <NavLink
              to="/form"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-slate-850 text-purple-400 border border-slate-700 shadow-[0_0_10px_rgba(168,85,247,0.1)]'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100 border border-transparent'
                }`
              }
            >
              <FileText className="h-4 w-4" />
              <span>Hook Form Demo</span>
            </NavLink>
            <NavLink
              to="/accounts"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-slate-850 text-purple-400 border border-slate-700 shadow-[0_0_10px_rgba(168,85,247,0.1)]'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100 border border-transparent'
                }`
              }
            >
              <Users className="h-4 w-4" />
              <span>Tài khoản</span>
            </NavLink>
            <NavLink
              to="/roles"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-slate-850 text-indigo-400 border border-slate-700 shadow-[0_0_10px_rgba(99,102,241,0.1)]'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100 border border-transparent'
                }`
              }
            >
              <Shield className="h-4 w-4" />
              <span>Vai trò & Quyền</span>
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}
