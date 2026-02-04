'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiShoppingBag, FiUser, FiMenu, FiX, FiSearch, FiLogOut } from 'react-icons/fi';
import { useCartStore } from '../store';
import { useAuthStore } from '../store';
import { categoriesAPI } from '../lib/apiClient';

export default function Header() {
  const router = useRouter();
  const { items } = useCartStore();
  const { user, logout } = useAuthStore();
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

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
    const loadCategories = async () => {
      try {
        const response = await categoriesAPI.getAll();
        if (response.data) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    loadCategories();
  }, []);

  // Detectar navegación y redirigir a página principal
  useEffect(() => {
    const handlePopState = () => {
      window.location.href = '/';
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Cerrar menú al navegar
  const handleNavigation = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/productos?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0b0b10]/95 backdrop-blur-md border-b border-rose-300/20">
      {/* Desktop Header */}
      <div className="hidden md:block">
        <div className="container mx-auto px-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-4 border-b border-rose-300/10">
            {/* Logo & Slogan */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="text-3xl font-light text-rose-300 group-hover:text-rose-200 transition-colors">
                LushSecret
              </div>
              <div className="text-xs text-white/40 font-light italic border-l border-rose-300/20 pl-3">
                Elegancia en cada detalle
              </div>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar productos..."
                  className="w-full bg-white/5 border border-rose-300/20 rounded-full px-6 py-2.5 text-sm text-white/90 placeholder-white/30 font-light focus:outline-none focus:border-rose-300/40 focus:bg-white/10 transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-rose-300/60 hover:text-rose-300 transition-colors"
                >
                  <FiSearch size={16} />
                </button>
              </div>
            </form>

            {/* Icons */}
            <div className="flex items-center space-x-6">
              {/* Cart */}
              <Link
                href="/checkout"
                className="relative text-rose-300/70 hover:text-rose-300 transition-colors"
              >
                <FiShoppingBag size={22} />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-400 text-[#0b0b10] text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="text-rose-300/70 hover:text-rose-300 transition-colors"
                >
                  <FiUser size={22} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-[#1a0a15] border border-rose-300/20 rounded-lg shadow-xl overflow-hidden">
                    {user ? (
                      <div className="py-2">
                        <div className="px-4 py-3 border-b border-rose-300/10">
                          <p className="text-sm text-white/90 font-light">{user.name}</p>
                          <p className="text-xs text-white/50 font-light">{user.email}</p>
                        </div>
                        <Link
                          href="/mis-compras"
                          className="block px-4 py-2.5 text-sm text-white/70 hover:bg-rose-300/10 hover:text-rose-300 transition-colors font-light"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          💳 Mis compras
                        </Link>
                        <Link
                          href="/historial"
                          className="block px-4 py-2.5 text-sm text-white/70 hover:bg-rose-300/10 hover:text-rose-300 transition-colors font-light"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          👁️ Historial
                        </Link>
                        <Link
                          href="/orders"
                          className="block px-4 py-2.5 text-sm text-white/70 hover:bg-rose-300/10 hover:text-rose-300 transition-colors font-light"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          📋 Tus pedidos
                        </Link>
                        {user.role === 'admin' && (
                          <Link
                            href="/admin"
                            className="block px-4 py-2.5 text-sm text-white/70 hover:bg-rose-300/10 hover:text-rose-300 transition-colors font-light border-t border-rose-300/10"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            ⚙️ Panel Admin
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-sm text-rose-300/70 hover:bg-rose-300/10 hover:text-rose-300 transition-colors font-light border-t border-rose-300/10"
                        >
                          <FiLogOut className="inline mr-2" size={14} />
                          Cerrar sesión
                        </button>
                      </div>
                    ) : (
                      <Link
                        href="/auth"
                        className="block px-4 py-3 text-sm text-white/70 hover:bg-rose-300/10 hover:text-rose-300 transition-colors font-light"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        🔐 Iniciar sesión
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Category Pills */}
          <div className="py-4">
            <nav className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
              <Link
                href="/productos"
                className="px-5 py-2 bg-white/5 hover:bg-rose-300/10 border border-rose-300/20 hover:border-rose-300/40 rounded-full text-sm text-white/70 hover:text-rose-300 transition-all font-light whitespace-nowrap"
              >
                Todos los productos
              </Link>
              <Link
                href="/productos/linea-intima"
                className="px-5 py-2 bg-white/5 hover:bg-rose-300/10 border border-rose-300/20 hover:border-rose-300/40 rounded-full text-sm text-white/70 hover:text-rose-300 transition-all font-light whitespace-nowrap"
              >
                Linea Intima
              </Link>
              <Link
                href="/productos/smart-pleasure"
                className="px-5 py-2 bg-white/5 hover:bg-rose-300/10 border border-rose-300/20 hover:border-rose-300/40 rounded-full text-sm text-white/70 hover:text-rose-300 transition-all font-light whitespace-nowrap"
              >
                Smart Pleasure
              </Link>
              <Link
                href="/productos/lub-and-care"
                className="px-5 py-2 bg-white/5 hover:bg-rose-300/10 border border-rose-300/20 hover:border-rose-300/40 rounded-full text-sm text-white/70 hover:text-rose-300 transition-all font-light whitespace-nowrap"
              >
                Lub & Care
              </Link>
              <Link
                href="/productos/power-up"
                className="px-5 py-2 bg-white/5 hover:bg-rose-300/10 border border-rose-300/20 hover:border-rose-300/40 rounded-full text-sm text-white/70 hover:text-rose-300 transition-all font-light whitespace-nowrap"
              >
                Power Up
              </Link>
              <Link
                href="/productos/zona-fetish"
                className="px-5 py-2 bg-white/5 hover:bg-rose-300/10 border border-rose-300/20 hover:border-rose-300/40 rounded-full text-sm text-white/70 hover:text-rose-300 transition-all font-light whitespace-nowrap"
              >
                Zona Fetish
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="text-xl font-light text-rose-300">
              LushSecret
            </Link>

            {/* Mobile Icons */}
            <div className="flex items-center space-x-4">
              {/* Search Icon */}
              <button
                onClick={() => {
                  const query = prompt('¿Qué estás buscando?');
                  if (query?.trim()) {
                    window.location.href = `/productos?search=${encodeURIComponent(query)}`;
                  }
                }}
                className="text-rose-300/70 hover:text-rose-300 transition-colors"
              >
                <FiSearch size={20} />
              </button>

              {/* Cart */}
              <Link
                href="/checkout"
                className="relative text-rose-300/70 hover:text-rose-300 transition-colors"
              >
                <FiShoppingBag size={20} />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-400 text-[#0b0b10] text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </Link>

              {/* User Icon */}
              <Link
                href={user ? "/mis-compras" : "/auth"}
                className="text-rose-300/70 hover:text-rose-300 transition-colors"
              >
                <FiUser size={20} />
              </Link>

              {/* Hamburger Menu */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-rose-300/70 hover:text-rose-300 transition-colors"
              >
                {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="border-t border-rose-300/20 bg-[#0b0b10]/98 max-h-[70vh] overflow-y-auto">
            <nav className="container mx-auto px-4 py-4 space-y-1">
              {/* Productos */}
              <Link
                href="/productos"
                className="block px-4 py-3 text-base text-white/70 hover:bg-rose-300/10 hover:text-rose-300 rounded-lg transition-colors font-light"
                onClick={handleNavigation}
              >
                📦 Productos
              </Link>

              {/* Divider */}
              <div className="h-px bg-rose-300/10 my-2"></div>

              {/* Categorías Section */}
              <div className="px-4 py-2 text-xs text-white/40 font-light uppercase tracking-wider">
                Categorías
              </div>
              <Link
                href="/productos/linea-intima"
                className="block px-4 py-3 text-base text-white/70 hover:bg-rose-300/10 hover:text-rose-300 rounded-lg transition-colors font-light"
                onClick={handleNavigation}
              >
                Linea Intima
              </Link>
              <Link
                href="/productos/smart-pleasure"
                className="block px-4 py-3 text-base text-white/70 hover:bg-rose-300/10 hover:text-rose-300 rounded-lg transition-colors font-light"
                onClick={handleNavigation}
              >
                Smart Pleasure
              </Link>
              <Link
                href="/productos/lub-and-care"
                className="block px-4 py-3 text-base text-white/70 hover:bg-rose-300/10 hover:text-rose-300 rounded-lg transition-colors font-light"
                onClick={handleNavigation}
              >
                Lub & Care
              </Link>
              <Link
                href="/productos/power-up"
                className="block px-4 py-3 text-base text-white/70 hover:bg-rose-300/10 hover:text-rose-300 rounded-lg transition-colors font-light"
                onClick={handleNavigation}
              >
                Power Up
              </Link>
              <Link
                href="/productos/zona-fetish"
                className="block px-4 py-3 text-base text-white/70 hover:bg-rose-300/10 hover:text-rose-300 rounded-lg transition-colors font-light"
                onClick={handleNavigation}
              >
                Zona Fetish
              </Link>

              {/* Divider */}
              <div className="h-px bg-rose-300/10 my-2"></div>

              {/* Mi Cuenta Section */}
              <div className="px-4 py-2 text-xs text-white/40 font-light uppercase tracking-wider">
                Mi Cuenta
              </div>
              <Link
                href="/mis-compras"
                className="block px-4 py-3 text-base text-white/70 hover:bg-rose-300/10 hover:text-rose-300 rounded-lg transition-colors font-light"
                onClick={handleNavigation}
              >
                💳 Mis compras
              </Link>
              <Link
                href="/historial"
                className="block px-4 py-3 text-base text-white/70 hover:bg-rose-300/10 hover:text-rose-300 rounded-lg transition-colors font-light"
                onClick={handleNavigation}
              >
                👁️ Historial
              </Link>
              <Link
                href="/orders"
                className="block px-4 py-3 text-base text-white/70 hover:bg-rose-300/10 hover:text-rose-300 rounded-lg transition-colors font-light"
                onClick={handleNavigation}
              >
                📋 Tus pedidos
              </Link>

              {/* Divider */}
              <div className="h-px bg-rose-300/10 my-2"></div>

              {/* Logout / Login */}
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-base text-rose-300/70 hover:bg-rose-300/10 hover:text-rose-300 rounded-lg transition-colors font-light"
                >
                  🚪 Cerrar sesión
                </button>
              ) : (
                <Link
                  href="/auth"
                  className="block px-4 py-3 text-base text-white/70 hover:bg-rose-300/10 hover:text-rose-300 rounded-lg transition-colors font-light"
                  onClick={handleNavigation}
                >
                  🔐 Iniciar sesión
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

