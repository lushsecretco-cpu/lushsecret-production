'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { signIn } from 'next-auth/react';

export default function AuthPage() {
  const router = useRouter();
  const { user, login, register, requestRegisterCode, setRegisterCode, registerCode, isLoading, error } = useAuthStore();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let result;
    if (isLogin) {
      result = await login(formData.email, formData.password);
    } else {
      if (formData.password !== confirmPassword) {
        setPasswordError('Las contraseñas no coinciden');
        return;
      }
      setPasswordError('');
      result = await register(formData.email, formData.password, formData.name);
    }

    if (result.success) {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0b10] via-[#1a0a15] to-[#0b0b10] flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur rounded-2xl shadow-xl p-8 w-full max-w-md border border-rose-300/20">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-rose-300/20">
          <button
            onClick={() => setIsLogin(true)}
            className={`pb-3 font-light transition ${
              isLogin
                ? 'text-rose-200 border-b-2 border-rose-300'
                : 'text-white/50 hover:text-white/70'
            }`}
          >
            Inicia sesión
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`pb-3 font-light transition ${
              !isLogin
                ? 'text-rose-200 border-b-2 border-rose-300'
                : 'text-white/50 hover:text-white/70'
            }`}
          >
            Registro
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Nombre completo
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-3 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  className="w-full pl-10 pr-4 py-2 border border-white/10 rounded-lg bg-[#0f0f16] text-white placeholder:text-white/40 focus:outline-none focus:border-brand-500"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Correo electrónico
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-3 w-5 h-5 text-white/40" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                className="w-full pl-10 pr-4 py-2 border border-white/10 rounded-lg bg-[#0f0f16] text-white placeholder:text-white/40 focus:outline-none focus:border-brand-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Contraseña
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3 w-5 h-5 text-white/40" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-2 border border-white/10 rounded-lg bg-[#0f0f16] text-white placeholder:text-white/40 focus:outline-none focus:border-brand-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-white/40 hover:text-white/70 transition"
              >
                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Confirmar contraseña
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3 w-5 h-5 text-white/40" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-2 border border-white/10 rounded-lg bg-[#0f0f16] text-white placeholder:text-white/40 focus:outline-none focus:border-brand-500"
                  required={!isLogin}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-white/40 hover:text-white/70 transition"
                >
                  {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPassword && formData.password !== confirmPassword && (
                <p className="text-xs text-red-300 mt-2">Las contraseñas no coinciden</p>
              )}
              {passwordError && (
                <p className="text-xs text-red-300 mt-2">{passwordError}</p>
              )}
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Código de verificación
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={registerCode}
                  onChange={(e) => setRegisterCode(e.target.value)}
                  placeholder="123456"
                  className="flex-1 px-4 py-2 border border-white/10 rounded-lg bg-[#0f0f16] text-white placeholder:text-white/40 focus:outline-none focus:border-brand-500"
                  required={!isLogin}
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!formData.email) return;
                    const result = await requestRegisterCode(formData.email);
                    if (result.success) setCodeSent(true);
                  }}
                  className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-semibold hover:bg-white/20"
                >
                  {codeSent ? 'Reenviar' : 'Enviar código'}
                </button>
              </div>
              <p className="text-xs text-white/50 mt-2">
                Enviaremos un código a tu correo para confirmar el registro.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-rose-300 to-rose-400 text-[#0b0b10] py-2 rounded-lg font-light hover:from-rose-200 hover:to-rose-300 transition disabled:bg-white/20 disabled:text-white/50 shadow-lg shadow-rose-300/50"
          >
            {isLoading ? 'Procesando...' : isLogin ? 'Inicia sesión' : 'Regístrate'}
          </button>
        </form>

        {/* Social login */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="text-sm text-white/50">O continúa con</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        <button
          type="button"
          className="w-full inline-flex items-center justify-center gap-2 border border-white/20 text-white py-2 rounded-lg font-semibold hover:bg-white/5 transition"
          onClick={() => signIn('google', { callbackUrl: '/' })}
        >
          <FcGoogle className="w-5 h-5" />
          Continuar con Google
        </button>

        {/* Guest checkout */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="text-sm text-white/50">O continúa como invitado</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        <Link
          href="/checkout"
          className="w-full inline-block text-center border border-rose-300/30 text-rose-200 py-2 rounded-lg font-light hover:bg-rose-300/10 transition"
        >
          Compra sin cuenta
        </Link>

        {/* Footer text */}
        <p className="text-center text-sm text-white/60 mt-6">
          {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-rose-200 font-light hover:text-rose-300 transition"
          >
            {isLogin ? 'Regístrate aquí' : 'Inicia sesión aquí'}
          </button>
        </p>
      </div>
    </div>
  );
}
