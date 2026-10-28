// Productos locales. Se usan cuando Supabase no responde (modo local), así el
// catálogo y el admin funcionan sin base de datos.
// Precios: "Lista de precios" Vexa (imagen de WhatsApp, 28/10/2026) — precio final por presentación.
// Modos de uso: borrador con el uso profesional estándar; confirmar con la marca.
import { img } from './lineas';

export const PRODUCTS_VERSION = 4;

const base = (p) => ({
  active: true,
  destacado: false,
  ...p,
  image_url: p.image ? img(p.image) : null,
});

const USO = {
  shampoo: 'Aplicar sobre el cabello húmedo y masajear suavemente el cuero cabelludo hasta formar espuma. Enjuagar con abundante agua. Repetir si es necesario.',
  mascara: 'Luego del shampoo, retirar el exceso de agua y aplicar de medios a puntas. Peinar para distribuir, dejar actuar de 5 a 10 minutos y enjuagar.',
  ampollas: 'Luego del shampoo, sobre el cabello húmedo, aplicar el contenido de una ampolla de medios a puntas (o en el cuero cabelludo en tratamientos anticaída). Masajear y dejar actuar 10 minutos; enjuagar. Uso semanal o según indicación profesional.',
  protector: 'Sobre el cabello limpio, húmedo o seco, pulverizar a 20 cm de medios a puntas antes del secador, la planchita o la buclera. Peinar para distribuir. No enjuagar.',
};

const SH_PRO = [
  { tamanio: '1000 ml', precio: 14507.9 },
  { tamanio: '250 ml', precio: 6231.5 },
];
const MK_PRO = [
  { tamanio: '1000 gr', precio: 13755.28 },
  { tamanio: '270 gr', precio: 5989.5 },
];
const AMP_PRO = [{ tamanio: 'Caja x 12 u', precio: 22385 }];

