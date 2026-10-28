// Información de marca y de cada línea, extraída de los PDFs
// "Vexa_Catálogo de productos.pdf" y "Vexa Enero 2026.pdf".

export const img = (name) => `${import.meta.env.BASE_URL}img/${name}.webp`;

export const BRAND = {
  name: 'Vexa',
  tagline: 'Hair Evolution',
  claim: 'Cosmética capilar profesional',
};

export const LINEAS_INFO = [
  {
    slug: 'argan-recovery',
    nombre: 'Argan Recovery',
    key: 'Argan Recovery',
    color: '#EBB503',
    soft: '#3a2d02',
    necesidad: 'Brillo y elasticidad',
    para: 'Cabellos mixtos · uso diario',
    claim: 'Elasticidad, resistencia y brillo natural con aceite de argán.',
    descripcion:
      'Fórmula equilibrada para el uso diario. El aceite de argán aporta elasticidad y resistencia; el filtro UV y la vitamina E protegen la fibra capilar y le devuelven su brillo natural, dejándola suave y ligera.',
    ph: '5 – 5,5',
    hero: 'glow-argan',
    destacado: 'argan-mascara',
    set: 'set-argan',
    beneficios: ['Aceite de argán', 'Filtro UV', 'Vitamina E', 'Anti-envejecimiento capilar'],
  },
  {
    slug: 'biotina-therapy',
    nombre: 'Biotina Therapy',
    key: 'Biotina Therapy',
    color: '#B430DE',
    soft: '#2d0e37',
    necesidad: 'Caída del cabello',
    para: 'Cabello con caída · post-tratamiento técnico',
    claim: 'Reduce y previene la caída, de la raíz a las puntas.',
    descripcion:
      'Reduce y previene la caída del cabello fortaleciendo la fibra capilar desde la raíz hasta las puntas. Su máscara de pH ácido mantiene el color y es ideal después de alisados y tratamientos técnicos.',
    ph: '4 – 5',
    hero: 'glow-biotina',
    destacado: 'biotina-mascara',
    set: 'set-biotina',
    beneficios: ['Reduce la caída', 'Fortalece la fibra', 'Mantiene el color', 'Post-tratamiento técnico'],
  },
  {
    slug: 'keratina-revitalize',
    nombre: 'Keratina Revitalize',
    key: 'Keratina Revitalize',
    color: '#F4605B',
    soft: '#3a1311',
    necesidad: 'Daño y frizz',
    para: 'Cabello dañado · quebradizo · con frizz',
    claim: 'Repara, reestructura y controla el frizz.',
    descripcion:
      'Repara y fortalece la fibra capilar dañada, le devuelve soltura y flexibilidad natural, logrando un cabello suave con brillo y vitalidad. Reestructurante y anti-frizz, sella la fibra con su pH ácido.',
    ph: '4 – 5',
    hero: 'glow-keratina',
    destacado: 'keratina-mascara',
    set: 'set-keratina',
    beneficios: ['Reparación profunda', 'Anti-frizz', 'Reestructurante', 'Flexibilidad'],
  },
  {
    slug: 'neutro-balance',
    nombre: 'Neutro Balance',
    key: 'Neutro Balance',
    color: '#019D89',
    soft: '#00241f',
    necesidad: 'Cuero cabelludo sensible',
    para: 'Todo tipo de cabello · cueros sensibles',
    claim: 'Limpieza profunda que respeta el color.',
    descripcion:
      'Limpieza profunda para todo tipo de cabellos, especialmente cueros cabelludos sensibles. Con pH neutro, mantiene el color lavado tras lavado.',
    ph: '7',
    hero: 'glow-neutro',
    destacado: 'neutro-shampoo',
    set: 'band-neutro',
    beneficios: ['pH neutro', 'Limpieza profunda', 'Cueros sensibles', 'Cuida el color'],
  },
  {
    slug: 'extra-acida-intense',
    nombre: 'Extra Ácida Intense',
    key: 'Extra Acida Intense',
    color: '#E8150F',
    soft: '#3a0605',
    necesidad: 'Post-coloración',
    para: 'Cabello recién coloreado',
    claim: 'Sella la fibra y fija el color después de teñir.',
    descripcion:
      'Desarrollada para aplicar luego de la coloración en crema. Gracias a su pH extra ácido restaura el cabello en su totalidad, sella la fibra capilar y fija el color. Hidratación profunda y gran poder desenredante.',
    ph: '3,5',
    hero: 'glow-extra',
    destacado: 'extra-mascara',
    set: 'band-extra',
    beneficios: ['Fija el color', 'Sella la fibra', 'Hidratación profunda', 'Desenredante'],
  },
];

export function getLinea(slug) {
  return LINEAS_INFO.find((l) => l.slug === slug);
}

export function getLineaByKey(key) {
  return LINEAS_INFO.find((l) => l.key === key);
}
