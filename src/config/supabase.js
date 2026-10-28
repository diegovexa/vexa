import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Si el servidor no responde, cortamos el pedido en vez de esperar para siempre
// (por ejemplo, cuando el navegador tiene guardada una sesión de un proyecto que ya no existe).
export const REQUEST_TIMEOUT_MS = 6000;

function fetchWithTimeout(input, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  init.signal?.addEventListener('abort', () => controller.abort());
  return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
}

// Sin variables de entorno usamos valores de relleno: la app arranca en modo local (ver services/backend.js)
export const supabase = createClient(
  supabaseUrl || 'http://supabase.invalid',
  supabaseAnonKey || 'missing-anon-key',
  { global: { fetch: fetchWithTimeout } }
);
