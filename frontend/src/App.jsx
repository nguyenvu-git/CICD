import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import AxiosDemo from "./pages/AxiosDemo";
import FormDemo from "./pages/FormDemo";
import AccountManagement from "./pages/AccountManagement";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-purple-500/30 relative">
        {/* Modern glowing backdrops */}
        <div className="absolute top-0 right-[10%] w-[350px] h-[350px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-[40%] left-[5%] w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header Navigation */}
        <Navbar />

        {/* Page Content */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/axios" element={<AxiosDemo />} />
            <Route path="/form" element={<FormDemo />} />
            <Route path="/accounts" element={<AccountManagement />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>
              © {new Date().getFullYear()} Frontend Stack Boilerplate. All
              rights reserved.
            </p>
            <div className="flex">
              <span className="hover:text-slate-355 transition-colors cursor-default">
                Vite
              </span>
              <span>•</span>
              <span className="hover:text-slate-355 transition-colors ">
                React.js
              </span>
              <span>•</span>
              <span className="hover:text-slate-355 transition-colors cursor-default">
                TailwindCSS v4
              </span>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
