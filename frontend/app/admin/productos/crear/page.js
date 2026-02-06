'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store';
import { categoriesAPI, productsAPI } from '@/lib/apiClient';
import { FiArrowLeft } from 'react-icons/fi';

export default function CrearProductoPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuthStore();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    main_image_url: '',
    sizes: [],
  });
  const [newSize, setNewSize] = useState({ size: '', stock: '' });

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

  const addSize = () => {
    if (!newSize.size || !newSize.stock) {
      alert('Por favor completa talla y stock');
      return;
    }
    setForm((prev) => ({
      ...prev,
      sizes: [...prev.sizes, { ...newSize }],
    }));
    setNewSize({ size: '', stock: '' });
  };

  const removeSize = (index) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index),
    }));
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

      await productsAPI.create(data);
      alert('Producto creado correctamente');
      router.push('/admin/productos');
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Error al crear el producto: ' + (error.response?.data?.message || error.message));
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

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        .admin-input {
          background-color: #ffffff !important;
          color: #000000 !important;
          border-color: #e5e7eb !important;
        }
        .admin-input:focus {
          background-color: #ffffff !important;
          color: #000000 !important;
          border-color: #ec4899 !important;
          box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1) !important;
        }
        .admin-input::placeholder {
          color: #9ca3af !important;
        }
        .admin-textarea {
          background-color: #ffffff !important;
          color: #000000 !important;
          border-color: #e5e7eb !important;
        }
        .admin-textarea:focus {
          background-color: #ffffff !important;
          color: #000000 !important;
          border-color: #ec4899 !important;
          box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1) !important;
        }
        .admin-textarea::placeholder {
          color: #9ca3af !important;
        }
        .admin-select {
          background-color: #ffffff !important;
          color: #000000 !important;
          border-color: #e5e7eb !important;
        }
        .admin-select:focus {
          background-color: #ffffff !important;
          color: #000000 !important;
          border-color: #ec4899 !important;
          box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1) !important;
        }
      `}</style>
      <div className="container py-12 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/productos" className="text-brand-600 hover:text-brand-700">
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Crear Producto</h1>
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
                className="admin-input w-full px-4 py-2 border rounded-lg focus:outline-none"
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
                className="admin-input w-full px-4 py-2 border rounded-lg focus:outline-none"
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
                className="admin-textarea w-full px-4 py-2 border rounded-lg focus:outline-none"
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Categoría *</label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                className="admin-select w-full px-4 py-2 border rounded-lg focus:outline-none"
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
                  className="admin-input w-full px-4 py-2 border rounded-lg focus:outline-none"
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
                  className="admin-input w-full px-4 py-2 border rounded-lg focus:outline-none"
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
                className="admin-input w-full px-4 py-2 border rounded-lg focus:outline-none"
              />
            </div>

            {/* Tallas */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Tallas</label>
              <div className="space-y-2 mb-3">
                {form.sizes.map((size, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg">
                    <span className="flex-1">
                      <strong>{size.size}</strong> - Stock: {size.stock}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSize(index)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSize.size}
                  onChange={(e) => setNewSize((prev) => ({ ...prev, size: e.target.value }))}
                  placeholder="Ej: S, M, L, XL"
                  className="admin-input flex-1 px-4 py-2 border rounded-lg focus:outline-none"
                />
                <input
                  type="number"
                  value={newSize.stock}
                  onChange={(e) => setNewSize((prev) => ({ ...prev, stock: e.target.value }))}
                  placeholder="Stock"
                  className="admin-input w-24 px-4 py-2 border rounded-lg focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addSize}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600"
                >
                  Agregar
                </button>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-brand-600 text-white py-2 rounded-lg font-semibold hover:bg-brand-700 disabled:bg-gray-400"
              >
                {loading ? 'Creando...' : 'Crear Producto'}
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
