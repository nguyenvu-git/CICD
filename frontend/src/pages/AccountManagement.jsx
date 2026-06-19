import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import {
  Users, UserPlus, Search, RefreshCw, Edit3, Trash2, X,
  CheckCircle, XCircle, AlertTriangle, Eye, EyeOff, Shield,
  ChefHat, CreditCard, ConciergeBell, Loader2
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

// Role badge config
const ROLE_STYLES = {
  'Admin': { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30', icon: Shield },
  'Thu ngân': { bg: 'bg-sky-500/15', text: 'text-sky-400', border: 'border-sky-500/30', icon: CreditCard },
  'Đầu bếp': { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', icon: ChefHat },
  'Phục vụ': { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', icon: ConciergeBell },
};

const getRoleStyle = (roleName) =>
  ROLE_STYLES[roleName] || { bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30', icon: Users };

// Toast component
function Toast({ toast, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = toast.type === 'success';
  return (
    <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-2xl backdrop-blur-xl animate-slideIn
      ${isSuccess
        ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300'
        : 'bg-red-950/80 border-red-500/30 text-red-300'
      }`}
    >
      {isSuccess
        ? <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
        : <XCircle className="h-5 w-5 text-red-400 shrink-0" />
      }
      <span className="text-sm font-medium max-w-xs">{toast.message}</span>
      <button onClick={onClose} className="ml-2 text-slate-500 hover:text-white transition-colors">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// Delete confirmation modal
function DeleteModal({ account, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-slate-950/95 border border-slate-800 rounded-2xl p-8 shadow-2xl animate-modalIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20 mb-5">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Xác nhận xóa tài khoản</h3>
          <p className="text-slate-400 text-sm mb-1">
            Bạn có chắc chắn muốn xóa tài khoản:
          </p>
          <p className="text-white font-semibold text-lg mb-1">
            {account?.full_name || account?.username}
          </p>
          <p className="text-slate-500 text-xs mb-6">
            @{account?.username} • Hành động này không thể hoàn tác.
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium transition-all duration-200 disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium shadow-lg shadow-red-600/20 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Xóa tài khoản
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Account form modal (Create / Edit)
function AccountFormModal({ isOpen, mode, account, roles, onSubmit, onClose, loading }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && account) {
        reset({
          username: account.username || '',
          password: '',
          full_name: account.full_name || '',
          email: account.email || '',
          phone: account.phone || '',
          role_id: account.role_id || '',
          is_active: account.is_active !== undefined ? account.is_active : 1,
        });
      } else {
        reset({
          username: '',
          password: '',
          full_name: '',
          email: '',
          phone: '',
          role_id: '',
          is_active: 1,
        });
      }
      setShowPassword(false);
    }
  }, [isOpen, mode, account, reset]);

  if (!isOpen) return null;

  const onFormSubmit = (data) => {
    onSubmit({
      ...data,
      role_id: data.role_id ? parseInt(data.role_id) : null,
      is_active: parseInt(data.is_active),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl animate-modalIn overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${mode === 'create'
              ? 'bg-purple-500/10 border-purple-500/20'
              : 'bg-sky-500/10 border-sky-500/20'
            }`}>
              {mode === 'create'
                ? <UserPlus className="h-5 w-5 text-purple-400" />
                : <Edit3 className="h-5 w-5 text-sky-400" />
              }
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {mode === 'create' ? 'Thêm tài khoản mới' : 'Chỉnh sửa tài khoản'}
              </h3>
              <p className="text-xs text-slate-500">
                {mode === 'create' ? 'Tạo tài khoản nhân viên mới' : `Đang sửa: @${account?.username}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="px-7 py-6 space-y-5">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Tên đăng nhập <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              {...register('username', {
                required: 'Vui lòng nhập tên đăng nhập',
                minLength: { value: 3, message: 'Tối thiểu 3 ký tự' },
                pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Chỉ chấp nhận chữ, số và dấu gạch dưới' }
              })}
              placeholder="vd: nhanvien01"
              className={`w-full px-4 py-3 bg-slate-900/70 border rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 transition-all duration-200
                ${errors.username ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-purple-500 focus:ring-purple-500'}`}
            />
            {errors.username && (
              <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                <XCircle className="h-3 w-3" /> {errors.username.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Mật khẩu {mode === 'create' && <span className="text-red-400">*</span>}
              {mode === 'edit' && <span className="text-slate-500 text-xs ml-1">(để trống nếu không đổi)</span>}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', {
                  ...(mode === 'create' ? {
                    required: 'Vui lòng nhập mật khẩu',
                    minLength: { value: 4, message: 'Tối thiểu 4 ký tự' },
                  } : {})
                })}
                placeholder={mode === 'create' ? 'Nhập mật khẩu' : '••••••••'}
                className={`w-full px-4 py-3 pr-12 bg-slate-900/70 border rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 transition-all duration-200
                  ${errors.password ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-purple-500 focus:ring-purple-500'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                <XCircle className="h-3 w-3" /> {errors.password.message}
              </p>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Họ và tên <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              {...register('full_name', { required: 'Vui lòng nhập họ tên' })}
              placeholder="vd: Nguyễn Văn A"
              className={`w-full px-4 py-3 bg-slate-900/70 border rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 transition-all duration-200
                ${errors.full_name ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-purple-500 focus:ring-purple-500'}`}
            />
            {errors.full_name && (
              <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                <XCircle className="h-3 w-3" /> {errors.full_name.message}
              </p>
            )}
          </div>

          {/* Email & Phone row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                {...register('email', {
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email không hợp lệ' }
                })}
                placeholder="email@example.com"
                className={`w-full px-4 py-3 bg-slate-900/70 border rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 transition-all duration-200
                  ${errors.email ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-purple-500 focus:ring-purple-500'}`}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <XCircle className="h-3 w-3" /> {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Số điện thoại</label>
              <input
                type="text"
                {...register('phone', {
                  pattern: { value: /^[0-9]{0,15}$/, message: 'SĐT không hợp lệ' }
                })}
                placeholder="0901234567"
                className={`w-full px-4 py-3 bg-slate-900/70 border rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 transition-all duration-200
                  ${errors.phone ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-purple-500 focus:ring-purple-500'}`}
              />
              {errors.phone && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <XCircle className="h-3 w-3" /> {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          {/* Role & Status row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Vai trò</label>
              <select
                {...register('role_id')}
                className="w-full px-4 py-3 bg-slate-900/70 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:border-purple-500 focus:ring-purple-500 transition-all duration-200 appearance-none cursor-pointer"
              >
                <option value="">-- Chọn vai trò --</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>{role.role_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Trạng thái</label>
              <select
                {...register('is_active')}
                className="w-full px-4 py-3 bg-slate-900/70 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:border-purple-500 focus:ring-purple-500 transition-all duration-200 appearance-none cursor-pointer"
              >
                <option value={1}>Hoạt động</option>
                <option value={0}>Vô hiệu hóa</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium transition-all duration-200 disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-3 rounded-xl font-medium shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2
                ${mode === 'create'
                  ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20'
                  : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/20'
                }`}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === 'create' ? (
                <UserPlus className="h-4 w-4" />
              ) : (
                <Edit3 className="h-4 w-4" />
              )}
              {mode === 'create' ? 'Tạo tài khoản' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


// =========================================================================
// MAIN PAGE COMPONENT
// =========================================================================
export default function AccountManagement() {
  const [accounts, setAccounts] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  // Modal states
  const [formModal, setFormModal] = useState({ open: false, mode: 'create', account: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, account: null });

  // Fetch accounts
  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/accounts`);
      setAccounts(response.data);
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
      setToast({ type: 'error', message: 'Không thể tải danh sách tài khoản.' });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch roles
  const fetchRoles = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/roles`);
      setRoles(response.data);
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
    fetchRoles();
  }, [fetchAccounts, fetchRoles]);

  // Filtered accounts
  const filteredAccounts = accounts.filter((acc) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (acc.username || '').toLowerCase().includes(q) ||
      (acc.full_name || '').toLowerCase().includes(q) ||
      (acc.email || '').toLowerCase().includes(q) ||
      (acc.phone || '').toLowerCase().includes(q) ||
      (acc.role_name || '').toLowerCase().includes(q)
    );
  });

  // Create account
  const handleCreate = async (data) => {
    setActionLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/accounts`, data);
      setToast({ type: 'success', message: response.data.message });
      setFormModal({ open: false, mode: 'create', account: null });
      fetchAccounts();
    } catch (err) {
      const msg = err.response?.data?.error || 'Lỗi khi tạo tài khoản.';
      setToast({ type: 'error', message: msg });
    } finally {
      setActionLoading(false);
    }
  };

  // Update account
  const handleUpdate = async (data) => {
    setActionLoading(true);
    try {
      const response = await axios.put(`${API_BASE}/accounts/${formModal.account.id}`, data);
      setToast({ type: 'success', message: response.data.message });
      setFormModal({ open: false, mode: 'edit', account: null });
      fetchAccounts();
    } catch (err) {
      const msg = err.response?.data?.error || 'Lỗi khi cập nhật tài khoản.';
      setToast({ type: 'error', message: msg });
    } finally {
      setActionLoading(false);
    }
  };

  // Delete account
  const handleDelete = async () => {
    setActionLoading(true);
    try {
      const response = await axios.delete(`${API_BASE}/accounts/${deleteModal.account.id}`);
      setToast({ type: 'success', message: response.data.message });
      setDeleteModal({ open: false, account: null });
      fetchAccounts();
    } catch (err) {
      const msg = err.response?.data?.error || 'Lỗi khi xóa tài khoản.';
      setToast({ type: 'error', message: msg });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      {/* Toast */}
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
              <Users className="h-6 w-6 text-purple-400" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Quản lý Tài khoản
            </h1>
          </div>
          <p className="text-slate-400 mt-1 ml-[52px]">
            Quản lý tài khoản nhân viên trong hệ thống nhà hàng
          </p>
        </div>
        <button
          onClick={() => setFormModal({ open: true, mode: 'create', account: null })}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium shadow-lg shadow-purple-600/20 transition-all duration-200 hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98]"
        >
          <UserPlus className="h-4 w-4" />
          Thêm tài khoản
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, username, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-950/70 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all duration-200"
          />
        </div>
        {/* Refresh */}
        <button
          onClick={fetchAccounts}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white disabled:opacity-50 transition-all duration-200"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Tổng tài khoản', value: accounts.length, color: 'purple' },
          { label: 'Đang hoạt động', value: accounts.filter(a => a.is_active).length, color: 'emerald' },
          { label: 'Vô hiệu hóa', value: accounts.filter(a => !a.is_active).length, color: 'red' },
          { label: 'Vai trò', value: roles.length, color: 'sky' },
        ].map((stat, i) => (
          <div
            key={i}
            className={`px-5 py-4 rounded-2xl border bg-slate-950/50 border-slate-800 hover:border-${stat.color}-500/30 transition-all duration-300`}
          >
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 text-${stat.color}-400`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl border border-slate-800 bg-slate-950 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredAccounts.length === 0 && (
        <div className="text-center py-20 border border-slate-800 rounded-2xl bg-slate-950/40">
          <Users className="h-12 w-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            {searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có tài khoản nào'}
          </h3>
          <p className="text-slate-500 text-sm">
            {searchQuery
              ? `Không có tài khoản nào phù hợp với "${searchQuery}"`
              : 'Nhấn "Thêm tài khoản" để bắt đầu'
            }
          </p>
        </div>
      )}

      {/* Data Table */}
      {!loading && filteredAccounts.length > 0 && (
        <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">STT</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tài khoản</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Liên hệ</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Vai trò</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAccounts.map((acc, index) => {
                  const roleStyle = getRoleStyle(acc.role_name);
                  const RoleIcon = roleStyle.icon;
                  return (
                    <tr
                      key={acc.id}
                      className="group hover:bg-slate-900/40 transition-colors duration-150"
                    >
                      {/* STT */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-500 font-mono">{index + 1}</span>
                      </td>
                      {/* User info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
                            <span className="text-sm font-bold uppercase">
                              {(acc.full_name || acc.username || '?').charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{acc.full_name || 'Chưa cập nhật'}</p>
                            <p className="text-xs text-slate-500">@{acc.username}</p>
                          </div>
                        </div>
                      </td>
                      {/* Contact */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-300">{acc.email || '—'}</p>
                        <p className="text-xs text-slate-500">{acc.phone || '—'}</p>
                      </td>
                      {/* Role */}
                      <td className="px-6 py-4">
                        {acc.role_name ? (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}>
                            <RoleIcon className="h-3.5 w-3.5" />
                            {acc.role_name}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-600 italic">Chưa gán</span>
                        )}
                      </td>
                      {/* Status */}
                      <td className="px-6 py-4">
                        {acc.is_active ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                            Vô hiệu
                          </span>
                        )}
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => setFormModal({ open: true, mode: 'edit', account: acc })}
                            title="Chỉnh sửa"
                            className="p-2 rounded-lg hover:bg-sky-500/10 text-slate-400 hover:text-sky-400 border border-transparent hover:border-sky-500/20 transition-all duration-200"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteModal({ open: true, account: acc })}
                            title="Xóa"
                            className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Table footer */}
          <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/30">
            <p className="text-xs text-slate-500">
              Hiển thị {filteredAccounts.length} / {accounts.length} tài khoản
            </p>
          </div>
        </div>
      )}

      {/* Modals */}
      <AccountFormModal
        isOpen={formModal.open}
        mode={formModal.mode}
        account={formModal.account}
        roles={roles}
        onSubmit={formModal.mode === 'create' ? handleCreate : handleUpdate}
        onClose={() => setFormModal({ open: false, mode: 'create', account: null })}
        loading={actionLoading}
      />

      {deleteModal.open && (
        <DeleteModal
          account={deleteModal.account}
          onConfirm={handleDelete}
          onCancel={() => setDeleteModal({ open: false, account: null })}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
