'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { categoriesAPI, productsAPI } from '@/lib/apiClient';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = params.categorySlug;
  
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  useEffect(() => {
    const loadCategoryAndProducts = async () => {
      try {
        setLoading(true);
        
        // Obtener todas las categorías y buscar por slug
        const categoriesResponse = await categoriesAPI.getAll();
        const foundCategory = categoriesResponse.data.find(
          (cat) => getSlug(cat.name) === categorySlug
        );
        
        if (!foundCategory) {
          setError('Categoría no encontrada');
          return;
        }
        
        setCategory(foundCategory);
        
        // Obtener productos de esa categoría
        const productsResponse = await productsAPI.getAll({
          categoryId: foundCategory.id,
          limit: 50,
        });
        setProducts(productsResponse.data || []);
      } catch (err) {
        console.error('Error loading category:', err);
        setError('Error al cargar la categoría');
      } finally {
        setLoading(false);
      }
    };

    if (categorySlug) {
      loadCategoryAndProducts();
    }
  }, [categorySlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b0b10] via-[#1a0a15] to-[#0b0b10] p-8 flex items-center justify-center">
        <p className="text-white/70 font-light">Cargando categoría...</p>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b0b10] via-[#1a0a15] to-[#0b0b10] p-8">
        <div className="container max-w-4xl mx-auto">
          <Link href="/" className="flex items-center gap-2 text-rose-200 hover:text-rose-300 mb-8 transition font-light">
            <FiArrowLeft className="w-4 h-4" />
            Volver atrás
          </Link>
          <div className="text-center py-12">
            <p className="text-white/60 font-light">{error || 'Categoría no encontrada'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0b10] via-[#1a0a15] to-[#0b0b10] py-12">
      <div className="container">
        <Link href="/" className="flex items-center gap-2 text-rose-200 hover:text-rose-300 mb-8 transition font-light">
          <FiArrowLeft className="w-4 h-4" />
          Volver atrás
        </Link>

        <div className="mb-10">
          <h1 className="text-4xl font-light text-rose-200 mb-2">{category.name}</h1>
          {category.description && (
            <p className="text-white/70 font-light">{category.description}</p>
          )}
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12 bg-white/5 backdrop-blur rounded-2xl border border-rose-300/20">
            <p className="text-white/60 font-light">No hay productos en esta categoría aún</p>
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
