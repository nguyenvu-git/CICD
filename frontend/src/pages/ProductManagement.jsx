import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import {
  Utensils, Plus, Search, RefreshCw, Edit3, Trash2, X,
  CheckCircle, XCircle, AlertTriangle, Loader2, DollarSign, Image
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
function DeleteModal({ product, onConfirm, onCancel, loading }) {
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
          <h3 className="text-xl font-bold text-white mb-2">Xác nhận xóa món ăn</h3>
          <p className="text-slate-400 text-sm mb-1">
            Bạn có chắc chắn muốn xóa món ăn này ra khỏi thực đơn:
          </p>
          <p className="text-white font-semibold text-lg mb-6">
            {product?.product_name}
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
              Xóa món ăn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Product form modal (Create / Edit)
function ProductFormModal({ isOpen, mode, product, categories, onSubmit, onClose, loading }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && product) {
        reset({
          product_name: product.product_name || '',
          category_id: product.category_id || '',
          price: product.price || '',
          image_url: product.image_url || '',
          is_available: product.is_available !== undefined ? product.is_available.toString() : '1',
        });
      } else {
        reset({
          product_name: '',
          category_id: '',
          price: '',
          image_url: '',
          is_available: '1',
        });
      }
    }
  }, [isOpen, mode, product, reset]);

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
              ? 'bg-amber-500/10 border-amber-500/20'
              : 'bg-sky-500/10 border-sky-500/20'
            }`}>
              <Utensils className={`h-5 w-5 ${mode === 'create' ? 'text-amber-400' : 'text-sky-400'}`} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {mode === 'create' ? 'Thêm món ăn mới' : 'Chỉnh sửa món ăn'}
              </h3>
              <p className="text-xs text-slate-500">
                {mode === 'create' ? 'Tạo mới một món ăn trong menu' : `Đang sửa: ${product?.product_name}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-7 py-6 space-y-5">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Tên món ăn <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              {...register('product_name', {
                required: 'Vui lòng nhập tên món ăn',
                maxLength: { value: 150, message: 'Tối đa 150 ký tự' }
              })}
              placeholder="vd: Cà phê sữa đá, Bún chả Hà Nội..."
              className={`w-full px-4 py-3 bg-slate-900/70 border rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 transition-all duration-200
                ${errors.product_name ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-amber-500 focus:ring-amber-500'}`}
            />
            {errors.product_name && (
              <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                <XCircle className="h-3 w-3" /> {errors.product_name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Danh mục món <span className="text-red-400">*</span>
              </label>
              <select
                {...register('category_id', { required: 'Vui lòng chọn danh mục' })}
                className="w-full px-4 py-3 bg-slate-900/70 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-white focus:outline-none transition-all"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.category_name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <XCircle className="h-3 w-3" /> {errors.category_id.message}
                </p>
              )}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Giá bán (VNĐ) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">đ</span>
                <input
                  type="number"
                  {...register('price', {
                    required: 'Vui lòng nhập giá bán',
                    min: { value: 0, message: 'Giá bán phải lớn hơn hoặc bằng 0' }
                  })}
                  placeholder="30000"
                  className={`w-full pl-8 pr-4 py-3 bg-slate-900/70 border rounded-xl text-white placeholder-slate-650 focus:outline-none focus:ring-1 transition-all duration-200
                    ${errors.price ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-amber-500 focus:ring-amber-500'}`}
                />
              </div>
              {errors.price && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <XCircle className="h-3 w-3" /> {errors.price.message}
                </p>
              )}
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Link hình ảnh minh họa
            </label>
            <input
              type="text"
              {...register('image_url', {
                maxLength: { value: 255, message: 'Tối đa 255 ký tự' }
              })}
              placeholder="http://example.com/image.jpg (để trống nếu chưa có)"
              className={`w-full px-4 py-3 bg-slate-900/70 border rounded-xl text-white placeholder-slate-650 focus:outline-none focus:ring-1 transition-all duration-200
                ${errors.image_url ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-amber-500 focus:ring-amber-500'}`}
            />
            {errors.image_url && (
              <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                <XCircle className="h-3 w-3" /> {errors.image_url.message}
              </p>
            )}
          </div>

          {/* Status Selection (Available / Out of Stock) */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 font-semibold">
              Trạng thái phục vụ
            </label>
            <div className="flex gap-6 mt-2">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="radio"
                  value="1"
                  {...register('is_available')}
                  className="accent-amber-500 h-4 w-4"
                />
                <span>Còn món (Đang phục vụ)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="radio"
                  value="0"
                  {...register('is_available')}
                  className="accent-amber-500 h-4 w-4"
                />
                <span>Hết món (Tạm ngưng)</span>
              </label>
            </div>
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
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20 hover:shadow-amber-500/30'
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

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [toast, setToast] = useState(null);

  // Modals state
  const [formModal, setFormModal] = useState({ open: false, mode: 'create', product: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, product: null });

  // Fetch Categories for dropdown list selection
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/categories`);
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }, []);

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { search: searchQuery };
      if (filterCategory) {
        params.category_id = filterCategory;
      }
      const response = await axios.get(`${API_BASE}/products`, { params });
      setProducts(response.data);
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Không thể tải danh sách món ăn.' });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterCategory]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [fetchProducts]);

  // Create or Update submit handler
  const handleFormSubmit = async (data) => {
    setActionLoading(true);
    try {
      const payload = {
        ...data,
        category_id: parseInt(data.category_id),
        price: parseFloat(data.price),
        is_available: parseInt(data.is_available),
      };

      if (formModal.mode === 'create') {
        const response = await axios.post(`${API_BASE}/products`, payload);
        setToast({ type: 'success', message: response.data.message });
      } else {
        const response = await axios.put(`${API_BASE}/products/${formModal.product.id}`, payload);
        setToast({ type: 'success', message: response.data.message });
      }
      setFormModal({ open: false, mode: 'create', product: null });
      fetchProducts();
    } catch (err) {
      const msg = err.response?.data?.error || 'Có lỗi xảy ra khi lưu món ăn.';
      setToast({ type: 'error', message: msg });
    } finally {
      setActionLoading(false);
    }
  };

  // Delete product handler
  const handleDeleteConfirm = async () => {
    setActionLoading(true);
    try {
      const response = await axios.delete(`${API_BASE}/products/${deleteModal.product.id}`);
      setToast({ type: 'success', message: response.data.message });
      setDeleteModal({ open: false, product: null });
      fetchProducts();
    } catch (err) {
      const msg = err.response?.data?.error || 'Có lỗi xảy ra khi xóa món ăn.';
      setToast({ type: 'error', message: msg });
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      {/* Toast */}
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
              <Utensils className="h-6 w-6 text-amber-400" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Quản lý Thực đơn (Món ăn)
            </h1>
          </div>
          <p className="text-slate-400 mt-1 ml-[52px]">
            Quản lý thông tin chi tiết tên món ăn, giá tiền, hình ảnh và trạng thái phục vụ trong nhà hàng
          </p>
        </div>
        <button
          onClick={() => setFormModal({ open: true, mode: 'create', product: null })}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium shadow-lg shadow-amber-600/20 transition-all duration-200 hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Thêm món ăn mới
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên món, danh mục..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-950/70 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all duration-200"
          />
        </div>

        {/* Category filter dropdown */}
        <div className="w-full md:w-56">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-4 py-3 bg-slate-950/70 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-white focus:outline-none transition-all"
          >
            <option value="">Lọc theo: Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.category_name}
              </option>
            ))}
          </select>
        </div>

        {/* Refresh */}
        <button
          onClick={fetchProducts}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white disabled:opacity-50 transition-all duration-200 ml-auto cursor-pointer"
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
                <th className="py-4.5 px-6 text-xs font-semibold uppercase tracking-wider text-slate-400">Hình ảnh</th>
                <th className="py-4.5 px-6 text-xs font-semibold uppercase tracking-wider text-slate-400">Món ăn</th>
                <th className="py-4.5 px-6 text-xs font-semibold uppercase tracking-wider text-slate-400">Danh mục</th>
                <th className="py-4.5 px-6 text-xs font-semibold uppercase tracking-wider text-slate-400">Giá bán</th>
                <th className="py-4.5 px-6 text-xs font-semibold uppercase tracking-wider text-slate-400">Trạng thái</th>
                <th className="py-4.5 px-6 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {loading && products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="h-8 w-8 text-amber-400 animate-spin" />
                      <span className="text-sm font-medium">Đang tải danh sách menu...</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Utensils className="h-10 w-10 text-slate-600" />
                      <span className="text-sm font-medium">Không tìm thấy món ăn nào</span>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-900/30 transition-colors duration-150">
                    {/* Image */}
                    <td className="py-4.5 px-6 text-sm">
                      {prod.image_url ? (
                        <img
                          src={prod.image_url}
                          alt={prod.product_name}
                          className="h-12 w-12 rounded-xl object-cover border border-slate-800 bg-slate-900"
                          onError={(e) => { e.target.src = ''; }}
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-center text-slate-600">
                          <Image className="h-5 w-5" />
                        </div>
                      )}
                    </td>

                    {/* Name */}
                    <td className="py-4.5 px-6 text-sm">
                      <div className="font-bold text-white text-base">{prod.product_name}</div>
                      <div className="text-slate-500 text-2xs font-mono">ID: #{prod.id}</div>
                    </td>

                    {/* Category name */}
                    <td className="py-4.5 px-6 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold
                        ${prod.category_id
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                        }`}
                      >
                        {prod.category_name || 'Chưa phân loại'}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-4.5 px-6 text-sm font-bold text-white">
                      {formatCurrency(prod.price)}
                    </td>

                    {/* Status */}
                    <td className="py-4.5 px-6 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold
                        ${prod.is_available === 1
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {prod.is_available === 1 ? 'Còn món' : 'Hết món'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4.5 px-6 text-sm text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setFormModal({ open: true, mode: 'edit', product: prod })}
                          className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:bg-sky-500/20 hover:text-white transition-all cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ open: true, product: prod })}
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

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={formModal.open}
        mode={formModal.mode}
        product={formModal.product}
        categories={categories}
        onSubmit={handleFormSubmit}
        onClose={() => setFormModal({ open: false, mode: 'create', product: null })}
        loading={actionLoading}
      />

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <DeleteModal
          product={deleteModal.product}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteModal({ open: false, product: null })}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
