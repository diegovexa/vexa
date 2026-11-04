// Títulos y descripciones de cada página. Los usa la app (pestaña del navegador)
// y el build (seo/prerender.js), que genera el HTML que leen Google y los LLMs.
import { LINEAS_INFO } from './lineas';

export const SITE_URL = 'https://www.productosvexa.com.ar';
export const SITE_NAME = 'Vexa Hair Evolution';

export const HOME_META = {
  title: 'Vexa Hair Evolution | Cosmética capilar profesional por mayor',
  description:
    'Productos capilares profesionales Vexa: shampoo, máscara, ampollas y protector térmico. Líneas Argan, Biotina, Keratina, Neutro, Extra Ácida y Colágeno. Venta mayorista.',
};

export const CATALOGO_META = {
  title: 'Catálogo mayorista | Vexa Hair Evolution',
  description:
    'Catálogo mayorista de Vexa: shampoo, máscara, ampollas y protectores térmicos profesionales para salones y reventa. Armá tu pedido y envialo por WhatsApp.',
};

export function lineaMeta(linea) {
  return {
    title: `${linea.nombre}: ${linea.necesidad.toLowerCase()} | Vexa Hair Evolution`,
    description: `${linea.claim} Línea profesional ${linea.nombre} de Vexa para ${linea.para.toLowerCase()}. Venta mayorista.`,
  };
}

export const FAQ_META = {
  title: 'Preguntas frecuentes | Vexa Hair Evolution',
  description:
    'Qué producto Vexa usar para la caída, el frizz, después de teñir o para proteger del calor, cómo se aplican y cómo comprar por mayor.',
};

// "Protector térmico Colágeno Anti Age" → "protector-termico-colageno-anti-age"
export function productoSlug(nombre) {
  return String(nombre || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const productoPath = (p) => `/producto/${productoSlug(p.producto)}`;

export function productoMeta(p) {
  const tamanios = (p.variantes || []).map((v) => v.tamanio).join(' y ');
  const desc = String(p.descripcion || '').trim();
  const corta = desc.length > 150 ? `${desc.slice(0, desc.lastIndexOf(' ', 147))}…` : desc;
  return {
    title: `${p.producto}${tamanios ? ` ${tamanios}` : ''} | Vexa Hair Evolution`,
    description: `${corta} Venta mayorista.`,
  };
}

// Actualiza la pestaña y la descripción al navegar dentro de la app
export function setPageMeta({ title, description }) {
  if (typeof document === 'undefined') return;
  document.title = title;
  const tag = document.querySelector('meta[name="description"]');
  if (tag) tag.setAttribute('content', description);
}
