'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store';
import { productsAPI } from '@/lib/apiClient';
import { FiEdit, FiTrash2, FiPlus, FiArrowLeft } from 'react-icons/fi';

export default function ProductosAdminPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuthStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Proteger ruta
    if (!user && typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (!stored) {
        router.push('/auth');
        return;
      }
    }
  }, [user, router]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await productsAPI.getAll({ limit: 100 });
        setProducts(response.data || []);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      return;
    }

    try {
      await productsAPI.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      alert('Producto eliminado correctamente');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error al eliminar el producto');
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Productos</h1>
          </div>
          <Link
            href="/admin/productos/crear"
            className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-700"
          >
            <FiPlus className="w-5 h-5" /> Nuevo Producto
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">Cargando productos...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl">
            <p className="text-gray-600">No hay productos aún</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nombre</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Categoría</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Precio</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Stock</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Vistas</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{product.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.category_name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ${Number(product.price).toLocaleString('es-CO')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          product.stock > 10 ? 'bg-green-100 text-green-800' : 
                          product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {product.stock} unidades
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.views || 0}</td>
                      <td className="px-6 py-4 text-sm flex gap-2">
                        <Link
                          href={`/admin/productos/${product.id}/editar`}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          <FiEdit className="w-4 h-4" /> Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 font-semibold"
                        >
                          <FiTrash2 className="w-4 h-4" /> Eliminar
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
