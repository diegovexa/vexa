// Modo local: cuando Supabase no está configurado o no responde, los datos
// (productos, config, pedidos) se guardan en el localStorage del navegador.
let localMode = !import.meta.env.VITE_SUPABASE_URL;

export const isLocalMode = () => localMode;
export const setLocalMode = (v) => { localMode = v; };

export const localDB = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn('No se pudo guardar en localStorage:', err.message);
    }
  },
};

// Si una consulta no termina a tiempo (red caída, sesión vieja que no se puede refrescar), falla
// y el servicio pasa a modo local en lugar de dejar la página cargando.
export function withDeadline(promise, ms = 5000) {
  let timer;
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Supabase no respondió en ${ms / 1000}s`)), ms);
  });
  return Promise.race([promise, deadline]).finally(() => clearTimeout(timer));
}

export const localId = () => `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
