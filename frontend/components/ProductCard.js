'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store';

export default function ProductCard({ product }) {
  const addItem = useCartStore((state) => state.addItem);

  // Registrar producto visto en historial
  useEffect(() => {
    const registerProductView = () => {
      try {
        const history = JSON.parse(localStorage.getItem('productViewHistory') || '[]');
        
        // Filtrar productos duplicados
        const filtered = history.filter((p) => p.id !== product.id);
        
        // Agregar producto actual al inicio
        const updated = [product, ...filtered].slice(0, 50); // Mantener últimos 50 productos
        
        localStorage.setItem('productViewHistory', JSON.stringify(updated));
      } catch (err) {
        console.error('Error registering product view:', err);
      }
    };

    registerProductView();
  }, [product.id]);

  const handleAdd = () => {
    addItem({
      product_id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.main_image_url,
    });
  };

  return (
    <div className="card-luxury overflow-hidden group">
      <div className="aspect-[4/3] bg-gradient-to-br from-white/5 to-white/10 relative overflow-hidden">
        {product.main_image_url ? (
          <img
            src={product.main_image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">Sin imagen</div>
        )}
      </div>
      <div className="p-5 space-y-3 relative z-10">
        <h3 className="text-lg font-light text-white/95 line-clamp-1 group-hover:text-rose-200 transition">{product.name}</h3>
        <p className="text-sm text-white/50 line-clamp-2 group-hover:text-white/60 transition">{product.description || 'Producto destacado de LushSecret'}</p>
        <div className="flex items-center justify-between pt-2">
          <span className="text-lg font-light text-rose-200">${Number(product.price).toLocaleString('es-CO')}</span>
          <button
            onClick={handleAdd}
            className="btn-luxury text-sm px-4 py-2"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
