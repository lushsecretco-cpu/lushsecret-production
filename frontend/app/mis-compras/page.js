'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { paymentsAPI } from '@/lib/apiClient';
import { FiArrowLeft, FiBox, FiCalendar, FiDollarSign } from 'react-icons/fi';

export default function MisComprasPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }

    const loadOrders = async () => {
      try {
        setLoading(true);
        const response = await paymentsAPI.getUserOrders(user.id);
        setOrders(response.data || []);
      } catch (err) {
        console.error('Error loading orders:', err);
        setError('Error al cargar tus compras');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user, router]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'pendiente':
        return 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30';
      case 'processing':
      case 'procesando':
        return 'bg-blue-500/20 text-blue-200 border-blue-500/30';
      case 'shipped':
      case 'enviado':
        return 'bg-purple-500/20 text-purple-200 border-purple-500/30';
      case 'delivered':
      case 'entregado':
        return 'bg-green-500/20 text-green-200 border-green-500/30';
      case 'cancelled':
      case 'cancelado':
        return 'bg-red-500/20 text-red-200 border-red-500/30';
      default:
        return 'bg-white/10 text-white/70 border-white/20';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0b10] via-[#1a0a15] to-[#0b0b10] py-12">
      <div className="container max-w-4xl">
        <Link href="/" className="flex items-center gap-2 text-rose-200 hover:text-rose-300 mb-8 transition font-light">
          <FiArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl font-light text-rose-200 mb-2">Mis Compras</h1>
          <p className="text-white/60 font-light">Aquí puedes ver el registro de todas tus compras</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-white/70 font-light">Cargando compras...</div>
        ) : error ? (
          <div className="text-center py-12 bg-red-500/10 border border-red-500/30 rounded-2xl">
            <p className="text-red-200 font-light">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white/5 backdrop-blur rounded-2xl border border-rose-300/20">
            <FiBox className="w-12 h-12 mx-auto mb-4 text-white/50" />
            <p className="text-white/60 font-light mb-4">No tienes compras aún</p>
            <Link
              href="/productos"
              className="inline-block px-6 py-2 bg-gradient-to-r from-rose-300 to-rose-400 text-[#0b0b10] rounded-full font-light hover:from-rose-200 hover:to-rose-300 transition"
            >
              Comenzar a comprar
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block bg-white/5 backdrop-blur border border-rose-300/20 rounded-2xl p-6 hover:bg-white/10 hover:border-rose-300/30 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-light text-rose-200">Pedido #{order.id?.slice(0, 8).toUpperCase()}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-light border ${getStatusColor(order.status)}`}>
                        {order.status || 'Pendiente'}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-white/70 font-light">
                      <div className="flex items-center gap-2">
                        <FiCalendar className="w-4 h-4" />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiBox className="w-4 h-4" />
                        <span>{order.items?.length || 0} producto(s)</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end mb-2">
                      <FiDollarSign className="w-4 h-4 text-rose-200" />
                      <p className="text-2xl font-light text-rose-200">{formatCurrency(order.totalAmount)}</p>
                    </div>
                    <p className="text-xs text-white/50 font-light">Haz clic para ver detalles</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
