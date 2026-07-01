import React, { useState, useEffect } from 'react';
import { Ticket, Plus, Tag } from 'lucide-react';

export default function VoucherManagement() {
  const [vouchers, setVouchers] = useState([]);
  const [formData, setFormData] = useState({
    code: '', discount_type: 'percent', discount_value: '', min_order_value: ''
  });
  const [message, setMessage] = useState('');

  // Lấy danh sách Voucher khi load trang
  useEffect(() => {
    fetch('http://localhost:5000/api/vouchers')
      .then(res => res.json())
      .then(data => {
        if (data.success) setVouchers(data.data);
      })
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/vouchers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const result = await res.json();
    setMessage(result.message || result.error);
    
    if (result.success) {
      setVouchers([result.data, ...vouchers]); // Cập nhật ngay lên UI
      setFormData({ code: '', discount_type: 'percent', discount_value: '', min_order_value: '' }); // Reset form
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Ticket className="text-purple-500" /> Quản Lý Khuyến Mãi
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Tạo Mới */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-fit shadow-lg shadow-purple-500/5">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus size={18} /> Tạo Mã Mới
          </h2>
          {message && <div className="mb-4 p-3 bg-slate-800 text-purple-400 rounded-lg text-sm">{message}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Mã giảm giá (Code)</label>
              <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-purple-500" required
                value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="VD: SUMMER10" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Loại giảm giá</label>
              <select className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                value={formData.discount_type} onChange={e => setFormData({...formData, discount_type: e.target.value})}>
                <option value="percent">Giảm theo phần trăm (%)</option>
                <option value="amount">Giảm tiền mặt (VNĐ)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Giá trị giảm</label>
              <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-purple-500" required
                value={formData.discount_value} onChange={e => setFormData({...formData, discount_value: e.target.value})} placeholder="VD: 10" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Đơn tối thiểu (VNĐ)</label>
              <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                value={formData.min_order_value} onChange={e => setFormData({...formData, min_order_value: e.target.value})} placeholder="VD: 100000" />
            </div>
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg transition-colors">
              Lưu Khuyến Mãi
            </button>
          </form>
        </div>

        {/* Danh sách */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg shadow-indigo-500/5">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Tag size={18} /> Danh Sách Mã Đang Hoạt Động
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-sm">
                  <th className="pb-3 font-medium">Mã Code</th>
                  <th className="pb-3 font-medium">Giá trị</th>
                  <th className="pb-3 font-medium">Đơn tối thiểu</th>
                  <th className="pb-3 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map(v => (
                  <tr key={v.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                    <td className="py-4 font-medium text-purple-400">{v.code}</td>
                    <td className="py-4">{v.discount_type === 'percent' ? `${v.discount_value}%` : `${v.discount_value.toLocaleString()}đ`}</td>
                    <td className="py-4">{v.min_order_value ? `${v.min_order_value.toLocaleString()}đ` : '0đ'}</td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-full">Đang chạy</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}