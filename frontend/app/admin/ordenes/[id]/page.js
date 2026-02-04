'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store';
import { ordersAPI } from '@/lib/apiClient';
import { FiArrowLeft } from 'react-icons/fi';

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAdmin } = useAuthStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/');
      return;
    }

    const loadOrder = async () => {
      try {
        const response = await ordersAPI.getById(params.id);
        setOrder(response.data);
        setNewStatus(response.data.status);
      } catch (error) {
        console.error('Error loading order:', error);
        alert('Error al cargar la orden');
        router.push('/admin/ordenes');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadOrder();
    }
  }, [params.id, router, isAdmin]);

  const handleStatusUpdate = async () => {
    if (newStatus === order.status) {
      alert('Selecciona un estado diferente');
      return;
    }

    try {
      setUpdateLoading(true);
      await ordersAPI.updateStatus(params.id, newStatus);
      setOrder((prev) => ({ ...prev, status: newStatus }));
      alert('Estado actualizado correctamente');
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error al actualizar el estado');
    } finally {
      setUpdateLoading(false);
    }
  };

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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando orden...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Orden no encontrada</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-12 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/ordenes" className="text-brand-600 hover:text-brand-700">
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Orden #{order.id}</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Información del Cliente */}
          <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Cliente</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Nombre</p>
                <p className="text-sm font-medium text-gray-900">{order.customer_name || 'Sin nombre'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Correo</p>
                <p className="text-sm font-medium text-gray-900">{order.customer_email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Teléfono</p>
                <p className="text-sm font-medium text-gray-900">{order.customer_phone || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Dirección</p>
                <p className="text-sm font-medium text-gray-900">{order.shipping_address?.full_address || 'No especificada'}</p>
              </div>
            </div>
          </div>

          {/* Resumen de Orden */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Fecha</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(order.created_at)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Estado</p>
                <div className="mt-1">{getStatusBadge(order.status)}</div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-lg font-bold text-brand-600">{formatCurrency(order.total_amount)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Método de Pago</p>
                <p className="text-sm font-medium text-gray-900">{order.payment_method || 'No especificado'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Productos */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Productos</h2>
          <div className="space-y-4">
            {order.items && order.items.length > 0 ? (
              order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center pb-4 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{item.product_name}</p>
                    <p className="text-xs text-gray-500">Cantidad: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                    <p className="text-xs text-gray-500">${item.price.toLocaleString('es-CO')} c/u</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Sin productos</p>
            )}
          </div>
        </div>

        {/* Actualizar Estado */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actualizar Estado</h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Nuevo estado</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-600"
              >
                <option value="PENDING">Pendiente</option>
                <option value="CONFIRMED">Confirmada</option>
                <option value="SHIPPED">Enviada</option>
                <option value="DELIVERED">Entregada</option>
                <option value="CANCELLED">Cancelada</option>
              </select>
            </div>
            <button
              onClick={handleStatusUpdate}
              disabled={updateLoading || newStatus === order.status}
              className="bg-brand-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-700 disabled:bg-gray-400"
            >
              {updateLoading ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
