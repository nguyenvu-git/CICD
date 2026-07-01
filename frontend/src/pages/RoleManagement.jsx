import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import {
  Shield, ShieldCheck, ShieldAlert, ShieldOff,
  Plus, Search, RefreshCw, Edit3, Trash2, X,
  CheckCircle, XCircle, AlertTriangle, Loader2,
  Users, ChefHat, CreditCard, ConciergeBell,
  Key, Lock, Unlock, Eye, Settings, BarChart3,
  Package, ShoppingCart, FileText, Star, MessageSquare,
  Truck, Check
} from 'lucide-react';

const API_BASE = `http://${window.location.hostname}:5000/api`;

// =========================================================================
// PERMISSION MATRIX CONFIG
// =========================================================================
const PERMISSION_GROUPS = [
  {
    group: 'Hệ thống',
    color: 'purple',
    items: [
      { key: 'quan_ly_tai_khoan', label: 'Quản lý Tài khoản', icon: Users },
      { key: 'quan_ly_vai_tro', label: 'Quản lý Vai trò', icon: Shield },
    ],
  },
  {
    group: 'Danh mục',
    color: 'sky',
    items: [
      { key: 'quan_ly_mon_an', label: 'Quản lý Món ăn', icon: ChefHat },
      { key: 'quan_ly_nha_cung_cap', label: 'Quản lý Nhà cung cấp', icon: Truck },
    ],
  },
  {
    group: 'Vận hành',
    color: 'amber',
    items: [
      { key: 'quan_ly_ban_an', label: 'Quản lý Bàn ăn', icon: Settings },
      { key: 'quan_ly_don_hang', label: 'Quản lý Đơn hàng', icon: ShoppingCart },
      { key: 'quan_ly_hoa_don', label: 'Quản lý Hóa đơn', icon: FileText },
    ],
  },
  {
    group: 'Kho & Khách hàng',
    color: 'emerald',
    items: [
      { key: 'quan_ly_kho', label: 'Quản lý Kho', icon: Package },
      { key: 'quan_ly_khach_hang', label: 'Quản lý Khách hàng', icon: Users },
      { key: 'quan_ly_khuyen_mai', label: 'Quản lý Khuyến mãi', icon: Star },
    ],
  },
  {
    group: 'Báo cáo & Phản hồi',
    color: 'rose',
    items: [
      { key: 'xem_bao_cao', label: 'Xem Báo cáo', icon: BarChart3 },
      { key: 'quan_ly_phan_hoi', label: 'Quản lý Phản hồi', icon: MessageSquare },
    ],
  },
];

