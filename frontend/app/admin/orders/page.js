'use client';

import { useEffect, useState } from 'react';
import { shippingAPI } from '@/lib/apiClient';
import { FiPackage, FiTruck, FiCheckCircle, FiClock } from 'react-icons/fi';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await shippingAPI.getAdminOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTracking = async (orderId) => {
    try {
      const response = await shippingAPI.generateTrackingNumber(orderId);
      alert(`Número de Guía: ${response.data.trackingNumber}`);
      fetchOrders();
    } catch (error) {
      console.error('Error generating tracking:', error);
      alert('Error al generar número de guía');
    }
  };

  const handleMarkAsDelivered = async (orderId, trackingNumber) => {
    try {
      await shippingAPI.markAsDelivered({ orderId, trackingNumber });
      alert('Pedido marcado como recibido');
      fetchOrders();
    } catch (error) {
      console.error('Error marking as delivered:', error);
      alert('Error al marcar como recibido');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      preparando: { color: 'bg-yellow-100 text-yellow-800', icon: FiClock, label: '📦 Preparando' },
      enviado: { color: 'bg-blue-100 text-blue-800', icon: FiTruck, label: '🚚 Enviado' },
      recibido: { color: 'bg-green-100 text-green-800', icon: FiCheckCircle, label: '✅ Recibido' },
    };

    const config = statusConfig[status] || statusConfig.preparando;
    return <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.color}`}>{config.label}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">📋 Gestión de Pedidos</h1>

        {loading ? (
          <div className="text-center py-12">Cargando pedidos...</div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Orden #{order.id}</h3>
                      <p className="text-sm text-gray-600">{order.full_name} ({order.email})</p>
                    </div>
                    {getStatusBadge(order.order_status)}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Monto Total</p>
                      <p className="font-bold text-lg">${parseFloat(order.total_amount).toLocaleString('es-CO')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Método de Pago</p>
                      <p className="font-bold">{order.payment_method}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Número de Guía</p>
                      <p className="font-bold">{order.tracking_number || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fecha</p>
                      <p className="font-bold">{new Date(order.created_at).toLocaleDateString('es-CO')}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-bold text-gray-900 mb-2">Productos:</h4>
                    <ul className="space-y-2">
                      {order.items?.map((item, idx) => (
                        <li key={idx} className="text-sm text-gray-700">
                          • {item.product_name} x{item.quantity} - ${parseFloat(item.price).toLocaleString('es-CO')}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-4 flex-wrap">
                    {order.order_status === 'preparando' && (
                      <button
                        onClick={() => handleGenerateTracking(order.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
                      >
                        🚚 Generar Guía y Enviar
                      </button>
                    )}

                    {order.order_status === 'enviado' && (
                      <button
                        onClick={() => handleMarkAsDelivered(order.id, order.tracking_number)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
                      >
                        ✅ Marcar como Recibido
                      </button>
                    )}

                    {order.tracking_number && (
                      <span className="text-sm bg-gray-100 px-4 py-2 rounded-lg text-gray-700">
                        Guía: {order.tracking_number}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
