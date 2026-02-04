'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { productsAPI } from '@/lib/apiClient';
import ProductCard from '@/components/ProductCard';
import { FiArrowLeft, FiTrash2 } from 'react-icons/fi';

export default function HistorialPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [viewedProducts, setViewedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }

    // Cargar historial desde localStorage
    setLoading(true);
    try {
      const historial = JSON.parse(localStorage.getItem('productViewHistory') || '[]');
      setViewedProducts(historial);
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  }, [user, router]);

  const clearHistory = () => {
    if (confirm('¿Estás seguro de que deseas limpiar tu historial?')) {
      localStorage.removeItem('productViewHistory');
      setViewedProducts([]);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0b10] via-[#1a0a15] to-[#0b0b10] py-12">
      <div className="container">
        <Link href="/" className="flex items-center gap-2 text-rose-200 hover:text-rose-300 mb-8 transition font-light">
          <FiArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light text-rose-200 mb-2">Historial de Visualización</h1>
            <p className="text-white/60 font-light">Productos que has visto recientemente</p>
          </div>
          {viewedProducts.length > 0 && (
            <button
              onClick={clearHistory}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-200 rounded-lg hover:bg-red-500/30 transition font-light text-sm"
            >
              <FiTrash2 className="w-4 h-4" />
              Limpiar historial
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12 text-white/70 font-light">Cargando historial...</div>
        ) : viewedProducts.length === 0 ? (
          <div className="text-center py-12 bg-white/5 backdrop-blur rounded-2xl border border-rose-300/20">
            <p className="text-white/60 font-light mb-4">No has visto productos aún</p>
            <Link
              href="/productos"
              className="inline-block px-6 py-2 bg-gradient-to-r from-rose-300 to-rose-400 text-[#0b0b10] rounded-full font-light hover:from-rose-200 hover:to-rose-300 transition"
            >
              Explorar productos
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {viewedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
