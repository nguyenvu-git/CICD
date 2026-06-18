import React from 'react';
import { Cpu, Zap, Wind, Compass, Globe, CheckCircle, Sparkles } from 'lucide-react';

export default function Home() {
  const techs = [
    {
      name: 'React 19',
      desc: 'A JavaScript library for building user interfaces with declarative component architecture.',
      icon: Cpu,
      color: 'from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30',
      badge: 'v19.2.6',
    },
    {
      name: 'Vite 8',
      desc: 'Next-generation, ultra-fast frontend tooling with instant Hot Module Replacement (HMR).',
      icon: Zap,
      color: 'from-yellow-500/20 to-amber-500/20 text-amber-400 border-amber-500/30',
      badge: 'v8.0.12',
    },
    {
      name: 'Tailwind CSS v4',
      desc: 'A utility-first CSS framework built with a lightning-fast Rust engine and modern CSS integration.',
      icon: Wind,
      color: 'from-teal-500/20 to-emerald-500/20 text-teal-400 border-teal-500/30',
      badge: 'v4.3.1',
    },
    {
      name: 'React Router DOM',
      desc: 'Declarative routing solution for single-page applications, enabling smooth view transitions.',
      icon: Compass,
      color: 'from-red-500/20 to-pink-500/20 text-pink-400 border-pink-500/30',
      badge: 'v7.18.0',
    },
    {
      name: 'Axios',
      desc: 'Promise-based HTTP client for the browser and node.js, featuring automatic JSON conversions.',
      icon: Globe,
      color: 'from-indigo-500/20 to-purple-500/20 text-indigo-400 border-indigo-500/30',
      badge: 'v1.18.0',
    },
    {
      name: 'React Hook Form',
      desc: 'Performant, flexible, and extensible form validation with minimal rendering overhead.',
      icon: CheckCircle,
      color: 'from-purple-500/20 to-fuchsia-500/20 text-purple-400 border-purple-500/30',
      badge: 'v7.79.0',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center relative py-16 mb-16 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/5 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-6 animate-bounce">
          <Sparkles className="h-3.5 w-3.5 text-purple-400" />
          Ready to Develop
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent mb-6">
          Vite + React.js Core Boilerplate
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-400 leading-relaxed px-4">
          All key packages are fully configured. TailwindCSS v4, React Router 7, Axios, React Hook Form, and Lucide React icons are integrated and verified.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4 px-4">
          <a
            href="/axios"
            className="px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all duration-200"
          >
            Explore Axios Demo
          </a>
          <a
            href="/form"
            className="px-6 py-3 rounded-xl font-medium border border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-900 hover:text-slate-100 hover:border-slate-650 transition-all duration-200"
          >
            Try Hook Form Demo
          </a>
        </div>
      </div>

      {/* Grid of technologies */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white mb-8 text-center sm:text-left">
          Installed Packages
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {techs.map((tech, idx) => {
            const Icon = tech.icon;
            return (
              <div
                key={idx}
                className="group relative flex flex-col justify-between p-6 rounded-2xl border border-slate-800 bg-slate-950 hover:bg-slate-900/50 hover:border-slate-700 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-900 rounded-full translate-x-12 -translate-y-12 group-hover:scale-125 transition-transform duration-500 pointer-events-none"></div>
                
                <div>
                  <div className={`inline-flex p-3 rounded-xl border bg-gradient-to-br ${tech.color} mb-5 relative z-10`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  <div className="flex items-center gap-3 mb-2 relative z-10">
                    <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors duration-250">
                      {tech.name}
                    </h3>
                    <span className="px-2 py-0.5 text-2xs font-mono font-medium rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                      {tech.badge}
                    </span>
                  </div>
                  
                  <p className="text-slate-455 text-sm leading-relaxed mb-6 relative z-10">
                    {tech.desc}
                  </p>
                </div>
                
                <div className="border-t border-slate-850 pt-4 flex justify-between items-center relative z-10">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    Configured
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
