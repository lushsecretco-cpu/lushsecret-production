'use client';

import { useEffect, useState } from 'react';
import { categoriesAPI, productsAPI } from '@/lib/apiClient';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export default function LubAndCarePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const categoryName = 'Lub & Care';

  const sampleProducts = [
    {
      id: 1,
      name: 'Lubricante Base Agua Premium',
      price: 28000,
      description: 'Lubricante de alta calidad base agua, hipoalergénico, seguro para juguetes',
      main_image_url: 'https://images.unsplash.com/photo-1631987151857-2c10b41dc047?w=500&h=500&fit=crop',
      stock: 30,
    },
    {
      id: 2,
      name: 'Gel Limpiador Íntimo',
      price: 22000,
      description: 'Gel limpiador específico para juguetes y cuidado íntimo, pH equilibrado',
      main_image_url: 'https://images.unsplash.com/photo-1631987151857-2c10b41dc047?w=500&h=500&fit=crop',
      stock: 25,
    },
    {
      id: 3,
      name: 'Toallitas Refrescantes',
      price: 18000,
      description: 'Toallitas íntimas refrescantes, empaques discretos de 10 unidades',
      main_image_url: 'https://images.unsplash.com/photo-1631987151857-2c10b41dc047?w=500&h=500&fit=crop',
      stock: 40,
    },
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const categoriesResponse = await categoriesAPI.getAll();
      const category = categoriesResponse.data.find(
        cat => cat.name.toLowerCase().includes('lub') || cat.name.toLowerCase().includes('care')
      );
      
      if (category) {
        const productsResponse = await productsAPI.getAll({ categoryId: category.id });
        if (productsResponse.data && productsResponse.data.length > 0) {
          setProducts(productsResponse.data);
        } else {
          setProducts(sampleProducts);
        }
      } else {
        setProducts(sampleProducts);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts(sampleProducts);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b10] flex items-center justify-center">
        <div className="text-rose-300/70 text-lg font-light">Cargando productos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b10] text-white py-8">
      <div className="container mx-auto px-4">
        <Link
          href="/productos"
          className="inline-flex items-center space-x-2 text-rose-300/70 hover:text-rose-300 transition-colors mb-6 font-light"
        >
          <FiArrowLeft size={18} />
          <span>Volver a productos</span>
        </Link>

        <h1 className="text-3xl md:text-4xl font-light text-rose-300 mb-2">{categoryName}</h1>
        <p className="text-white/60 font-light mb-8">
          Descubre nuestra colección de {categoryName.toLowerCase()}
        </p>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/50 font-light">No hay productos disponibles en esta categoría</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