// Role icon/color config
const ROLE_CONFIG = {
  'Admin':    { icon: Shield,        gradient: 'from-purple-500 to-indigo-500', bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', glow: 'shadow-purple-500/20' },
  'Thu ngân': { icon: CreditCard,    gradient: 'from-sky-500 to-cyan-500',      bg: 'bg-sky-500/10',    border: 'border-sky-500/30',    text: 'text-sky-400',    glow: 'shadow-sky-500/20' },
  'Đầu bếp': { icon: ChefHat,       gradient: 'from-amber-500 to-orange-500',  bg: 'bg-amber-500/10',  border: 'border-amber-500/30',  text: 'text-amber-400',  glow: 'shadow-amber-500/20' },
  'Phục vụ':  { icon: ConciergeBell, gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-500/10',border: 'border-emerald-500/30',text: 'text-emerald-400',glow: 'shadow-emerald-500/20' },
};
const getRoleConfig = (name) =>
  ROLE_CONFIG[name] || { icon: Shield, gradient: 'from-slate-500 to-slate-600', bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400', glow: 'shadow-slate-500/20' };

const COLOR_CLASSES = {
  purple:  { bg: 'bg-purple-500/10',  border: 'border-purple-500/20',  text: 'text-purple-400',  dot: 'bg-purple-500' },
  sky:     { bg: 'bg-sky-500/10',     border: 'border-sky-500/20',     text: 'text-sky-400',     dot: 'bg-sky-500' },
  amber:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   text: 'text-amber-400',   dot: 'bg-amber-500' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-500' },
  rose:    { bg: 'bg-rose-500/10',    border: 'border-rose-500/20',    text: 'text-rose-400',    dot: 'bg-rose-500' },
};

// =========================================================================
// TOAST COMPONENT
// =========================================================================
function Toast({ toast, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [onClose]);

  const isSuccess = toast.type === 'success';
  return (
    <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-2xl backdrop-blur-xl
      ${isSuccess ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300' : 'bg-red-950/80 border-red-500/30 text-red-300'}
      animate-[slideIn_0.3s_ease-out]`}
    >
      {isSuccess ? <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" /> : <XCircle className="h-5 w-5 text-red-400 shrink-0" />}
      <span className="text-sm font-medium max-w-xs">{toast.message}</span>
      <button onClick={onClose} className="ml-2 text-slate-500 hover:text-white transition-colors">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// =========================================================================
// DELETE CONFIRM MODAL
// =========================================================================
function DeleteModal({ role, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-slate-950/95 border border-slate-800 rounded-2xl p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20 mb-5">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Xác nhận xóa vai trò</h3>
          <p className="text-slate-400 text-sm mb-1">Bạn có chắc muốn xóa vai trò:</p>
          <p className="text-white font-semibold text-lg mb-1">{role?.role_name}</p>
          <p className="text-slate-500 text-xs mb-6">
            {role?.user_count > 0
              ? `⚠️ Đang có ${role.user_count} tài khoản sử dụng vai trò này.`
              : 'Hành động này không thể hoàn tác.'}
          </p>
          <div className="flex gap-3 w-full">
            <button onClick={onCancel} disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium transition-all duration-200 disabled:opacity-50">
              Hủy bỏ
            </button>
            <button onClick={onConfirm} disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium shadow-lg shadow-red-600/20 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Xóa vai trò
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// ROLE FORM MODAL (CREATE / EDIT)
// =========================================================================
function RoleFormModal({ isOpen, mode, role, onSubmit, onClose, loading }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [permissions, setPermissions] = useState({});

  const emptyPerms = () => {
    const p = {};
    PERMISSION_GROUPS.forEach(g => g.items.forEach(i => { p[i.key] = false; }));
    return p;
  };

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && role) {
        reset({ role_name: role.role_name || '', description: role.description || '' });
        setPermissions(role.permissions || emptyPerms());
      } else {
        reset({ role_name: '', description: '' });
        setPermissions(emptyPerms());
      }
    }
  }, [isOpen, mode, role, reset]);

  if (!isOpen) return null;

  const togglePerm = (key) => setPermissions(prev => ({ ...prev, [key]: !prev[key] }));

  const toggleGroup = (group) => {
    const keys = group.items.map(i => i.key);
    const allOn = keys.every(k => permissions[k]);
    setPermissions(prev => {
      const next = { ...prev };
      keys.forEach(k => { next[k] = !allOn; });
      return next;
    });
  };

  const grantAll = () => {
    const p = {};
    PERMISSION_GROUPS.forEach(g => g.items.forEach(i => { p[i.key] = true; }));
    setPermissions(p);
  };

  const revokeAll = () => setPermissions(emptyPerms());

  const onFormSubmit = (data) => onSubmit({ ...data, permissions });

  const totalPerms = PERMISSION_GROUPS.reduce((s, g) => s + g.items.length, 0);
  const grantedCount = Object.values(permissions).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl bg-slate-950/98 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${mode === 'create' ? 'bg-purple-500/10 border-purple-500/20' : 'bg-sky-500/10 border-sky-500/20'}`}>
              {mode === 'create' ? <Plus className="h-5 w-5 text-purple-400" /> : <Edit3 className="h-5 w-5 text-sky-400" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {mode === 'create' ? 'Thêm vai trò mới' : 'Chỉnh sửa vai trò'}
              </h3>
              <p className="text-xs text-slate-500">
                {mode === 'create' ? 'Tạo vai trò và cấu hình quyền hạn' : `Đang sửa: ${role?.role_name}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1">
          <form id="role-form" onSubmit={handleSubmit(onFormSubmit)} className="px-7 py-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Tên vai trò <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  {...register('role_name', {
                    required: 'Vui lòng nhập tên vai trò',
                    minLength: { value: 2, message: 'Tối thiểu 2 ký tự' },
                    maxLength: { value: 50, message: 'Tối đa 50 ký tự' },
                  })}
                  placeholder="vd: Quản lý kho"
                  className={`w-full px-4 py-3 bg-slate-900/70 border rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 transition-all duration-200
                    ${errors.role_name ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-purple-500 focus:ring-purple-500'}`}
                />
                {errors.role_name && (
                  <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                    <XCircle className="h-3 w-3" /> {errors.role_name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Mô tả</label>
                <textarea
                  {...register('description')}
                  rows={2}
                  placeholder="Mô tả ngắn về vai trò này..."
                  className="w-full px-4 py-3 bg-slate-900/70 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:border-purple-500 focus:ring-purple-500 transition-all duration-200 resize-none"
                />
              </div>
            </div>

            {/* Permission Matrix */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-semibold text-white">Ma trận phân quyền</span>
                  <span className="text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                    {grantedCount}/{totalPerms} quyền
                  </span>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={grantAll}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-all duration-200">
                    <Unlock className="h-3 w-3" /> Tất cả
                  </button>
                  <button type="button" onClick={revokeAll}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all duration-200">
                    <Lock className="h-3 w-3" /> Xóa hết
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-slate-800 rounded-full mb-5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${totalPerms > 0 ? (grantedCount / totalPerms) * 100 : 0}%` }}
                />
              </div>

              <div className="space-y-4">
                {PERMISSION_GROUPS.map((group) => {
                  const clr = COLOR_CLASSES[group.color] || COLOR_CLASSES.purple;
                  const allOn = group.items.every(i => permissions[i.key]);
                  const someOn = group.items.some(i => permissions[i.key]);
                  return (
                    <div key={group.group} className={`rounded-xl border ${clr.border} ${clr.bg} overflow-hidden`}>
                      {/* Group header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${clr.dot}`} />
                          <span className={`text-xs font-bold uppercase tracking-wider ${clr.text}`}>{group.group}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleGroup(group)}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-all duration-200 font-medium
                            ${allOn
                              ? `${clr.bg} ${clr.text} ${clr.border} hover:opacity-80`
                              : 'bg-slate-900 text-slate-500 border-slate-700 hover:border-slate-600 hover:text-slate-300'
                            }`}
                        >
                          {allOn ? 'Bỏ tất cả' : someOn ? 'Chọn tất cả' : 'Chọn tất cả'}
                        </button>
                      </div>
                      {/* Permission items */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-slate-800/30">
                        {group.items.map(({ key, label, icon: Icon }) => {
                          const on = !!permissions[key];
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => togglePerm(key)}
                              className={`flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 group
                                ${on ? 'bg-slate-900/80' : 'bg-slate-950/40 hover:bg-slate-900/40'}`}
                            >
                              <div className={`flex items-center justify-center h-8 w-8 rounded-lg border shrink-0 transition-all duration-200
                                ${on ? `${clr.bg} ${clr.border}` : 'bg-slate-900 border-slate-700 group-hover:border-slate-600'}`}>
                                <Icon className={`h-4 w-4 transition-colors ${on ? clr.text : 'text-slate-600 group-hover:text-slate-400'}`} />
                              </div>
                              <span className={`text-sm font-medium flex-1 transition-colors ${on ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
                                {label}
                              </span>
                              <div className={`h-5 w-5 rounded flex items-center justify-center border transition-all duration-200
                                ${on ? `bg-gradient-to-br ${group.color === 'purple' ? 'from-purple-500 to-indigo-500' : group.color === 'sky' ? 'from-sky-500 to-cyan-500' : group.color === 'amber' ? 'from-amber-500 to-orange-500' : group.color === 'emerald' ? 'from-emerald-500 to-teal-500' : 'from-rose-500 to-pink-500'} border-transparent` : 'border-slate-700 group-hover:border-slate-500'}`}>
                                {on && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-slate-800 flex gap-3 shrink-0 bg-slate-950/80">
          <button type="button" onClick={onClose} disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium transition-all duration-200 disabled:opacity-50">
            Hủy bỏ
          </button>
          <button type="submit" form="role-form" disabled={loading}
            className={`flex-1 px-4 py-3 rounded-xl font-medium shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2
              ${mode === 'create'
                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20'
                : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/20'
              }`}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === 'create' ? <Plus className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
            {mode === 'create' ? 'Tạo vai trò' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// PERMISSION PREVIEW BADGE
// =========================================================================
function PermissionPreview({ permissions }) {
  if (!permissions) return <span className="text-xs text-slate-600 italic">—</span>;
  const granted = Object.values(permissions).filter(Boolean).length;
  const total = Object.keys(permissions).length;
  const pct = total > 0 ? Math.round((granted / total) * 100) : 0;

  let colorClass = 'bg-slate-500';
  let textClass = 'text-slate-400';
  if (pct === 100) { colorClass = 'bg-purple-500'; textClass = 'text-purple-400'; }
  else if (pct >= 50) { colorClass = 'bg-sky-500'; textClass = 'text-sky-400'; }
  else if (pct > 0) { colorClass = 'bg-amber-500'; textClass = 'text-amber-400'; }
  else { colorClass = 'bg-red-500/50'; textClass = 'text-red-400'; }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden w-20">
        <div className={`h-full ${colorClass} rounded-full transition-all duration-300`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-mono font-semibold ${textClass}`}>{granted}/{total}</span>
    </div>
  );
}

// =========================================================================
// ROLE DETAIL PANEL
// =========================================================================
function RoleDetailPanel({ role, onEdit, onDelete }) {
  if (!role) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-20">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 mb-4">
          <Eye className="h-10 w-10 text-slate-700" />
        </div>
        <p className="text-slate-500 text-sm">Chọn một vai trò để xem chi tiết quyền hạn</p>
      </div>
    );
  }

  const cfg = getRoleConfig(role.role_name);
  const RoleIcon = cfg.icon;
  const totalPerms = PERMISSION_GROUPS.reduce((s, g) => s + g.items.length, 0);
  const granted = role.permissions ? Object.values(role.permissions).filter(Boolean).length : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Role header */}
      <div className={`p-5 rounded-2xl border ${cfg.border} ${cfg.bg} mb-5`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${cfg.gradient} shadow-lg ${cfg.glow}`}>
              <RoleIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${cfg.text}`}>{role.role_name}</h3>
              <p className="text-slate-500 text-xs mt-0.5">{role.description || 'Chưa có mô tả'}</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => onEdit(role)}
              className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:bg-sky-500/20 transition-all duration-200" title="Chỉnh sửa">
              <Edit3 className="h-4 w-4" />
            </button>
            <button onClick={() => onDelete(role)}
              className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all duration-200" title="Xóa">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-xs text-slate-400">{role.user_count || 0} tài khoản</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Key className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-xs text-slate-400">{granted}/{totalPerms} quyền</span>
          </div>
        </div>
        {/* Permission progress */}
        <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${cfg.gradient} rounded-full transition-all duration-700`}
            style={{ width: `${totalPerms > 0 ? (granted / totalPerms) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Permission groups */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {PERMISSION_GROUPS.map((group) => {
          const clr = COLOR_CLASSES[group.color] || COLOR_CLASSES.purple;
          return (
            <div key={group.group} className={`rounded-xl border ${clr.border} overflow-hidden`}>
              <div className={`flex items-center gap-2 px-4 py-2.5 ${clr.bg}`}>
                <span className={`h-2 w-2 rounded-full ${clr.dot}`} />
                <span className={`text-xs font-bold uppercase tracking-wider ${clr.text}`}>{group.group}</span>
              </div>
              <div className="divide-y divide-slate-800/40">
                {group.items.map(({ key, label, icon: Icon }) => {
                  const has = role.permissions?.[key] ?? false;
                  return (
                    <div key={key} className={`flex items-center gap-3 px-4 py-3 ${has ? 'bg-slate-900/60' : 'bg-slate-950/40'}`}>
                      <div className={`flex items-center justify-center h-7 w-7 rounded-lg border shrink-0
                        ${has ? `${clr.bg} ${clr.border}` : 'bg-slate-900/50 border-slate-800'}`}>
                        <Icon className={`h-3.5 w-3.5 ${has ? clr.text : 'text-slate-700'}`} />
                      </div>
                      <span className={`text-sm flex-1 ${has ? 'text-slate-200 font-medium' : 'text-slate-600'}`}>{label}</span>
                      {has
                        ? <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                            <CheckCircle className="h-3 w-3" /> Có
                          </span>
                        : <span className="flex items-center gap-1 text-xs text-slate-600 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
                            <XCircle className="h-3 w-3" /> Không
                          </span>
                      }
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =========================================================================
// MAIN PAGE COMPONENT
// =========================================================================
export default function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [toast, setToast] = useState(null);
  const [formModal, setFormModal] = useState({ open: false, mode: 'create', role: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, role: null });

  const showToast = (type, message) => setToast({ type, message });

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/roles-management`);
      setRoles(res.data);
      // Keep selected role in sync
      setSelectedRole(prev => prev ? (res.data.find(r => r.id === prev.id) || null) : null);
    } catch (err) {
      showToast('error', 'Không thể tải danh sách vai trò.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  const filteredRoles = roles.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return r.role_name.toLowerCase().includes(q) || (r.description || '').toLowerCase().includes(q);
  });

  // Create
  const handleCreate = async (data) => {
    setActionLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/roles-management`, data);
      showToast('success', res.data.message);
      setFormModal({ open: false, mode: 'create', role: null });
      await fetchRoles();
    } catch (err) {
      showToast('error', err.response?.data?.error || 'Lỗi khi tạo vai trò.');
    } finally {
      setActionLoading(false);
    }
  };

  // Update
  const handleUpdate = async (data) => {
    setActionLoading(true);
    try {
      const res = await axios.put(`${API_BASE}/roles-management/${formModal.role.id}`, data);
      showToast('success', res.data.message);
      setFormModal({ open: false, mode: 'edit', role: null });
      await fetchRoles();
    } catch (err) {
      showToast('error', err.response?.data?.error || 'Lỗi khi cập nhật vai trò.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    setActionLoading(true);
    try {
      const res = await axios.delete(`${API_BASE}/roles-management/${deleteModal.role.id}`);
      showToast('success', res.data.message);
      setDeleteModal({ open: false, role: null });
      if (selectedRole?.id === deleteModal.role.id) setSelectedRole(null);
      await fetchRoles();
    } catch (err) {
      showToast('error', err.response?.data?.error || 'Lỗi khi xóa vai trò.');
    } finally {
      setActionLoading(false);
    }
  };

  const openEdit = (role) => setFormModal({ open: true, mode: 'edit', role });
  const openDelete = (role) => setDeleteModal({ open: true, role });

  // Stats
  const totalPermsAll = PERMISSION_GROUPS.reduce((s, g) => s + g.items.length, 0);
  const totalGrantedAll = roles.reduce((sum, r) => sum + (r.permissions ? Object.values(r.permissions).filter(Boolean).length : 0), 0);
  const totalUsers = roles.reduce((sum, r) => sum + (r.user_count || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
              <Shield className="h-6 w-6 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Vai trò & Phân quyền
            </h1>
          </div>
          <p className="text-slate-400 mt-1 ml-[52px]">
            Quản lý quyền hạn cho Admin, Thu ngân, Đầu bếp và các vai trò khác
          </p>
        </div>
        <button
          onClick={() => setFormModal({ open: true, mode: 'create', role: null })}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-600/20 transition-all duration-200 hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Thêm vai trò
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Tổng vai trò', value: roles.length, icon: Shield, color: 'indigo', glow: 'shadow-indigo-500/10' },
          { label: 'Tổng tài khoản', value: totalUsers, icon: Users, color: 'purple', glow: 'shadow-purple-500/10' },
          { label: 'Quyền đã cấp', value: totalGrantedAll, icon: ShieldCheck, color: 'emerald', glow: 'shadow-emerald-500/10' },
          { label: 'Quyền bị khóa', value: roles.length * totalPermsAll - totalGrantedAll, icon: ShieldOff, color: 'rose', glow: 'shadow-rose-500/10' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i}
              className={`px-5 py-4 rounded-2xl border border-slate-800 bg-slate-950/50 hover:border-${stat.color}-500/30 hover:shadow-lg ${stat.glow} transition-all duration-300 group`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">{stat.label}</p>
                  <p className={`text-2xl font-bold mt-1 text-${stat.color}-400`}>{stat.value}</p>
                </div>
                <div className={`p-2 rounded-xl bg-${stat.color}-500/10 border border-${stat.color}-500/20 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`h-5 w-5 text-${stat.color}-400`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content: Role List + Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Left: Role List */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Toolbar */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Tìm kiếm vai trò..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all duration-200 text-sm"
              />
            </div>
            <button onClick={fetchRoles} disabled={loading}
              className="px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white disabled:opacity-50 transition-all duration-200">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Role Cards */}
          <div className="space-y-3">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="h-20 rounded-2xl border border-slate-800 bg-slate-950 animate-pulse" />
              ))
            ) : filteredRoles.length === 0 ? (
              <div className="text-center py-14 border border-slate-800 rounded-2xl bg-slate-950/40">
                <ShieldAlert className="h-10 w-10 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">
                  {searchQuery ? `Không tìm thấy vai trò "${searchQuery}"` : 'Chưa có vai trò nào'}
                </p>
              </div>
            ) : (
              filteredRoles.map((role) => {
                const cfg = getRoleConfig(role.role_name);
                const RoleIcon = cfg.icon;
                const isSelected = selectedRole?.id === role.id;
                const totalP = PERMISSION_GROUPS.reduce((s, g) => s + g.items.length, 0);
                const granted = role.permissions ? Object.values(role.permissions).filter(Boolean).length : 0;

                return (
                  <div
                    key={role.id}
                    onClick={() => setSelectedRole(role)}
                    className={`group relative rounded-2xl border p-4 cursor-pointer transition-all duration-200
                      ${isSelected
                        ? `${cfg.border} ${cfg.bg} shadow-lg ${cfg.glow}`
                        : 'border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-900/50'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center h-10 w-10 rounded-xl shrink-0 transition-all duration-200
                        ${isSelected
                          ? `bg-gradient-to-br ${cfg.gradient} shadow-md`
                          : 'bg-slate-900 border border-slate-800 group-hover:border-slate-700'
                        }`}>
                        <RoleIcon className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`font-semibold text-sm ${isSelected ? cfg.text : 'text-white'}`}>
                            {role.role_name}
                          </p>
                          <span className="text-xs text-slate-500 shrink-0 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
                            {role.user_count || 0} người
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{role.description || 'Chưa có mô tả'}</p>
                        <div className="mt-2">
                          <PermissionPreview permissions={role.permissions} />
                        </div>
                      </div>
                    </div>

                    {/* Quick actions */}
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEdit(role); }}
                        className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:bg-sky-500/20 transition-all"
                        title="Sửa">
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); openDelete(role); }}
                        className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                        title="Xóa">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {!loading && (
            <p className="text-xs text-slate-600 text-center">
              {filteredRoles.length} / {roles.length} vai trò
            </p>
          )}
        </div>

        {/* Right: Detail Panel */}
        <div className="lg:col-span-3 border border-slate-800 rounded-2xl p-5 bg-slate-950/50 min-h-[500px]">
          <RoleDetailPanel
            role={selectedRole}
            onEdit={openEdit}
            onDelete={openDelete}
          />
        </div>
      </div>

      {/* Modals */}
      <RoleFormModal
        isOpen={formModal.open}
        mode={formModal.mode}
        role={formModal.role}
        onSubmit={formModal.mode === 'create' ? handleCreate : handleUpdate}
        onClose={() => setFormModal({ open: false, mode: 'create', role: null })}
        loading={actionLoading}
      />

      {deleteModal.open && (
        <DeleteModal
          role={deleteModal.role}
          onConfirm={handleDelete}
          onCancel={() => setDeleteModal({ open: false, role: null })}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
