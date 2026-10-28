export const LINEAS = [
  'Argan Recovery',
  'Biotina Therapy',
  'Keratina Revitalize',
  'Neutro Balance',
  'Extra Acida Intense',
  'Colágeno Anti Age',
];

export const TIPOS = ['Shampoo', 'Máscara', 'Ampollas', 'Protector térmico'];

// Tipos que forman el "tratamiento completo" (combo) de cada línea
export const TIPOS_TRATAMIENTO = ['Shampoo', 'Máscara', 'Ampollas'];

export const TAMANIOS_SUGERIDOS = {
  'Shampoo': ['1000 ml', '250 ml'],
  'Máscara': ['1000 gr', '270 gr'],
  'Ampollas': ['Caja x 12 u'],
  'Protector térmico': ['200 ml', '100 ml'],
};

export const SELLER_PHONE = "5491138382863";

export function formatPrice(n) {
  const num = Number(n);
  if (!num || num === 0) return '-';
  return "$" + num.toLocaleString("es-AR", {
    minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

export function getTamaniosForTipo(tipo) {
  return TAMANIOS_SUGERIDOS[tipo] || [];
}

export function tipoEmoji(tipo) {
  if (tipo === 'Shampoo') return '🧴';
  if (tipo === 'Máscara') return '💆';
  if (tipo === 'Protector térmico') return '🔥';
  return '💧';
}

// Productos viejos (precio_* + tamanio) → variantes [{ tamanio, precio }]
export function normalizeProduct(p) {
  let variantes = Array.isArray(p.variantes) ? p.variantes : [];
  if (!variantes.length && p.tamanio) {
    variantes = [{ tamanio: p.tamanio, precio: Number(p.precio_reventa) || 0 }];
  }
  variantes = variantes
    .map(v => ({ tamanio: String(v.tamanio || '').trim(), precio: Number(v.precio) || 0 }))
    .filter(v => v.tamanio);
  return { destacado: false, modo_uso: '', ...p, variantes };
}

export function minPrice(p) {
  const prices = (p.variantes || []).map(v => v.precio).filter(Boolean);
  return prices.length ? Math.min(...prices) : 0;
}
