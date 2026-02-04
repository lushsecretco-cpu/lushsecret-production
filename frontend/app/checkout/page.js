'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/store';

export default function CheckoutPage() {
  const { items, updateQuantity, removeItem, calculateTotal, total, clearCart } = useCartStore();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
  });

  useEffect(() => {
    calculateTotal();
  }, [items, calculateTotal]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleMockCheckout = () => {
    alert('Checkout preparado. Aquí conectaremos Wompi en el siguiente paso.');
    clearCart();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0b10] via-[#1a0a15] to-[#0b0b10]">
      <div className="container py-12">
        <h1 className="text-3xl font-light text-rose-200 mb-8">Carrito de compras</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-rose-300/20">
              <h2 className="text-xl font-light text-rose-200 mb-4">Datos de envío</h2>
              <div className="grid sm:grid-cols-2 gap-4">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nombre completo"
                className="px-4 py-2 border border-rose-300/30 rounded-lg bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:border-rose-300 font-light"
              />
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Correo"
                className="px-4 py-2 border border-rose-300/30 rounded-lg bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:border-rose-300 font-light"
              />
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Teléfono"
                className="px-4 py-2 border border-rose-300/30 rounded-lg bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:border-rose-300 font-light"
              />
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Ciudad"
                className="px-4 py-2 border border-rose-300/30 rounded-lg bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:border-rose-300 font-light"
              />
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Dirección"
                className="px-4 py-2 border border-rose-300/30 rounded-lg bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:border-rose-300 font-light sm:col-span-2"
              />
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-rose-300/20">
              <h2 className="text-xl font-light text-rose-200 mb-4">Tu carrito</h2>
            {items.length === 0 ? (
              <p className="text-white/60 font-light">Tu carrito está vacío.</p>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.product_id} className="flex items-center justify-between gap-4 border-b border-rose-300/20 pb-4">
                    <div>
                      <p className="font-light text-white">{item.name}</p>
                      <p className="text-sm text-rose-200">${item.price.toLocaleString('es-CO')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product_id, Math.max(1, item.quantity - 1))}
                        className="px-2 py-1 bg-rose-300/20 rounded text-rose-200 hover:bg-rose-300/30 transition font-light"
                      >
                        -
                      </button>
                      <span className="text-white font-light">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="px-2 py-1 bg-rose-300/20 rounded text-rose-200 hover:bg-rose-300/30 transition font-light"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.product_id)}
                        className="text-sm text-rose-300 ml-3 hover:text-rose-200 transition font-light"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>

        <aside className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-rose-300/20 h-fit">
          <h2 className="text-xl font-light text-rose-200 mb-4">Resumen</h2>
          <div className="flex items-center justify-between text-white/70 mb-2 font-light">
            <span>Subtotal</span>
            <span>${total.toLocaleString('es-CO')}</span>
          </div>
          <div className="flex items-center justify-between text-white/70 mb-2 font-light">
            <span>Envío</span>
            <span>Gratis</span>
          </div>
          <div className="border-t border-rose-300/20 pt-4 flex items-center justify-between font-light text-lg text-rose-200">
            <span>Total</span>
            <span>${total.toLocaleString('es-CO')}</span>
          </div>
          <button
            disabled={items.length === 0}
            onClick={handleMockCheckout}
            className="mt-6 w-full bg-gradient-to-r from-rose-300 to-rose-400 text-[#0b0b10] py-3 rounded-lg font-light hover:from-rose-200 hover:to-rose-300 disabled:bg-white/20 disabled:text-white/50 transition shadow-lg shadow-rose-300/50"
          >
            Continuar a pago
          </button>
        </aside>
      </div>
      </div>
    </div>
  );
}
