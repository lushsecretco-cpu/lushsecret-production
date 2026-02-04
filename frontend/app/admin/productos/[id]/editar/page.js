'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store';
import { categoriesAPI, productsAPI } from '@/lib/apiClient';
import { FiArrowLeft } from 'react-icons/fi';

export default function EditarProductoPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAdmin } = useAuthStore();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    main_image_url: '',
  });

  // Cargar categorías
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoriesAPI.getAll();
        setCategories(response.data || []);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    loadCategories();
  }, []);

  // Cargar producto
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await productsAPI.getById(params.id);
        const product = response.data;
        setForm({
          name: product.name || '',
          slug: product.slug || '',
          description: product.description || '',
          price: product.price || '',
          stock: product.stock || '',
          category_id: product.category_id || '',
          main_image_url: product.main_image_url || '',
        });
      } catch (error) {
        console.error('Error loading product:', error);
        alert('Error al cargar el producto');
        router.push('/admin/productos');
      } finally {
        setFetching(false);
      }
    };

    if (params.id) {
      loadProduct();
    }
  }, [params.id, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Auto-generate slug from name
    if (name === 'name') {
      const slug = value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      setForm((prev) => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.category_id || !form.price || !form.stock) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setLoading(true);
      const data = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        category_id: Number(form.category_id),
      };

      await productsAPI.update(params.id, data);
      alert('Producto actualizado correctamente');
      router.push('/admin/productos');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error al actualizar el producto: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (!user || !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Acceso denegado</p>
      </div>
    );
  }

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando producto...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-12 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/productos" className="text-brand-600 hover:text-brand-700">
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Editar Producto</h1>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Nombre *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ej: Vibrador Recargable"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-600"
                required
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Slug *</label>
              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="vibrador-recargable"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-600"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Se genera automáticamente desde el nombre</p>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Descripción</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe el producto en detalle..."
                rows="4"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-600"
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Categoría *</label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-600"
                required
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Precio */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Precio (COP) *</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="45000"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Stock *</label>
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="10"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-600"
                  required
                />
              </div>
            </div>

            {/* Imagen */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">URL Imagen</label>
              <input
                type="url"
                name="main_image_url"
                value={form.main_image_url}
                onChange={handleChange}
                placeholder="https://via.placeholder.com/500x500"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-600"
              />
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-brand-600 text-white py-2 rounded-lg font-semibold hover:bg-brand-700 disabled:bg-gray-400"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <Link
                href="/admin/productos"
                className="flex-1 bg-gray-200 text-gray-900 py-2 rounded-lg font-semibold hover:bg-gray-300 text-center"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
