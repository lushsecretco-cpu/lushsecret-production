'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useAuthStore } from '@/store';

export default function AuthSync() {
  const { data: session, status } = useSession();
  const setAuth = useAuthStore((state) => state.setAuth);
  const loadFromStorage = useAuthStore((state) => state.loadFromStorage);
  const loadedRef = useRef(false);

  // Cargar desde localStorage UNA SOLA VEZ al montar
  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      loadFromStorage();
    }
  }, []);

  // Sincronizar sesión de NextAuth cuando cambie
  useEffect(() => {
    if (status === 'authenticated' && session?.backendToken && session?.user) {
      setAuth(session.user, session.backendToken);
    }
  }, [status, session?.backendToken, session?.user, setAuth]);

  return null;
}
