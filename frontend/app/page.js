'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { categoriesAPI, productsAPI } from '@/lib/apiClient';
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [categoriesRes, productsRes] = await Promise.all([
          categoriesAPI.getAll(),
          productsAPI.getAll({ limit: 8 }),
        ]);
        setCategories(categoriesRes.data || []);
        setProducts(productsRes.data || []);
      } catch (error) {
        console.error('Error loading home data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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
    <div className="bg-[#0b0b10] text-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0b0b10] via-[#1a0a15] to-[#0b0b10] text-white">
        <div className="container py-12 sm:py-16 lg:py-20 grid md:grid-cols-2 gap-6 sm:gap-10 items-center">
          <div className="space-y-4 sm:space-y-6">
            <p className="text-xs sm:text-sm uppercase tracking-[0.35em] text-rose-200/80">LushSecret</p>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-light leading-tight luxury-title">
              Explora placer, estilo y discreción en un solo lugar.
            </h1>
            <p className="text-sm sm:text-base text-white/80">
              Productos seleccionados, envíos discretos y pagos seguros. Vive la experiencia LushSecret.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                href="/productos"
                className="text-center btn-luxury rounded-full"
              >
                Ver catálogo
              </Link>
              <Link
                href="/tracking"
                className="text-center btn-luxury-outline rounded-full"
              >
                Rastrear pedido
              </Link>
            </div>
          </div>
          <div className="hidden md:block card-luxury rounded-3xl p-8 shadow-xl">
            <h2 className="text-lg sm:text-xl font-light text-rose-200 mb-4">Compra segura y discreta</h2>
            <ul className="space-y-3 text-white/80 text-sm sm:text-base font-light">
              <li><span className="text-rose-200">✓</span> Paquetes sin logos ni etiquetas visibles</li>
              <li><span className="text-rose-200">✓</span> Métodos de pago flexibles</li>
              <li><span className="text-rose-200">✓</span> Atención personalizada</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Mobile Benefits */}
      <div className="md:hidden card-luxury rounded-2xl p-6 container mt-6 mb-6">
        <h2 className="text-lg font-light text-rose-200 mb-4">Compra segura y discreta</h2>
        <ul className="space-y-3 text-white/80 text-sm font-light">
          <li><span className="text-rose-200">✓</span> Paquetes sin logos ni etiquetas visibles</li>
          <li><span className="text-rose-200">✓</span> Métodos de pago flexibles</li>
          <li><span className="text-rose-200">✓</span> Atención personalizada</li>
        </ul>
      </div>

      {/* Categories Section */}
      <section className="container py-10 sm:py-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-light text-white">Categorías destacadas</h2>
          <Link href="/productos" className="text-xs sm:text-sm text-rose-200 font-light hover:text-rose-100 transition">Ver todo</Link>
        </div>
        {loading ? (
          <div className="text-center py-8 text-white/70">Cargando categorías...</div>
        ) : (
          <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/productos/${getSlug(category.name)}`}
                className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-rose-300/80 to-rose-200/80 border border-rose-300/40 text-[#0b0b10] shadow-[0_6px_18px_rgba(249,168,212,0.25)] hover:from-rose-200 hover:to-rose-300 hover:border-rose-200 transition group transform hover:scale-105"
              >
                <p className="text-xs text-[#0b0b10]/70 group-hover:text-[#0b0b10] transition">{category.description}</p>
                <h3 className="text-sm sm:text-base font-light text-[#0b0b10] mt-2 transition">{category.name}</h3>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Products Section */}
      <section className="container pb-12 sm:pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-light text-white">Productos destacados</h2>
          <Link href="/productos" className="text-xs sm:text-sm text-rose-200 font-light hover:text-rose-100 transition">Explorar</Link>
        </div>
        {loading ? (
          <div className="text-center py-8 text-white/70">Cargando productos...</div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
