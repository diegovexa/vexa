import { supabase } from '../config/supabase';
import { LOCAL_PRODUCTS, PRODUCTS_VERSION } from '../data/localProducts';
import { normalizeProduct } from '../data/store';
import { isLocalMode, setLocalMode, localDB, localId, withDeadline } from './backend';

const BUCKET = 'productos';
const LOCAL_KEY = `vexa.products.v${PRODUCTS_VERSION}`;

const localProducts = () => localDB.get(LOCAL_KEY, LOCAL_PRODUCTS).map(normalizeProduct);
const saveLocal = (list) => localDB.set(LOCAL_KEY, list);

function toRow(p) {
  return {
    linea: p.linea,
    producto: p.producto,
    tipo: p.tipo,
    ph: p.ph || '-',
    variantes: (p.variantes || []).map(v => ({ tamanio: v.tamanio, precio: Number(v.precio) || 0 })),
    descripcion: p.descripcion || '',
    beneficios: p.beneficios || '',
    indicaciones: p.indicaciones || '',
    modo_uso: p.modo_uso || '',
    destacado: !!p.destacado,
    active: p.active !== false,
    image_url: p.image_url || null,
  };
}

export const productsService = {
  async getAll() {
    if (isLocalMode()) return localProducts();
    try {
      const { data, error } = await withDeadline(supabase
        .from('productos')
        .select('*')
        .order('linea', { ascending: true })
        .order('producto', { ascending: true }));
      if (error) throw error;
      return (data || []).map(normalizeProduct);
    } catch (err) {
      console.warn('Supabase no responde, usando modo local:', err.message);
      setLocalMode(true);
      return localProducts();
    }
  },

  async create(productData) {
    if (isLocalMode()) {
      const created = normalizeProduct({ ...toRow(productData), id: localId() });
      saveLocal([...localProducts(), created]);
      return created;
    }
    const { data, error } = await supabase.from('productos').insert([toRow(productData)]).select();
    if (error) throw error;
    return normalizeProduct(data[0]);
  },

  async update(id, productData) {
    if (isLocalMode()) {
      const list = localProducts().map(p => p.id === id ? normalizeProduct({ ...p, ...toRow(productData), id }) : p);
      saveLocal(list);
      return list.find(p => p.id === id);
    }
    const { data, error } = await supabase.from('productos').update(toRow(productData)).eq('id', id).select();
    if (error) throw error;
    return normalizeProduct(data[0]);
  },

  async delete(id) {
    if (isLocalMode()) {
      saveLocal(localProducts().filter(p => p.id !== id));
      return;
    }
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (error) throw error;
  },

  async patch(id, fields) {
    if (isLocalMode()) {
      const list = localProducts().map(p => p.id === id ? { ...p, ...fields } : p);
      saveLocal(list);
      return list.find(p => p.id === id);
    }
    const { data, error } = await supabase.from('productos').update(fields).eq('id', id).select();
    if (error) throw error;
    return normalizeProduct(data[0]);
  },

  toggleActive(id, active) {
    return this.patch(id, { active });
  },

  toggleDestacado(id, destacado) {
    return this.patch(id, { destacado });
  },

  async uploadImage(file) {
    if (isLocalMode()) {
      // En local la imagen queda embebida (data URL) en el navegador
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
    }
    const fileExt = file.name.split('.').pop();
    const filePath = `products/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, { upsert: true });
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    return data.publicUrl;
  },

  async deleteImage(imageUrl) {
    if (!imageUrl || isLocalMode()) return;
    const urlParts = imageUrl.split(`${BUCKET}/`);
    if (urlParts.length < 2) return;
    await supabase.storage.from(BUCKET).remove([urlParts[1]]);
  },
};
