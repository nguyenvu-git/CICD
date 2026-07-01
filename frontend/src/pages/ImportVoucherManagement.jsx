import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import {
  FileText, Plus, Search, RefreshCw, Trash2, X, Eye,
  CheckCircle, XCircle, AlertTriangle, Loader2, DollarSign, Calendar, Truck
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

function Toast({ toast, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = toast.type === 'success';
  return (
    <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-2xl backdrop-blur-xl animate-slideIn
      ${isSuccess ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300' : 'bg-red-950/80 border-red-500/30 text-red-300'}`}
    >
      {isSuccess ? <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" /> : <XCircle className="h-5 w-5 text-red-400 shrink-0" />}
      <span className="text-sm font-medium max-w-xs">{toast.message}</span>
      <button onClick={onClose} className="ml-2 text-slate-500 hover:text-white transition-colors">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function DeleteModal({ voucher, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-md bg-slate-950/95 border border-slate-800 rounded-2xl p-8 shadow-2xl animate-modalIn" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col items-center text-center">
          <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20 mb-5">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Xác nhận xóa phiếu nhập</h3>
          <p className="text-slate-400 text-sm mb-1">Mã phiếu:</p>
          <p className="text-white font-semibold text-lg mb-1">{voucher?.code}</p>
          <p className="text-slate-500 text-xs mb-6">Lưu ý: Số lượng tồn kho sẽ bị trừ đi tương ứng.</p>
          <div className="flex gap-3 w-full">
            <button onClick={onCancel} disabled={loading} className="flex-1 px-4 py-3 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium">Hủy bỏ</button>
            <button onClick={onConfirm} disabled={loading} className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium flex items-center justify-center gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Xóa phiếu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ViewVoucherModal({ voucherId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE}/import-vouchers/${voucherId}`).then(res => {
      setData(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [voucherId]);

  if (!voucherId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-3xl bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between p-6 border-b border-slate-800 shrink-0">
          <h3 className="text-lg font-bold text-white">Chi tiết phiếu nhập: {data?.code}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 text-sky-400 animate-spin" /></div>
          ) : data ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <div><span className="text-slate-500">Nhà cung cấp:</span> <span className="text-white font-medium">{data.supplier_name}</span></div>
                <div><span className="text-slate-500">Ngày nhập:</span> <span className="text-white font-medium">{new Date(data.import_date).toLocaleString()}</span></div>
                <div><span className="text-slate-500">Trạng thái:</span> <span className="text-emerald-400 font-medium">{data.status}</span></div>
                <div><span className="text-slate-500">Tổng tiền:</span> <span className="text-white font-bold text-sky-400">{Number(data.total_cost).toLocaleString()} đ</span></div>
              </div>
              <div>
                <h4 className="text-white font-medium mb-3">Danh sách nguyên liệu</h4>
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-900 text-slate-400">
                      <tr>
                        <th className="px-4 py-2">Nguyên liệu</th>
                        <th className="px-4 py-2">Số lượng</th>
                        <th className="px-4 py-2">Đơn giá</th>
                        <th className="px-4 py-2 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {data.details && data.details.map(d => (
                        <tr key={d.id} className="text-slate-300">
                          <td className="px-4 py-3">{d.inventory_name}</td>
                          <td className="px-4 py-3">{d.quantity} {d.inventory_unit}</td>
                          <td className="px-4 py-3">{Number(d.unit_price).toLocaleString()} đ</td>
                          <td className="px-4 py-3 text-right">{Number(d.total).toLocaleString()} đ</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-red-400">Không tìm thấy dữ liệu.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function CreateVoucherModal({ isOpen, onClose, onSubmit, suppliers, inventory, loading }) {
  const [details, setDetails] = useState([{ inventory_id: '', quantity: 1, unit_price: 0 }]);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (isOpen) {
      reset({ code: `IMP-${Date.now().toString().slice(-6)}`, supplier_id: '', status: 'Completed', note: '' });
      setDetails([{ inventory_id: '', quantity: 1, unit_price: 0 }]);
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = (data) => {
    const validDetails = details.filter(d => d.inventory_id && d.quantity > 0);
    onSubmit({ ...data, details: validDetails });
  };

  const calculateTotal = () => {
    return details.reduce((acc, curr) => acc + (parseFloat(curr.quantity || 0) * parseFloat(curr.unit_price || 0)), 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-4xl bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between p-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/10 rounded-lg border border-sky-500/20"><FileText className="text-sky-400" /></div>
            <h3 className="text-lg font-bold text-white">Tạo phiếu nhập mới</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X className="h-5 w-5" /></button>
        </div>

        <form id="voucher-form" onSubmit={handleSubmit(handleFormSubmit)} className="overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Mã phiếu</label>
              <input type="text" {...register('code', { required: true })} className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nhà cung cấp</label>
              <select {...register('supplier_id', { required: true })} className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white">
                <option value="">-- Chọn nhà cung cấp --</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.supplier_name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="block text-sm font-medium text-slate-300">Chi tiết nhập nguyên liệu</label>
              <button type="button" onClick={() => setDetails([...details, { inventory_id: '', quantity: 1, unit_price: 0 }])} className="text-sky-400 text-sm hover:underline flex items-center gap-1">
                <Plus className="w-4 h-4" /> Thêm dòng
              </button>
            </div>
            <div className="space-y-3">
              {details.map((d, idx) => (
                <div key={idx} className="flex gap-3 items-center">
                  <select 
                    value={d.inventory_id} 
                    onChange={e => {
                      const newD = [...details];
                      newD[idx].inventory_id = e.target.value;
                      const inv = inventory.find(i => i.id === parseInt(e.target.value));
                      if (inv) newD[idx].unit_price = inv.price;
                      setDetails(newD);
                    }}
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white text-sm"
                  >
                    <option value="">- Chọn nguyên liệu -</option>
                    {inventory.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
                  </select>
                  <input type="number" step="0.01" value={d.quantity} onChange={e => { const newD=[...details]; newD[idx].quantity = e.target.value; setDetails(newD); }} placeholder="SL" className="w-24 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white text-sm" />
                  <input type="number" step="1" value={d.unit_price} onChange={e => { const newD=[...details]; newD[idx].unit_price = e.target.value; setDetails(newD); }} placeholder="Đơn giá" className="w-32 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white text-sm" />
                  <div className="w-24 text-right text-sm text-slate-400">{Number((d.quantity * d.unit_price) || 0).toLocaleString()}</div>
                  <button type="button" onClick={() => { const newD=[...details]; newD.splice(idx, 1); setDetails(newD); }} className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
            <div className="mt-4 text-right text-lg font-bold text-sky-400">
              Tổng tiền: {Number(calculateTotal()).toLocaleString()} đ
            </div>
          </div>
        </form>

        <div className="flex justify-end gap-3 p-6 border-t border-slate-800 shrink-0">
          <button type="button" onClick={onClose} disabled={loading} className="px-5 py-2 rounded-xl border border-slate-700 text-slate-300">Hủy</button>
          <button type="submit" form="voucher-form" disabled={loading} className="px-5 py-2 rounded-xl bg-sky-600 text-white flex gap-2 items-center">
            {loading && <Loader2 className="w-4 h-4 animate-spin"/>} Hoàn thành
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ImportVoucherManagement() {
  const [vouchers, setVouchers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  const [createModal, setCreateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, voucher: null });
  const [viewVoucherId, setViewVoucherId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [vRes, sRes, iRes] = await Promise.all([
        axios.get(`${API_BASE}/import-vouchers`, { params: { search: searchQuery } }),
        axios.get(`${API_BASE}/suppliers`),
        axios.get(`${API_BASE}/inventory`)
      ]);
      setVouchers(vRes.data);
      setSuppliers(sRes.data);
      setInventory(iRes.data);
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Không thể tải dữ liệu phiếu nhập.' });
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => { fetchData(); }, 300);
    return () => clearTimeout(delayDebounce);
  }, [fetchData]);

  const handleCreate = async (data) => {
    if (data.details.length === 0) {
      setToast({ type: 'error', message: 'Cần ít nhất 1 nguyên liệu' });
      return;
    }
    setActionLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/import-vouchers`, data);
      setToast({ type: 'success', message: response.data.message });
      setCreateModal(false);
      fetchData();
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.error || 'Lỗi tạo phiếu' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      const response = await axios.delete(`${API_BASE}/import-vouchers/${deleteModal.voucher.id}`);
      setToast({ type: 'success', message: response.data.message });
      setDeleteModal({ open: false, voucher: null });
      fetchData();
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.error || 'Lỗi xóa phiếu' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-sky-500/10 rounded-xl border border-sky-500/20 shadow-[0_0_20px_rgba(14,165,233,0.1)]">
              <FileText className="h-6 w-6 text-sky-400" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Quản lý Phiếu Nhập Kho</h1>
          </div>
          <p className="text-slate-400 mt-1 ml-[52px]">Kiểm soát quá trình nhập nguyên liệu và thanh toán cho nhà cung cấp</p>
        </div>
        <button
          onClick={() => setCreateModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium shadow-lg transition-all"
        >
          <Plus className="h-4 w-4" /> Tạo phiếu nhập
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
          <input type="text" placeholder="Tìm theo mã phiếu, nhà cung cấp..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-white" />
        </div>
        <button onClick={fetchData} className="px-4 py-3 border border-slate-700 bg-slate-950 text-slate-400 rounded-xl hover:text-white flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Tải lại
        </button>
      </div>

      <div className="border border-slate-800/80 rounded-2xl bg-slate-900/10 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950/50 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4">Mã phiếu</th>
                <th className="px-6 py-4">Nhà cung cấp</th>
                <th className="px-6 py-4">Tổng tiền</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading && vouchers.length === 0 ? (
                <tr><td colSpan="5" className="py-16 text-center text-slate-500"><Loader2 className="w-8 h-8 text-sky-400 animate-spin mx-auto" /></td></tr>
              ) : vouchers.length === 0 ? (
                <tr><td colSpan="5" className="py-16 text-center text-slate-500">Không có phiếu nhập nào</td></tr>
              ) : vouchers.map(v => (
                <tr key={v.id} className="hover:bg-slate-900/30">
                  <td className="px-6 py-4 font-bold text-white">{v.code}<div className="text-xs text-slate-500 mt-1 font-normal">{new Date(v.import_date).toLocaleDateString('vi-VN')}</div></td>
                  <td className="px-6 py-4 text-sm text-slate-300"><div className="flex items-center gap-2"><Truck className="w-4 h-4 text-slate-500"/> {v.supplier_name}</div></td>
                  <td className="px-6 py-4 text-sm font-semibold text-sky-400">{Number(v.total_cost).toLocaleString()} đ</td>
                  <td className="px-6 py-4 text-sm text-emerald-400">{v.status}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setViewVoucherId(v.id)} className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20" title="Xem chi tiết"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteModal({ open: true, voucher: v })} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreateVoucherModal isOpen={createModal} onClose={() => setCreateModal(false)} onSubmit={handleCreate} suppliers={suppliers} inventory={inventory} loading={actionLoading} />
      {deleteModal.open && <DeleteModal voucher={deleteModal.voucher} onConfirm={handleDelete} onCancel={() => setDeleteModal({ open: false, voucher: null })} loading={actionLoading} />}
      {viewVoucherId && <ViewVoucherModal voucherId={viewVoucherId} onClose={() => setViewVoucherId(null)} />}
    </div>
  );
}
