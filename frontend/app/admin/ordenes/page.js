'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { ordersAPI } from '@/lib/apiClient';
import { FiArrowLeft, FiEye } from 'react-icons/fi';

export default function OrdenesPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/');
      return;
    }

    const loadOrders = async () => {
      try {
        const response = await ordersAPI.getAll();
        setOrders(response.data || []);
      } catch (error) {
        console.error('Error loading orders:', error);
        alert('Error al cargar las órdenes');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [isAdmin, router]);

  // Filtrar órdenes
  useEffect(() => {
    let filtered = orders;

    if (statusFilter) {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, statusFilter]);

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
      CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Confirmada' },
      SHIPPED: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Enviada' },
      DELIVERED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Entregada' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelada' },
    };

    const style = statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
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

  if (!user || !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Acceso denegado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-brand-600 hover:text-brand-700">
              <FiArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Órdenes</h1>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-600"
          >
            <option value="">Todos los estados</option>
            <option value="PENDING">Pendiente</option>
            <option value="CONFIRMED">Confirmada</option>
            <option value="SHIPPED">Enviada</option>
            <option value="DELIVERED">Entregada</option>
            <option value="CANCELLED">Cancelada</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center text-gray-600">Cargando órdenes...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center text-gray-600">No hay órdenes disponibles</div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">ID Orden</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">#{order.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div>{order.customer_name || 'Sin nombre'}</div>
                        <div className="text-xs text-gray-400">{order.customer_email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {formatCurrency(order.total_amount)}
                      </td>
                      <td className="px-6 py-4 text-sm">{getStatusBadge(order.status)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(order.created_at)}</td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => router.push(`/admin/ordenes/${order.id}`)}
                          className="flex items-center gap-2 text-brand-600 hover:text-brand-700"
                        >
                          <FiEye className="w-4 h-4" />
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
