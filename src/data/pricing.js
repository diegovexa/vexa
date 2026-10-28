// Combos (tratamiento completo) y descuentos por cantidad.
import { LINEAS, TIPOS_TRATAMIENTO } from './store';

export const DEFAULT_DESCUENTOS = [
  { min: 6, pct: 5 },
  { min: 12, pct: 10 },
  { min: 24, pct: 15 },
];
export const DEFAULT_COMBO_PCT = 10;

export function getTiers(config) {
  const t = Array.isArray(config?.descuentos) ? config.descuentos : DEFAULT_DESCUENTOS;
  return t
    .map(x => ({ min: Number(x.min) || 0, pct: Number(x.pct) || 0 }))
    .filter(x => x.min > 0 && x.pct > 0)
    .sort((a, b) => a.min - b.min);
}

export function getComboPct(config) {
  const v = config?.combo_pct;
  return v === undefined || v === null || v === '' ? DEFAULT_COMBO_PCT : Number(v) || 0;
}

/**
 * Un combo por línea con al menos 2 productos de tratamiento activos.
 * size 0 = presentación grande (primera variante), 1 = chica (segunda, si existe).
 */
export function buildCombos(products, config) {
  const pct = getComboPct(config);
  const combos = [];
  LINEAS.forEach(linea => {
    const items = TIPOS_TRATAMIENTO
      .map(tipo => products.find(p => p.active && p.linea === linea && p.tipo === tipo && p.variantes?.length))
      .filter(Boolean);
    if (items.length < 2) return;

    const sizes = [0, 1].map(idx => {
      const componentes = items.map(p => {
        const v = p.variantes[Math.min(idx, p.variantes.length - 1)];
        return { id: p.id, producto: p.producto, tipo: p.tipo, tamanio: v.tamanio, precio: v.precio, image_url: p.image_url };
      });
      const lista = componentes.reduce((s, c) => s + c.precio, 0);
      return {
        label: idx === 0 ? 'Profesional' : 'Chico',
        detalle: componentes.map(c => c.tamanio).join(' + '),
        componentes,
        lista,
        precio: round(lista * (1 - pct / 100)),
      };
    });
    // Si la versión chica es idéntica a la grande (ej. todo con una sola variante), dejamos una
    const unique = sizes[0].detalle === sizes[1].detalle ? [sizes[0]] : sizes;

    combos.push({
      id: `combo-${linea}`,
      linea,
      nombre: `Tratamiento completo ${linea}`,
      pct,
      sizes: unique,
    });
  });
  return combos;
}

function round(n) {
  return Math.round(n * 100) / 100;
}

/**
 * Totales del carrito. Todas las unidades suman para el escalón de descuento
 * (se pueden mezclar shampoos, máscaras, ampollas y combos). Cada línea recibe el
 * mejor descuento disponible: combos = máx(descuento combo, escalón); resto = escalón.
 */
export function computeCart(cart, config) {
  const tiers = getTiers(config);
  const unidades = cart.reduce((s, c) => s + c.qty * (c.isCombo ? c.componentes.length : 1), 0);
  const tier = [...tiers].reverse().find(t => unidades >= t.min) || null;
  const next = tiers.find(t => unidades < t.min) || null;
  const tierPct = tier?.pct || 0;

  let lista = 0;
  let total = 0;
  const lines = cart.map(c => {
    const listaLinea = (c.isCombo ? c.lista : c.precio) * c.qty;
    const pct = c.isCombo ? Math.max(c.comboPct || 0, tierPct) : tierPct;
    const totalLinea = round(listaLinea * (1 - pct / 100));
    lista += listaLinea;
    total += totalLinea;
    return { ...c, listaLinea, totalLinea, pct };
  });

  return {
    lines,
    unidades,
    tier,
    next,
    faltan: next ? next.min - unidades : 0,
    lista: round(lista),
    total: round(total),
    ahorro: round(lista - total),
  };
}
