import { supabase } from '../config/supabase';
import { DEFAULT_DESCUENTOS, DEFAULT_COMBO_PCT } from '../data/pricing';
import { isLocalMode, setLocalMode, localDB, withDeadline } from './backend';

const LOCAL_KEY = 'vexa.config';

export const DEFAULT_CONFIG = {
  id: 'main',
  shop_name: 'Vexa',
  phone: '5491138382863',
  currency: 'ARS',
  welcome_msg: 'Hola! Gracias por elegir Vexa. Revisá nuestro catálogo mayorista',
  min_order: 0,
  descuentos: DEFAULT_DESCUENTOS,
  combo_pct: DEFAULT_COMBO_PCT,
};

const withDefaults = (cfg) => ({ ...DEFAULT_CONFIG, ...(cfg || {}) });

function toRow(cfg) {
  return {
    id: 'main',
    shop_name: cfg.shop_name,
    phone: cfg.phone,
    currency: cfg.currency,
    welcome_msg: cfg.welcome_msg,
    min_order: Number(cfg.min_order) || 0,
    descuentos: (cfg.descuentos || [])
      .map(d => ({ min: Number(d.min) || 0, pct: Number(d.pct) || 0 }))
      .filter(d => d.min > 0 && d.pct > 0)
      .sort((a, b) => a.min - b.min),
    combo_pct: Number(cfg.combo_pct) || 0,
    updated_at: new Date().toISOString(),
  };
}

export const configService = {
  async get() {
    if (isLocalMode()) return withDefaults(localDB.get(LOCAL_KEY, null));
    try {
      const { data, error } = await withDeadline(supabase
        .from('config')
        .select('*')
        .eq('id', 'main')
        .maybeSingle());
      if (error) throw error;
      return withDefaults(data);
    } catch (err) {
      console.warn('Config: Supabase no responde, usando modo local:', err.message);
      setLocalMode(true);
      return withDefaults(localDB.get(LOCAL_KEY, null));
    }
  },

  async update(cfg) {
    const row = toRow(cfg);
    if (isLocalMode()) {
      localDB.set(LOCAL_KEY, row);
      return withDefaults(row);
    }
    const { data, error } = await supabase.from('config').upsert(row).select();
    if (error) throw error;
    return withDefaults(data[0]);
  },
};
