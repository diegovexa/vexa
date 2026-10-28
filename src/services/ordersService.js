import { supabase } from '../config/supabase';
import { isLocalMode, localDB, localId } from './backend';

const LOCAL_KEY = 'vexa.orders';
const localOrders = () => localDB.get(LOCAL_KEY, []);

function localPatch(id, fields) {
  const list = localOrders().map(o => o.id === id ? { ...o, ...fields } : o);
  localDB.set(LOCAL_KEY, list);
  return list.find(o => o.id === id);
}

export const ordersService = {
  async getAll() {
    if (isLocalMode()) return localOrders();
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(orderData) {
    const row = {
      cliente_nombre: orderData.cliente_nombre || 'Cliente',
      cliente_telefono: orderData.cliente_telefono || '',
      items: orderData.items || [],
      total: orderData.total || 0,
      status: 'pendiente',
      notas: orderData.notas || '',
    };
    if (isLocalMode()) {
      const order = { ...row, id: localId(), created_at: new Date().toISOString() };
      localDB.set(LOCAL_KEY, [order, ...localOrders()]);
      return order;
    }
    // Sin .select(): el cliente no tiene permiso de lectura sobre pedidos (solo el admin),
    // y pedir la fila de vuelta haría fallar todo el insert por RLS.
    const order = { ...row, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    const { error } = await supabase.from('pedidos').insert([order]);
    if (error) throw error;
    return order;
  },

  async updateStatus(id, status) {
    if (isLocalMode()) return localPatch(id, { status });
    const { data, error } = await supabase
      .from('pedidos')
      .update({ status })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  async updateNotas(id, notas) {
    if (isLocalMode()) return localPatch(id, { notas });
    const { data, error } = await supabase
      .from('pedidos')
      .update({ notas })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },
};
