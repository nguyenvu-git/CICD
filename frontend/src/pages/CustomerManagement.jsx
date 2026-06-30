import React, { useState } from 'react';
import { Users, UserPlus } from 'lucide-react';

export default function CustomerManagement() {
  const [formData, setFormData] = useState({ full_name: '', phone: '' });
  const [message, setMessage] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const result = await res.json();
    setMessage(result.message || result.error);
    setIsSuccess(result.success);
    if (result.success) setFormData({ full_name: '', phone: '' });
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Users className="text-indigo-500" /> Quản Lý Khách Hàng
      </h1>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg shadow-indigo-500/5">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <UserPlus size={18} /> Đăng Ký Hội Viên Mới
        </h2>
        
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${isSuccess ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Họ và tên khách hàng</label>
            <input type="text" required value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" placeholder="VD: Nguyễn Văn A" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Số điện thoại (Dùng để tích điểm)</label>
            <input type="text" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" placeholder="VD: 0988123456" />
          </div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center gap-2">
            <UserPlus size={18} /> Thêm Khách Hàng
          </button>
        </form>
      </div>
    </div>
  );
}