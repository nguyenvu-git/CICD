import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import {
  FolderOpen, Plus, Search, RefreshCw, Edit3, Trash2, X,
  CheckCircle, XCircle, AlertTriangle, Loader2
} from 'lucide-react';

const API_BASE = `http://${window.location.hostname}:5000/api`;

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
function DeleteModal({ category, onConfirm, onCancel, loading }) {
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
          <h3 className="text-xl font-bold text-white mb-2">Xác nhận xóa danh mục</h3>
          <p className="text-slate-400 text-sm mb-1">
            Bạn có chắc chắn muốn xóa danh mục:
          </p>
          <p className="text-white font-semibold text-lg mb-1">
            {category?.category_name}
          </p>
          <p className="text-slate-500 text-xs mb-6">
            Lưu ý: Hành động này sẽ chuyển các món ăn thuộc danh mục này sang trạng thái "Chưa phân loại".
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
              Xóa danh mục
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Category form modal (Create / Edit)
function CategoryFormModal({ isOpen, mode, category, onSubmit, onClose, loading }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && category) {
        reset({
          category_name: category.category_name || '',
          description: category.description || '',
        });
      } else {
        reset({
          category_name: '',
          description: '',
        });
      }
    }
  }, [isOpen, mode, category, reset]);

  if (!isOpen) return null;

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
              ? 'bg-emerald-500/10 border-emerald-500/20'
              : 'bg-sky-500/10 border-sky-500/20'
            }`}>
              <FolderOpen className={`h-5 w-5 ${mode === 'create' ? 'text-emerald-400' : 'text-sky-400'}`} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {mode === 'create' ? 'Tạo danh mục mới' : 'Chỉnh sửa danh mục'}
              </h3>
              <p className="text-xs text-slate-500">
                {mode === 'create' ? 'Phân loại cho thực đơn nhà hàng' : `Đang sửa: ${category?.category_name}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-7 py-6 space-y-5">
          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Tên danh mục <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              {...register('category_name', {
                required: 'Vui lòng nhập tên danh mục',
                maxLength: { value: 100, message: 'Tối đa 100 ký tự' }
              })}
              placeholder="vd: Đồ uống, Món chính, Tráng miệng..."
              className={`w-full px-4 py-3 bg-slate-900/70 border rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 transition-all duration-200
                ${errors.category_name ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-emerald-500 focus:ring-emerald-500'}`}
            />
            {errors.category_name && (
              <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                <XCircle className="h-3 w-3" /> {errors.category_name.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Mô tả chi tiết
            </label>
            <textarea
              rows="4"
              {...register('description', {
                maxLength: { value: 255, message: 'Tối đa 255 ký tự' }
              })}
              placeholder="Nhập mô tả ngắn gọn về danh mục này..."
              className={`w-full px-4 py-3 bg-slate-900/70 border rounded-xl text-white placeholder-slate-650 focus:outline-none focus:ring-1 transition-all duration-200 resize-none
                ${errors.description ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-emerald-500 focus:ring-emerald-500'}`}
            />
            {errors.description && (
              <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                <XCircle className="h-3 w-3" /> {errors.description.message}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium transition-all duration-200 disabled:opacity-50 text-sm"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2.5 rounded-xl text-white font-medium shadow-lg transition-all duration-200 disabled:opacity-50 text-sm flex items-center gap-2
                ${mode === 'create'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20 hover:shadow-emerald-500/30'
                  : 'bg-sky-600 hover:bg-sky-500 shadow-sky-600/20 hover:shadow-sky-500/30'
                }`}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  // Modals state
  const [formModal, setFormModal] = useState({ open: false, mode: 'create', category: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, category: null });

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/categories`, {
        params: { search: searchQuery }
      });
      setCategories(response.data);
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Không thể tải danh sách danh mục.' });
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCategories();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [fetchCategories]);

  // Create or Update submit handler
  const handleFormSubmit = async (data) => {
    setActionLoading(true);
    try {
      if (formModal.mode === 'create') {
        const response = await axios.post(`${API_BASE}/categories`, data);
        setToast({ type: 'success', message: response.data.message });
      } else {
        const response = await axios.put(`${API_BASE}/categories/${formModal.category.id}`, data);
        setToast({ type: 'success', message: response.data.message });
      }
      setFormModal({ open: false, mode: 'create', category: null });
      fetchCategories();
    } catch (err) {
      const msg = err.response?.data?.error || 'Có lỗi xảy ra khi lưu danh mục.';
      setToast({ type: 'error', message: msg });
    } finally {
      setActionLoading(false);
    }
  };

  // Delete category handler
  const handleDeleteConfirm = async () => {
    setActionLoading(true);
    try {
      const response = await axios.delete(`${API_BASE}/categories/${deleteModal.category.id}`);
      setToast({ type: 'success', message: response.data.message });
      setDeleteModal({ open: false, category: null });
      fetchCategories();
    } catch (err) {
      const msg = err.response?.data?.error || 'Có lỗi xảy ra khi xóa danh mục.';
      setToast({ type: 'error', message: msg });
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (e) {
      return dateStr;
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
            <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-[0_0_20px_rgba(52,211,153,0.1)]">
              <FolderOpen className="h-6 w-6 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Quản lý Danh mục
            </h1>
          </div>
          <p className="text-slate-400 mt-1 ml-[52px]">
            Quản lý các nhóm phân loại món ăn trong thực đơn của nhà hàng
          </p>
        </div>
        <button
          onClick={() => setFormModal({ open: true, mode: 'create', category: null })}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-600/20 transition-all duration-200 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Thêm danh mục
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-950/70 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all duration-200"
          />
        </div>
        {/* Refresh */}
        <button
          onClick={fetchCategories}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white disabled:opacity-50 transition-all duration-200 cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Tải lại
        </button>
      </div>

      {/* Data Table */}
      <div className="border border-slate-800/80 rounded-2xl bg-slate-900/10 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50">
                <th className="py-4.5 px-6 text-xs font-semibold uppercase tracking-wider text-slate-400">Danh mục</th>
                <th className="py-4.5 px-6 text-xs font-semibold uppercase tracking-wider text-slate-400">Mô tả chi tiết</th>
                <th className="py-4.5 px-6 text-xs font-semibold uppercase tracking-wider text-slate-400">Ngày tạo</th>
                <th className="py-4.5 px-6 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {loading && categories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
                      <span className="text-sm font-medium">Đang tải danh mục...</span>
                    </div>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FolderOpen className="h-10 w-10 text-slate-600" />
                      <span className="text-sm font-medium">Không tìm thấy danh mục nào</span>
                    </div>
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-900/30 transition-colors duration-150">
                    <td className="py-4.5 px-6 text-sm">
                      <div className="font-bold text-white text-base">{cat.category_name}</div>
                      <div className="text-slate-500 text-2xs font-mono">ID: #{cat.id}</div>
                    </td>
                    <td className="py-4.5 px-6 text-sm text-slate-350 max-w-sm truncate">
                      {cat.description || <span className="text-slate-600 italic">Chưa có mô tả</span>}
                    </td>
                    <td className="py-4.5 px-6 text-sm text-slate-500">{formatDate(cat.created_at)}</td>
                    <td className="py-4.5 px-6 text-sm text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setFormModal({ open: true, mode: 'edit', category: cat })}
                          className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:bg-sky-500/20 hover:text-white transition-all cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ open: true, category: cat })}
                          className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-white transition-all cursor-pointer"
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Form Modal */}
      <CategoryFormModal
        isOpen={formModal.open}
        mode={formModal.mode}
        category={formModal.category}
        onSubmit={handleFormSubmit}
        onClose={() => setFormModal({ open: false, mode: 'create', category: null })}
        loading={actionLoading}
      />

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <DeleteModal
          category={deleteModal.category}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteModal({ open: false, category: null })}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
