import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import {
  Package, Plus, Search, RefreshCw, Edit3, Trash2, X,
  CheckCircle, XCircle, AlertTriangle, Loader2, Filter, AlignLeft, DollarSign, Activity
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

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
function DeleteModal({ item, onConfirm, onCancel, loading }) {
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
          <h3 className="text-xl font-bold text-white mb-2">Xác nhận xóa nguyên liệu</h3>
          <p className="text-slate-400 text-sm mb-1">
            Bạn có chắc chắn muốn xóa nguyên liệu:
          </p>
          <p className="text-white font-semibold text-lg mb-1">
            {item?.name}
          </p>
          <p className="text-slate-500 text-xs mb-6">
            Lưu ý: Hành động này không thể hoàn tác.
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
              Xóa nguyên liệu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Form modal (Create / Edit)
function InventoryFormModal({ isOpen, mode, item, onSubmit, onClose, loading }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && item) {
        reset({
          name: item.name || '',
          category: item.category || 'Other',
          unit: item.unit || '',
          quantity: item.quantity || 0,
          min_quantity: item.min_quantity || 0,
          price: item.price || 0,
          description: item.description || '',
        });
      } else {
        reset({
          name: '',
          category: 'Meat',
          unit: 'Kg',
          quantity: 0,
          min_quantity: 0,
          price: 0,
          description: '',
        });
      }
    }
  }, [isOpen, mode, item, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl animate-modalIn overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${mode === 'create'
              ? 'bg-emerald-500/10 border-emerald-500/20'
              : 'bg-sky-500/10 border-sky-500/20'
            }`}>
              <Package className={`h-5 w-5 ${mode === 'create' ? 'text-emerald-400' : 'text-sky-400'}`} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {mode === 'create' ? 'Thêm nguyên liệu mới' : 'Chỉnh sửa nguyên liệu'}
              </h3>
              <p className="text-xs text-slate-500">
                {mode === 'create' ? 'Đăng ký nguyên liệu vào kho' : `Đang sửa: ${item?.name}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto px-7 py-6">
          <form id="inventory-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Tên nguyên liệu <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  {...register('name', { required: 'Vui lòng nhập tên nguyên liệu' })}
                  placeholder="vd: Thịt bò Wagyu..."
                  className={`w-full px-4 py-3 bg-slate-900/70 border rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 transition-all duration-200
                    ${errors.name ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-emerald-500 focus:ring-emerald-500'}`}
                />
                {errors.name && (
                  <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                    <XCircle className="h-3 w-3" /> {errors.name.message}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Phân loại
                </label>
                <select
                  {...register('category')}
                  className="w-full px-4 py-3 bg-slate-900/70 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                >
                  <option value="Meat">Meat (Thịt)</option>
                  <option value="Vegetable">Vegetable (Rau củ)</option>
                  <option value="Seafood">Seafood (Hải sản)</option>
                  <option value="Spice">Spice (Gia vị)</option>
                  <option value="Drink">Drink (Đồ uống)</option>
                  <option value="Other">Other (Khác)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Unit */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Đơn vị tính <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  {...register('unit', { required: 'Vui lòng nhập đơn vị tính' })}
                  placeholder="vd: Kg, Lít, Gói..."
                  className={`w-full px-4 py-3 bg-slate-900/70 border rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 transition-all duration-200
                    ${errors.unit ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-emerald-500 focus:ring-emerald-500'}`}
                />
                {errors.unit && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1"><XCircle className="h-3 w-3" /> {errors.unit.message}</p>}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Đơn giá dự kiến (VNĐ)
                </label>
                <input
                  type="number" step="0.01"
                  {...register('price')}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-slate-900/70 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Tồn kho hiện tại
                </label>
                <input
                  type="number" step="0.01"
                  {...register('quantity')}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-slate-900/70 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>

              {/* Min Quantity */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Tồn kho tối thiểu (Cảnh báo)
                </label>
                <input
                  type="number" step="0.01"
                  {...register('min_quantity')}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-slate-900/70 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Mô tả thêm
              </label>
              <textarea
                {...register('description')}
                rows="3"
                placeholder="Ghi chú về nguyên liệu..."
                className="w-full px-4 py-3 bg-slate-900/70 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none"
              ></textarea>
            </div>

          </form>
        </div>
        
        {/* Footer */}
        <div className="flex justify-end gap-3 px-7 py-5 border-t border-slate-800 bg-slate-950/50 shrink-0">
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
            form="inventory-form"
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
      </div>
    </div>
  );
}

export default function InventoryManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  const [formModal, setFormModal] = useState({ open: false, mode: 'create', item: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/inventory`, {
        params: { search: searchQuery }
      });
      setItems(response.data);
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Không thể tải danh sách nguyên liệu.' });
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchItems();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [fetchItems]);

  const handleFormSubmit = async (data) => {
    setActionLoading(true);
    try {
      if (formModal.mode === 'create') {
        const response = await axios.post(`${API_BASE}/inventory`, data);
        setToast({ type: 'success', message: response.data.message });
      } else {
        const response = await axios.put(`${API_BASE}/inventory/${formModal.item.id}`, data);
        setToast({ type: 'success', message: response.data.message });
      }
      setFormModal({ open: false, mode: 'create', item: null });
      fetchItems();
    } catch (err) {
      const msg = err.response?.data?.error || 'Có lỗi xảy ra khi lưu nguyên liệu.';
      setToast({ type: 'error', message: msg });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setActionLoading(true);
    try {
      const response = await axios.delete(`${API_BASE}/inventory/${deleteModal.item.id}`);
      setToast({ type: 'success', message: response.data.message });
      setDeleteModal({ open: false, item: null });
      fetchItems();
    } catch (err) {
      const msg = err.response?.data?.error || 'Có lỗi xảy ra khi xóa nguyên liệu.';
      setToast({ type: 'error', message: msg });
    } finally {
      setActionLoading(false);
    }
  };

  const getCategoryColor = (cat) => {
    switch(cat) {
      case 'Meat': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'Vegetable': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Seafood': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Spice': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Drink': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <Package className="h-6 w-6 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Quản lý Kho Nguyên Liệu
            </h1>
          </div>
          <p className="text-slate-400 mt-1 ml-[52px]">
            Quản lý tồn kho, danh mục và cảnh báo mức nguyên liệu tối thiểu
          </p>
        </div>
        <button
          onClick={() => setFormModal({ open: true, mode: 'create', item: null })}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-600/20 transition-all duration-200 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Thêm nguyên liệu
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm kiếm nguyên liệu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-950/70 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all duration-200"
          />
        </div>
        <button
          onClick={fetchItems}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white disabled:opacity-50 transition-all duration-200 cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Tải lại
        </button>
      </div>

      <div className="border border-slate-800/80 rounded-2xl bg-slate-900/10 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50">
                <th className="py-4.5 px-6 text-xs font-semibold uppercase tracking-wider text-slate-400">Nguyên liệu</th>
                <th className="py-4.5 px-6 text-xs font-semibold uppercase tracking-wider text-slate-400">Tồn kho</th>
                <th className="py-4.5 px-6 text-xs font-semibold uppercase tracking-wider text-slate-400">Đơn giá dự kiến</th>
                <th className="py-4.5 px-6 text-xs font-semibold uppercase tracking-wider text-slate-400">Mô tả</th>
                <th className="py-4.5 px-6 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {loading && items.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
                      <span className="text-sm font-medium">Đang tải dữ liệu kho...</span>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package className="h-10 w-10 text-slate-600" />
                      <span className="text-sm font-medium">Kho rỗng hoặc không tìm thấy nguyên liệu</span>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((it) => {
                  const isLow = parseFloat(it.quantity) <= parseFloat(it.min_quantity);
                  return (
                    <tr key={it.id} className="hover:bg-slate-900/30 transition-colors duration-150">
                      <td className="py-4.5 px-6 text-sm">
                        <div className="font-bold text-white mb-1">{it.name}</div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getCategoryColor(it.category)}`}>
                          {it.category || 'Other'}
                        </span>
                      </td>
                      <td className="py-4.5 px-6 text-sm">
                        <div className="flex items-center gap-2">
                          <Activity className={`h-4 w-4 ${isLow ? 'text-red-400' : 'text-emerald-400'}`} />
                          <span className={`font-medium ${isLow ? 'text-red-400' : 'text-slate-300'}`}>
                            {it.quantity} {it.unit}
                          </span>
                        </div>
                        {isLow && <div className="text-red-500/80 text-xs mt-1">Sắp hết (Min: {it.min_quantity})</div>}
                      </td>
                      <td className="py-4.5 px-6 text-sm text-slate-350">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5 text-slate-500" />
                          <span>{Number(it.price).toLocaleString()} đ/{it.unit}</span>
                        </div>
                      </td>
                      <td className="py-4.5 px-6 text-sm text-slate-400 max-w-xs truncate">
                        <div className="flex items-center gap-2">
                          <AlignLeft className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                          <span>{it.description || '—'}</span>
                        </div>
                      </td>
                      <td className="py-4.5 px-6 text-sm text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setFormModal({ open: true, mode: 'edit', item: it })}
                            className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:bg-sky-500/20 hover:text-white transition-all cursor-pointer"
                            title="Chỉnh sửa"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteModal({ open: true, item: it })}
                            className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-white transition-all cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <InventoryFormModal
        isOpen={formModal.open}
        mode={formModal.mode}
        item={formModal.item}
        onSubmit={handleFormSubmit}
        onClose={() => setFormModal({ open: false, mode: 'create', item: null })}
        loading={actionLoading}
      />

      {deleteModal.open && (
        <DeleteModal
          item={deleteModal.item}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteModal({ open: false, item: null })}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
