import React, { useState } from 'react';
import { Receipt, ShoppingCart, CheckCircle } from 'lucide-react';

export default function InvoiceManagement() {
  const [formData, setFormData] = useState({ customer_id: '', voucher_code: '' });
  const [result, setResult] = useState(null);

  // Giỏ hàng ảo để test
  const demoCart = [
    { product_name: 'Phở Đặc Biệt', quantity: 2, price: 55000 },
    { product_name: 'Trà Đá', quantity: 2, price: 5000 }
  ];
  const cartTotal = demoCart.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  const handleCheckout = async (e) => {
    e.preventDefault();
    const payload = {
      customer_id: formData.customer_id ? parseInt(formData.customer_id) : null,
      voucher_code: formData.voucher_code,
      items: demoCart
    };

    const res = await fetch('http://localhost:5000/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    setResult(await res.json());
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Receipt className="text-emerald-500" /> Tính Tiền & Hóa Đơn
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Checkout */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg shadow-emerald-500/5">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ShoppingCart size={18} /> Xử Lý Thanh Toán
          </h2>
          
          <div className="mb-6 p-4 bg-slate-950 rounded-lg border border-slate-800">
            <h3 className="text-sm text-slate-400 mb-2">Giỏ hàng hiện tại:</h3>
            <ul className="space-y-2 mb-3">
              {demoCart.map((item, idx) => (
                <li key={idx} className="flex justify-between text-slate-200">
                  <span>{item.quantity}x {item.product_name}</span>
                  <span>{(item.quantity * item.price).toLocaleString()}đ</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-emerald-400">
              <span>Tổng cộng:</span>
              <span>{cartTotal.toLocaleString()}đ</span>
            </div>
          </div>

          <form onSubmit={handleCheckout} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">ID Khách Hàng (Để tích điểm)</label>
              <input type="number" value={formData.customer_id} onChange={e => setFormData({...formData, customer_id: e.target.value})}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-emerald-500" placeholder="Không bắt buộc" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Mã giảm giá</label>
              <input type="text" value={formData.voucher_code} onChange={e => setFormData({...formData, voucher_code: e.target.value})}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 uppercase" placeholder="Nhập mã nếu có" />
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-lg transition-colors">
              Xác Nhận Thanh Toán
            </button>
          </form>
        </div>

        {/* Kết quả hóa đơn */}
        {result && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg shadow-emerald-500/5 h-fit">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle size={18} className={result.success ? "text-green-500" : "text-red-500"} /> 
              Kết quả giao dịch
            </h2>
            
            {result.success ? (
              <div className="space-y-3 text-slate-300">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span>Tạm tính:</span> <span>{result.data.sub_total.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2 text-rose-400">
                  <span>Giảm giá:</span> <span>- {result.data.discount.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2 font-bold text-emerald-400 text-xl mt-4">
                  <span>Khách phải trả:</span> <span>{result.data.final_total.toLocaleString()}đ</span>
                </div>
                {result.data.points_earned > 0 && (
                  <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-sm text-center">
                    Khách hàng được cộng <b>{result.data.points_earned}</b> điểm thưởng!
                  </div>
                )}
              </div>
            ) : (
              <div className="text-red-400 bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                {result.error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}