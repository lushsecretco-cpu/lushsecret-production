'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store';
import { FiUsers, FiPackage, FiTruck } from 'react-icons/fi';

export default function AdminPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuthStore();

  // Proteger ruta: redirigir si no es admin
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">Debes iniciar sesión como administrador</p>
          <Link href="/auth" className="text-brand-600 font-semibold hover:text-brand-700">
            Ir a Login
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">No tienes permisos de administrador</p>
          <Link href="/" className="text-brand-600 font-semibold hover:text-brand-700">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Panel Administrativo</h1>
        <p className="text-gray-600 mb-10">Bienvenido, {user.name || user.email}</p>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Productos */}
          <Link
            href="/admin/productos"
            className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-brand-600 hover:shadow-lg transition"
          >
            <div className="flex items-start gap-4">
              <div className="bg-brand-100 p-3 rounded-lg">
                <FiPackage className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Productos</h3>
                <p className="text-sm text-gray-600 mt-1">Crear, editar y eliminar productos</p>
              </div>
            </div>
          </Link>

          {/* Órdenes */}
          <Link
            href="/admin/ordenes"
            className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-brand-600 hover:shadow-lg transition"
          >
            <div className="flex items-start gap-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <FiTruck className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Órdenes</h3>
                <p className="text-sm text-gray-600 mt-1">Ver y gestionar órdenes de clientes</p>
              </div>
            </div>
          </Link>

          {/* Usuarios */}
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 opacity-50 cursor-not-allowed">
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <FiUsers className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Usuarios</h3>
                <p className="text-sm text-gray-600 mt-1">Próximamente</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Estadísticas rápidas</h2>
          <p className="text-sm text-gray-600">Las estadísticas se cargarán cuando accedas a cada sección.</p>
        </div>
      </div>
    </div>
  );
}
