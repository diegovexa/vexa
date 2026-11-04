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

export function lineaMetaBySlug(slug) {
  const linea = LINEAS_INFO.find((l) => l.slug === slug);
  return linea ? lineaMeta(linea) : HOME_META;
}

// Actualiza la pestaña y la descripción al navegar dentro de la app
export function setPageMeta({ title, description }) {
  if (typeof document === 'undefined') return;
  document.title = title;
  const tag = document.querySelector('meta[name="description"]');
  if (tag) tag.setAttribute('content', description);
}
