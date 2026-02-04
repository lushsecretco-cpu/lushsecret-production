'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { categoriesAPI, productsAPI } from '@/lib/apiClient';
import ProductCard from '@/components/ProductCard';

export default function ProductsPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAllProducts, setShowAllProducts] = useState(false);

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

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const params = {
          search: search || undefined,
          limit: 50,
        };
        const response = await productsAPI.getAll(params);
        setProducts(response.data || []);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [search]);

  const filteredCategories = useMemo(() => categories, [categories]);

  // Función para convertir nombre a slug
  const getSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/&/g, 'and')
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]/g, '')
      .replace(/\-+/g, '-');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0b10] via-[#1a0a15] to-[#0b0b10] py-12">
      <div className="container">
        <div className="mb-12">
          <h1 className="text-4xl font-light text-rose-200 mb-2">Nuestras Colecciones</h1>
          <p className="text-white/60 font-light">Explora nuestras categorías especiales</p>
        </div>

        {/* Categorías */}
        {filteredCategories.length > 0 && (
          <div className="mb-16">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {filteredCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/productos/${getSlug(category.name)}`}
                  className="group bg-gradient-to-r from-rose-300/80 to-rose-200/80 rounded-2xl p-6 border border-rose-300/40 shadow-[0_6px_18px_rgba(249,168,212,0.25)] hover:from-rose-200 hover:to-rose-300 hover:border-rose-200 transition transform hover:scale-105"
                >
                  <div className="text-[#0b0b10]">
                    <h3 className="text-lg font-light group-hover:text-opacity-80 transition">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-[#0b0b10]/70 mt-2 group-hover:text-opacity-80 transition font-light">
                        {category.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Búsqueda y opción de ver todos */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h2 className="text-3xl font-light text-rose-200">Todos los productos</h2>
              <p className="text-white/60 font-light">Busca entre todos nuestros artículos</p>
            </div>
            <div className="w-full lg:w-auto">
              <input
                type="text"
                placeholder="Buscar producto"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-rose-300/30 rounded-lg bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:border-rose-300 font-light"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-white/70 font-light">Cargando productos...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white/5 backdrop-blur rounded-2xl border border-rose-300/20">
            <p className="text-white/60 font-light">No encontramos productos con esos filtros.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
