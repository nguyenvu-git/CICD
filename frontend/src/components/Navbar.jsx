import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Database, FileText, Cpu, Users, Shield, Receipt, Tag, UserPlus, FolderOpen, Utensils, Truck } from 'lucide-react';

export default function Navbar() {
  // Hàm style chung cho NavLink để code gọn hơn (dành cho các menu cơ bản)
  const navClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-slate-850 text-purple-400 border border-slate-700 shadow-[0_0_10px_rgba(168,85,247,0.1)]'
        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100 border border-transparent'
    }`;

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
          
          {/* Đã gộp chung tất cả các menu vào 1 div duy nhất */}
          <div className="flex space-x-1 sm:space-x-2 overflow-x-auto">
            {/* Các menu dùng chung và của bạn */}
            <NavLink to="/" className={navClass}><Home className="h-4 w-4" /><span className="hidden sm:inline">Home</span></NavLink>
            <NavLink to="/axios" className={navClass}><Database className="h-4 w-4" /><span>Axios</span></NavLink>
            <NavLink to="/form" className={navClass}><FileText className="h-4 w-4" /><span>Form</span></NavLink>
            <NavLink to="/invoices" className={navClass}><Receipt className="h-4 w-4" /><span>Hóa đơn</span></NavLink>
            <NavLink to="/customers" className={navClass}><UserPlus className="h-4 w-4" /><span>Khách hàng</span></NavLink>
            <NavLink to="/vouchers" className={navClass}><Tag className="h-4 w-4" /><span>Voucher</span></NavLink>
            <NavLink to="/accounts" className={navClass}><Users className="h-4 w-4" /><span>Tài khoản</span></NavLink>

            {/* Các menu của đồng đội với màu sắc riêng biệt */}
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
              <span>Vai trò</span>
            </NavLink>

            <NavLink
              to="/categories"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-slate-850 text-emerald-400 border border-slate-700 shadow-[0_0_10px_rgba(52,211,153,0.1)]'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100 border border-transparent'
                }`
              }
            >
              <FolderOpen className="h-4 w-4" />
              <span>Danh mục</span>
            </NavLink>

            <NavLink
              to="/products"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-slate-850 text-amber-400 border border-slate-700 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100 border border-transparent'
                }`
              }
            >
              <Utensils className="h-4 w-4" />
              <span>Món ăn</span>
            </NavLink>

            <NavLink
              to="/suppliers"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-slate-850 text-pink-400 border border-slate-700 shadow-[0_0_10px_rgba(244,114,182,0.1)]'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100 border border-transparent'
                }`
              }
            >
              <Truck className="h-4 w-4" />
              <span>Nhà cung cấp</span>
            </NavLink>
          </div>

        </div>
      </div>
    </nav>
  );
}