export const LOCAL_PRODUCTS = [
  base({
    id: 'local-argan-shampoo', linea: 'Argan Recovery', producto: 'Shampoo Argan Recovery', tipo: 'Shampoo',
    ph: '5,5', image: 'argan-shampoo', variantes: SH_PRO, destacado: true,
    descripcion: 'Para cabello mixto, fórmula de uso diario con aceite de argán que aporta elasticidad y resistencia. Su fórmula con filtro UV y vitamina E protege la fibra capilar, devolviéndole brillo natural, suavidad y ligereza.',
    beneficios: 'Elasticidad - Resistencia - Brillo natural - Protección UV',
    indicaciones: 'Cabellos mixtos - Uso diario',
    modo_uso: USO.shampoo,
  }),
  base({
    id: 'local-argan-mascara', linea: 'Argan Recovery', producto: 'Máscara Argan Recovery', tipo: 'Máscara',
    ph: '5', image: 'argan-mascara', variantes: MK_PRO,
    descripcion: 'Tratamiento que reconstruye internamente el cabello, dejándolo suave, sedoso y con brillo duradero. Ideal para eliminar y prevenir los signos del envejecimiento capilar, aportando vitalidad y luminosidad.',
    beneficios: 'Regeneración profunda - Elasticidad - Brillo duradero - Anti-envejecimiento capilar',
    indicaciones: 'Cabello dañado - Envejecimiento capilar',
    modo_uso: USO.mascara,
  }),
  base({
    id: 'local-argan-ampollas', linea: 'Argan Recovery', producto: 'Ampollas Argan Recovery', tipo: 'Ampollas',
    ph: '5', image: 'argan-ampollas', variantes: AMP_PRO,
    descripcion: 'Recuperación profunda con aceite puro de argán: su fórmula 1+4 en agua ofrece un tratamiento potente y rendidor.',
    beneficios: 'Hidratación - Resistencia - Elasticidad',
    indicaciones: 'Tratamiento intensivo',
    modo_uso: 'Diluir 1 parte del contenido de la ampolla en 4 partes de agua (fórmula 1+4). Luego del shampoo, aplicar de medios a puntas sobre el cabello húmedo, masajear y dejar actuar 10 minutos; enjuagar.',
  }),
  base({
    id: 'local-biotina-shampoo', linea: 'Biotina Therapy', producto: 'Shampoo Biotina Therapy', tipo: 'Shampoo',
    ph: '5', image: 'biotina-shampoo', destacado: true,
    variantes: [{ tamanio: '1000 ml', precio: 20993.5 }, { tamanio: '250 ml', precio: 9377.5 }],
    descripcion: 'Reduce y previene la caída del cabello, fortaleciendo la fibra capilar desde la raíz hasta las puntas.',
    beneficios: 'Reduce caída - Fortalecimiento - Cuidado raíz a punta',
    indicaciones: 'Cabello con caída',
    modo_uso: USO.shampoo,
  }),
  base({
    id: 'local-biotina-mascara', linea: 'Biotina Therapy', producto: 'Máscara Biotina Therapy', tipo: 'Máscara',
    ph: '4', image: 'biotina-mascara', destacado: true,
    variantes: [{ tamanio: '1000 gr', precio: 23111 }, { tamanio: '270 gr', precio: 9801 }],
    descripcion: 'Reduce y previene la caída del cabello, manteniendo el color gracias a su pH ácido. Fortalece la fibra capilar desde el interior; ideal después de alisados y tratamientos técnicos.',
    beneficios: 'Reduce caída - Fortalecimiento - Mantiene el color',
    indicaciones: 'Cabello con caída - Post-tratamiento técnico',
    modo_uso: USO.mascara,
  }),
  base({
    id: 'local-biotina-ampollas', linea: 'Biotina Therapy', producto: 'Ampollas Biotina Therapy', tipo: 'Ampollas',
    ph: '-', image: 'biotina-ampollas',
    variantes: [{ tamanio: 'Caja x 12 u', precio: 25850 }],
    descripcion: 'Shock fortalecedor con biotina que ayuda a fortalecer la fibra capilar y reducir la caída.',
    beneficios: 'Fortalecimiento - Reduce caída',
    indicaciones: 'Tratamiento intensivo caída',
    modo_uso: 'Luego del shampoo, con el cabello húmedo, aplicar el contenido de una ampolla directamente sobre el cuero cabelludo, raya por raya. Masajear con la yema de los dedos 2 a 3 minutos y dejar actuar 10 minutos; enjuagar. Usar 1 a 2 veces por semana durante el tratamiento.',
  }),
  base({
    id: 'local-biotina-protector', linea: 'Biotina Therapy', producto: 'Protector térmico Biotina Therapy', tipo: 'Protector térmico',
    ph: '-', image: 'biotina-protector', nuevo: true,
    variantes: [{ tamanio: '200 ml', precio: 24200 }, { tamanio: '100 ml', precio: 12210 }],
    descripcion: 'Protector térmico con biotina y pantenol. Heat shield hasta 230 °C, sin enjuague y apto para uso diario: protege y fortalece el cabello antes del secador o la planchita.',
    beneficios: 'Protege hasta 230 °C - Biotina y pantenol - Sin enjuague - Apto uso diario',
    indicaciones: 'Antes de secador - Planchita - Buclera',
    modo_uso: USO.protector,
  }),
  base({
    id: 'local-keratina-shampoo', linea: 'Keratina Revitalize', producto: 'Shampoo Keratina Revitalize', tipo: 'Shampoo',
    ph: '5', image: 'keratina-shampoo', variantes: SH_PRO,
    descripcion: 'Repara y fortalece la fibra capilar dañada, le devuelve soltura y flexibilidad natural, logrando un cabello suave con brillo y vitalidad. Reestructurante y anti-frizz, ideal para cabellos quebradizos y maltratados.',
    beneficios: 'Reparación - Fortalecimiento - Anti-frizz - Reestructurante',
    indicaciones: 'Cabello dañado - Quebradizo - Maltratado',
    modo_uso: USO.shampoo,
  }),
  base({
    id: 'local-keratina-mascara', linea: 'Keratina Revitalize', producto: 'Máscara Keratina Revitalize', tipo: 'Máscara',
    ph: '4', image: 'keratina-mascara', variantes: MK_PRO, destacado: true,
    descripcion: 'Devuelve la vitalidad, suavidad y brillo al cabello dañado. Su fórmula anti-frizz reestructura la fibra capilar, sellándola con su pH más ácido.',
    beneficios: 'Reparación - Reestructuración - Anti-frizz - Flexibilidad',
    indicaciones: 'Cabello dañado - Frizz - Quebradizo',
    modo_uso: USO.mascara,
  }),
  base({
    id: 'local-keratina-ampollas', linea: 'Keratina Revitalize', producto: 'Ampollas Keratina Revitalize', tipo: 'Ampollas',
    ph: '-', image: 'keratina-ampollas', variantes: AMP_PRO,
    descripcion: 'Reparación profunda para cabello tratado, con frizz o quebradizo.',
    beneficios: 'Reparación - Fortalecimiento',
    indicaciones: 'Cabello dañado',
    modo_uso: USO.ampollas,
  }),
  base({
    id: 'local-neutro-shampoo', linea: 'Neutro Balance', producto: 'Shampoo Neutro Balance', tipo: 'Shampoo',
    ph: '7', image: 'neutro-shampoo',
    variantes: [{ tamanio: '1000 ml', precio: 11495 }, { tamanio: '250 ml', precio: 4295.5 }],
    descripcion: 'Limpieza profunda para todo tipo de cabellos, especialmente cueros cabelludos sensibles. Mantiene el color en los lavados.',
    beneficios: 'Limpieza profunda - pH neutro - Cuida el color',
    indicaciones: 'Todos los tipos de cabello - Cueros cabelludos sensibles',
    modo_uso: USO.shampoo,
  }),
  base({
    id: 'local-extra-mascara', linea: 'Extra Acida Intense', producto: 'Máscara Extra Ácida Intense', tipo: 'Máscara',
    ph: '3,5', image: 'extra-mascara',
    variantes: [{ tamanio: '1000 gr', precio: 9075 }, { tamanio: '270 gr', precio: 4295.5 }],
    descripcion: 'Desarrollada para aplicar luego de la coloración en crema. Gracias a su pH extra ácido restaura el cabello en su totalidad, sella la fibra capilar y fija el color. Hidratación profunda y gran poder desenredante.',
    beneficios: 'Restauración post-color - Sellado fibra capilar - Fijación color - Hidratación profunda - Desenredante',
    indicaciones: 'Post-coloración - Cabello coloreado',
    modo_uso: 'Inmediatamente después de enjuagar la coloración en crema, retirar el exceso de agua y aplicar de medios a puntas. Dejar actuar de 5 a 10 minutos y enjuagar con agua tibia o fría para sellar la cutícula.',
  }),
];

// Lanzamiento sin precio en la lista: se muestra en la landing, no en el catálogo.
export const LANZAMIENTOS = [
  {
    nombre: 'Protector térmico Biotina Therapy',
    detalle: 'Con biotina y pantenol · Heat shield 230 °C · 100 y 200 ml',
    image: 'promo-biotina-protector',
    color: '#B430DE',
    disponible: true,
  },
  {
    nombre: 'Protector térmico Colágeno Anti Age',
    detalle: 'Con colágeno y elastina · Brillo y suavidad · 100 y 200 ml',
    image: 'promo-colageno',
    color: '#C9A24B',
    disponible: false,
  },
];
