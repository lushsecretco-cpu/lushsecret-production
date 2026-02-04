'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store';
import { paymentsAPI, shippingAPI } from '@/lib/apiClient';
import { FiPackage, FiTruck, FiCheckCircle, FiClock } from 'react-icons/fi';

export default function MyOrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await paymentsAPI.getUserOrders(user.id);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      preparando: {
        label: '📦 Preparando Pedido',
        description: 'Tu pedido está siendo preparado',
        color: 'bg-yellow-50 border-yellow-200',
        badge: 'bg-yellow-100 text-yellow-800',
        icon: FiClock,
      },
      enviado: {
        label: '🚚 En Camino',
        description: 'Tu pedido está en camino',
        color: 'bg-blue-50 border-blue-200',
        badge: 'bg-blue-100 text-blue-800',
        icon: FiTruck,
      },
      recibido: {
        label: '✅ Entregado',
        description: 'Tu pedido ha sido entregado',
        color: 'bg-green-50 border-green-200',
        badge: 'bg-green-100 text-green-800',
        icon: FiCheckCircle,
      },
    };

    return statusMap[status] || statusMap.preparando;
  };

  const handleTrackShipment = async (trackingNumber) => {
    try {
      const response = await shippingAPI.trackShipment(trackingNumber);
      setSelectedOrder(response.data);
    } catch (error) {
      console.error('Error tracking shipment:', error);
      alert('Error al rastrear el envío');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b0b10] via-[#1a0a15] to-[#0b0b10] p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-white/70 font-light">Por favor inicia sesión para ver tus pedidos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0b10] via-[#1a0a15] to-[#0b0b10] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-light text-rose-200 mb-2">Mis Pedidos</h1>
        <p className="text-white/60 mb-8 font-light">Aquí puedes ver el estado y rastrear tus compras</p>

        {loading ? (
          <div className="text-center py-12 text-white/70 font-light">Cargando tus pedidos...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white/5 backdrop-blur rounded-2xl border border-rose-300/20">
            <p className="text-lg text-white/60 font-light">No tienes pedidos aún</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.order_status);
              return (
                <div key={order.id} className="border border-rose-300/20 rounded-2xl p-6 bg-white/5 backdrop-blur">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-light text-rose-200">Orden #{order.id}</h3>
                      <p className="text-sm text-white/60 font-light">
                        Realizada: {new Date(order.created_at).toLocaleDateString('es-CO')}
                      </p>
                    </div>
                    <span className="px-4 py-2 rounded-full font-light text-[#0b0b10] bg-gradient-to-r from-rose-300 to-rose-200">{statusInfo.label}</span>
                  </div>

                  {/* Estado del envío */}
                  <div className="mb-6 p-4 bg-white/5 rounded-lg border border-rose-300/20">
                    <p className="text-sm font-light text-rose-200 mb-2">Estado del Envío:</p>
                    <div className="flex items-center gap-2">
                      <statusInfo.icon className="w-5 h-5 text-rose-200" />
                      <p className="font-light text-white">{statusInfo.description}</p>
                    </div>

                    {order.tracking_number && (
                      <div className="mt-3">
                        <p className="text-sm text-white/60 font-light">Número de Guía:</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg font-mono font-light text-rose-300">{order.tracking_number}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(order.tracking_number);
                              alert('Número de guía copiado al portapapeles');
                            }}
                            className="text-sm bg-rose-300/20 text-rose-200 px-3 py-1 rounded hover:bg-rose-300/30 transition font-light"
                          >
                            Copiar
                          </button>
                        </div>
                      </div>
                    )}

                    {order.shipping_date && (
                      <p className="text-sm text-white/60 mt-3 font-light">
                        📤 Enviado: {new Date(order.shipping_date).toLocaleDateString('es-CO')}
                      </p>
                    )}

                    {order.delivery_date && (
                      <p className="text-sm text-white/60 mt-1 font-light">
                        📦 Entregado: {new Date(order.delivery_date).toLocaleDateString('es-CO')}
                      </p>
                    )}
                  </div>

                  {/* Detalles de productos */}
                  <div className="mb-6">
                    <h4 className="font-light text-rose-200 mb-3">Productos:</h4>
                    <div className="space-y-2">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm text-white/70 p-2 bg-white/5 rounded font-light">
                          <span>{item.product_name} x{item.quantity}</span>
                          <span className="text-rose-200">${parseFloat(item.price).toLocaleString('es-CO')}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resumen de precios */}
                  <div className="border-t border-rose-300/20 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-light text-white">Total:</span>
                      <span className="text-2xl font-light text-rose-200">
                        ${parseFloat(order.total_amount).toLocaleString('es-CO')}
                      </span>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  {order.tracking_number && (
                    <div className="mt-6 pt-4 border-t border-rose-300/20">
                      <button
                        onClick={() => handleTrackShipment(order.tracking_number)}
                        className="w-full bg-gradient-to-r from-rose-300 to-rose-400 text-[#0b0b10] px-4 py-2 rounded-lg hover:from-rose-200 hover:to-rose-300 transition font-light shadow-lg shadow-rose-300/50"
                      >
                        🗺️ Ver Detalles de Rastreo
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de rastreo */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white/5 backdrop-blur border border-rose-300/20 rounded-2xl p-8 max-w-md w-full text-white">
            <h2 className="text-2xl font-light text-rose-200 mb-4">📍 Detalles de Rastreo</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-white/60 font-light">Número de Guía</p>
                <p className="font-light text-lg text-rose-200">{selectedOrder.tracking_number}</p>
              </div>
              <div>
                <p className="text-sm text-white/60 font-light">Estado</p>
                <p className="font-light text-lg text-rose-200">{selectedOrder.order_status.toUpperCase()}</p>
              </div>
              {selectedOrder.shipping_date && (
                <div>
                  <p className="text-sm text-white/60 font-light">Fecha de Envío</p>
                  <p className="font-light">{new Date(selectedOrder.shipping_date).toLocaleDateString('es-CO')}</p>
                </div>
              )}
              {selectedOrder.delivery_date && (
                <div>
                  <p className="text-sm text-white/60 font-light">Fecha de Entrega</p>
                  <p className="font-light">{new Date(selectedOrder.delivery_date).toLocaleDateString('es-CO')}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full mt-6 bg-rose-300/20 text-rose-200 px-4 py-2 rounded-lg hover:bg-rose-300/30 transition font-light"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
