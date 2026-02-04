'use client';

import { useState } from 'react';
import { shippingAPI } from '@/lib/apiClient';
import { FiTruck, FiCheckCircle, FiClock, FiSearch } from 'react-icons/fi';

export default function TrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copyStatus, setCopyStatus] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      setError('Por favor ingresa un número de guía');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await shippingAPI.trackShipment(trackingNumber);
      setShipment(response.data);
    } catch (err) {
      setError('Número de guía no encontrado');
      setShipment(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status) => {
    const steps = ['preparando', 'enviado', 'recibido'];
    return steps.indexOf(status) + 1;
  };

  const getStatusLabel = (status) => {
    const labels = {
      preparando: 'Preparando Pedido',
      enviado: 'En Camino',
      recibido: 'Entregado',
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status) => {
    const icons = {
      preparando: <FiClock className="w-6 h-6" />,
      enviado: <FiTruck className="w-6 h-6" />,
      recibido: <FiCheckCircle className="w-6 h-6" />,
    };
    return icons[status] || icons.preparando;
  };

  const buildTrackingUrl = (data) => {
    if (data?.tracking_url) return data.tracking_url;

    const carrier = (data?.carrier || '').toLowerCase();
    const carrierMap = {
      servientrega: 'https://www.servientrega.com/wps/portal/rastreo-envio',
      coordinadora: 'https://coordinadora.com/rastreo/rastreo-de-guia/',
      interrapidisimo: 'https://interrapidisimo.com/sigue-tu-envio/',
      'inter rapidisimo': 'https://interrapidisimo.com/sigue-tu-envio/',
      '4-72': 'https://www.4-72.com.co/rastreo',
      envia: 'https://envia.co/',
      tcc: 'https://www.tcc.com.co/rastreo/',
      dhl: 'https://www.dhl.com/co-es/home/rastreo.html',
      fedex: 'https://www.fedex.com/es-co/tracking.html',
      ups: 'https://www.ups.com/track?loc=es_CO',
      'x-cargo': 'https://x-cargo.co/',
      xcargo: 'https://x-cargo.co/',
    };

    const matchedKey = Object.keys(carrierMap).find((key) => carrier.includes(key));
    if (matchedKey) return carrierMap[matchedKey];

    if (carrier) {
      return `https://www.google.com/search?q=${encodeURIComponent(`${carrier} rastreo`)}`;
    }

    return 'https://www.google.com/search?q=seguimiento+de+envio';
  };

  const handleGuideClick = async () => {
    const guide = shipment?.tracking_number || shipment?.guide_number;
    if (!guide) return;

    try {
      await navigator.clipboard.writeText(guide);
      setCopyStatus('Guía copiada. Abriendo sitio de la transportadora...');
    } catch (err) {
      setCopyStatus('No se pudo copiar la guía, pero abriremos el sitio de la transportadora.');
    }

    const url = buildTrackingUrl(shipment);
    if (url) {
      setTimeout(() => {
        window.open(url, '_blank', 'noopener,noreferrer');
      }, 300);
    }

    setTimeout(() => setCopyStatus(''), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0b10] via-[#1a0a15] to-[#0b0b10] p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 text-white">
          <h1 className="text-5xl font-light mb-3 text-rose-200">🚚 Rastrear tu Envío</h1>
          <p className="text-lg text-white/60 font-light">Ingresa tu número de guía para ver el estado de tu compra</p>
        </div>

        {/* Search Form */}
        <div className="bg-white/5 backdrop-blur rounded-2xl border border-rose-300/20 shadow-2xl p-8 mb-8">
          <form onSubmit={handleTrack} className="flex gap-3">
            <input
              type="text"
              placeholder="Ej: LSH-1234567890-ABC123"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="flex-1 px-4 py-3 border border-rose-300/30 rounded-lg focus:outline-none focus:border-rose-300 bg-white/5 text-white placeholder:text-white/40 font-light"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-rose-300 to-rose-400 text-[#0b0b10] px-6 py-3 rounded-lg hover:from-rose-200 hover:to-rose-300 transition font-light flex items-center gap-2 disabled:bg-white/20 disabled:text-white/50 shadow-lg shadow-rose-300/50"
            >
              <FiSearch className="w-5 h-5" />
              {loading ? 'Rastreando...' : 'Rastrear'}
            </button>
          </form>

          {error && <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg font-light text-sm">{error}</div>}
        </div>

        {/* Tracking Result */}
        {shipment && (
          <div className="bg-white/5 backdrop-blur rounded-2xl border border-rose-300/20 shadow-2xl p-8">
            {/* Order Info */}
            <div className="mb-8 pb-8 border-b border-rose-300/20">
              <h2 className="text-2xl font-light text-rose-200 mb-4">Orden #{shipment.id}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-white/60 font-light">Cliente</p>
                  <p className="font-light text-white">{shipment.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-white/60 font-light">Email</p>
                  <p className="font-light text-white">{shipment.email}</p>
                </div>
                <div>
                  <p className="text-sm text-white/60 font-light">Número de Guía</p>
                  <button
                    type="button"
                    onClick={handleGuideClick}
                    className="font-mono font-light text-rose-300 text-lg hover:text-rose-200 transition"
                    title="Copiar guía y abrir rastreo"
                  >
                    {shipment.tracking_number || shipment.guide_number}
                  </button>
                  {copyStatus && <p className="text-xs text-rose-300 mt-1 font-light">{copyStatus}</p>}
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="mb-8">
              <h3 className="text-xl font-light text-rose-200 mb-6">Estado del Envío</h3>

              {/* Timeline Steps */}
              <div className="space-y-6">
                {/* Step 1: Preparando */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-light text-white ${
                        getStatusStep(shipment.order_status) >= 1 ? 'bg-gradient-to-br from-rose-300 to-rose-400' : 'bg-white/10'
                      }`}
                    >
                      ✓
                    </div>
                    {getStatusStep(shipment.order_status) > 1 && (
                      <div className="w-1 h-12 bg-gradient-to-b from-rose-300 to-rose-400 my-2"></div>
                    )}
                  </div>
                  <div className="py-2">
                    <p className="font-light text-rose-200">Pedido Preparado</p>
                    <p className="text-sm text-white/60 font-light">Tu pedido ha sido preparado en nuestro almacén</p>
                  </div>
                </div>

                {/* Step 2: Enviado */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-light text-white ${
                        getStatusStep(shipment.order_status) >= 2 ? 'bg-gradient-to-br from-rose-300 to-rose-400' : 'bg-white/10'
                      }`}
                    >
                      {getStatusStep(shipment.order_status) >= 2 ? '✓' : '2'}
                    </div>
                    {getStatusStep(shipment.order_status) > 2 && (
                      <div className="w-1 h-12 bg-gradient-to-b from-rose-300 to-rose-400 my-2"></div>
                    )}
                  </div>
                  <div className="py-2">
                    <p className="font-light text-rose-200">En Camino</p>
                    <p className="text-sm text-white/60 font-light">
                      {shipment.shipping_date
                        ? `Enviado el ${new Date(shipment.shipping_date).toLocaleDateString('es-CO')}`
                        : 'Pendiente de envío'}
                    </p>
                  </div>
                </div>

                {/* Step 3: Recibido */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-light text-white ${
                        getStatusStep(shipment.order_status) >= 3 ? 'bg-gradient-to-br from-rose-300 to-rose-400' : 'bg-white/10'
                      }`}
                    >
                      {getStatusStep(shipment.order_status) >= 3 ? '✓' : '3'}
                    </div>
                  </div>
                  <div className="py-2">
                    <p className="font-light text-rose-200">Entregado</p>
                    <p className="text-sm text-white/60 font-light">
                      {shipment.delivery_date
                        ? `Entregado el ${new Date(shipment.delivery_date).toLocaleDateString('es-CO')}`
                        : 'Pendiente de entrega'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="border-t border-rose-300/20 pt-6">
              <h3 className="text-xl font-light text-rose-200 mb-4">Productos</h3>
              <div className="space-y-3">
                {shipment.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-rose-300/20"
                  >
                    <div>
                      <p className="font-light text-white">{item.product_name}</p>
                      <p className="text-sm text-white/60 font-light">Cantidad: {item.quantity}</p>
                    </div>
                    <div className="text-rose-200">{getStatusIcon(shipment.order_status)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Status Badge */}
            <div className="mt-8 p-4 bg-gradient-to-r from-rose-300/10 to-rose-200/10 rounded-lg border border-rose-300/20">
              <p className="text-sm text-white/60 mb-2 font-light">Estado Actual</p>
              <div className="flex items-center gap-3">
                <div className="text-3xl text-rose-300">{getStatusIcon(shipment.order_status)}</div>
                <div>
                  <p className="text-2xl font-light text-rose-200">{getStatusLabel(shipment.order_status)}</p>
                  <p className="text-sm text-white/60 font-light">Última actualización: {new Date().toLocaleDateString('es-CO')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-white/5 backdrop-blur rounded-2xl border border-rose-300/20 shadow-lg p-6 text-white">
          <h3 className="font-light text-lg text-rose-200 mb-3">💡 ¿Necesitas Ayuda?</h3>
          <p className="text-sm mb-4 text-white/70 font-light">
            Si no encuentras tu número de guía o tienes algún problema con tu envío, por favor contacta a nuestro equipo de soporte.
          </p>
          <p className="text-sm text-white/70 font-light">
            📧 <a href="mailto:soporte@lushsecret.com" className="text-rose-300 hover:text-rose-200 transition">soporte@lushsecret.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
