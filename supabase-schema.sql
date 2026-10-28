-- ============================================
-- VEXA - Catálogo mayorista · Esquema de Supabase
-- Correr una sola vez en un proyecto nuevo (SQL Editor → Run).
-- ============================================

-- ============================================
-- 1. TABLAS
-- ============================================
CREATE TABLE IF NOT EXISTS productos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  linea TEXT NOT NULL,
  producto TEXT NOT NULL,
  tipo TEXT NOT NULL,
  ph TEXT DEFAULT '-',
  -- Presentaciones con su precio: [{ "tamanio": "1000 ml", "precio": 14507.9 }, ...]
  variantes JSONB NOT NULL DEFAULT '[]'::jsonb,
  descripcion TEXT DEFAULT '',
  beneficios TEXT DEFAULT '',
  indicaciones TEXT DEFAULT '',
  modo_uso TEXT DEFAULT '',
  destacado BOOLEAN DEFAULT false,   -- aparece en "Más vendidos" del inicio
  active BOOLEAN DEFAULT true,
  image_url TEXT DEFAULT NULL,
  foto BOOLEAN DEFAULT false,        -- true = foto con fondo, false = recorte sin fondo
  nuevo BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pedidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_nombre TEXT NOT NULL DEFAULT 'Cliente',
  cliente_telefono TEXT DEFAULT '',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pendiente',
  notas TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS config (
  id TEXT PRIMARY KEY DEFAULT 'main',
  shop_name TEXT DEFAULT 'Vexa',
  phone TEXT DEFAULT '5491138382863',
  currency TEXT DEFAULT 'ARS',
  welcome_msg TEXT DEFAULT 'Hola! Gracias por elegir Vexa. Revisá nuestro catálogo mayorista',
  min_order NUMERIC DEFAULT 0,
  -- Descuento por cantidad (se mezclan todos los productos): [{ "min": 6, "pct": 5 }, ...]
  descuentos JSONB NOT NULL DEFAULT '[{"min":6,"pct":5},{"min":12,"pct":10},{"min":24,"pct":15}]'::jsonb,
  -- Descuento del tratamiento completo (combo shampoo + máscara + ampollas)
  combo_pct NUMERIC DEFAULT 10,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 2. SEGURIDAD (RLS)
-- Público: ve productos activos y la config, y puede crear pedidos.
-- Admin (usuario autenticado): todo lo demás.
-- IMPORTANTE: en Authentication → Sign In / Providers desactivar "Allow new users to sign up",
-- así el único usuario autenticado es el admin que crees a mano.
-- ============================================
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "productos_select_public" ON productos FOR SELECT USING (active = true);
CREATE POLICY "productos_select_admin" ON productos FOR SELECT TO authenticated USING (true);
CREATE POLICY "productos_insert_admin" ON productos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "productos_update_admin" ON productos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "productos_delete_admin" ON productos FOR DELETE TO authenticated USING (true);

CREATE POLICY "pedidos_insert_public" ON pedidos FOR INSERT WITH CHECK (status = 'pendiente');
CREATE POLICY "pedidos_select_admin" ON pedidos FOR SELECT TO authenticated USING (true);
CREATE POLICY "pedidos_update_admin" ON pedidos FOR UPDATE TO authenticated USING (true);

CREATE POLICY "config_select_public" ON config FOR SELECT USING (true);
CREATE POLICY "config_insert_admin" ON config FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "config_update_admin" ON config FOR UPDATE TO authenticated USING (true);

-- ============================================
-- 3. IMÁGENES (Storage) — bucket público para las fotos que se suben desde el admin
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('productos', 'productos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "storage_select_public" ON storage.objects FOR SELECT USING (bucket_id = 'productos');
CREATE POLICY "storage_insert_admin" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'productos');
CREATE POLICY "storage_delete_admin" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'productos');

-- ============================================
-- 4. CONFIG INICIAL
-- ============================================
INSERT INTO config (id) VALUES ('main') ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5. PRODUCTOS (lista de precios oct-2026; las imágenes salen de /public/img del sitio)
-- ============================================
INSERT INTO productos (linea, producto, tipo, ph, variantes, descripcion, beneficios, indicaciones, modo_uso, destacado, active, image_url, foto, nuevo) VALUES
('Argan Recovery', 'Shampoo Argan Recovery', 'Shampoo', '5,5', '[{"tamanio":"1000 ml","precio":14507.9},{"tamanio":"250 ml","precio":6231.5}]'::jsonb, 'Para cabello mixto, fórmula de uso diario con aceite de argán que aporta elasticidad y resistencia. Su fórmula con filtro UV y vitamina E protege la fibra capilar, devolviéndole brillo natural, suavidad y ligereza.', 'Elasticidad - Resistencia - Brillo natural - Protección UV', 'Cabellos mixtos - Uso diario', 'Aplicar sobre el cabello húmedo y masajear suavemente el cuero cabelludo hasta formar espuma. Enjuagar con abundante agua. Repetir si es necesario.', true, true, '/img/argan-shampoo.webp', false, false),
('Argan Recovery', 'Máscara Argan Recovery', 'Máscara', '5', '[{"tamanio":"1000 gr","precio":13755.28},{"tamanio":"270 gr","precio":5989.5}]'::jsonb, 'Tratamiento que reconstruye internamente el cabello, dejándolo suave, sedoso y con brillo duradero. Ideal para eliminar y prevenir los signos del envejecimiento capilar, aportando vitalidad y luminosidad.', 'Regeneración profunda - Elasticidad - Brillo duradero - Anti-envejecimiento capilar', 'Cabello dañado - Envejecimiento capilar', 'Luego del shampoo, retirar el exceso de agua y aplicar de medios a puntas. Peinar para distribuir, dejar actuar de 5 a 10 minutos y enjuagar.', false, true, '/img/argan-mascara.webp', false, false),
('Argan Recovery', 'Ampollas Argan Recovery', 'Ampollas', '5', '[{"tamanio":"Caja x 12 u","precio":22385}]'::jsonb, 'Recuperación profunda con aceite puro de argán: su fórmula 1+4 en agua ofrece un tratamiento potente y rendidor.', 'Hidratación - Resistencia - Elasticidad', 'Tratamiento intensivo', 'Diluir 1 parte del contenido de la ampolla en 4 partes de agua (fórmula 1+4). Luego del shampoo, aplicar de medios a puntas sobre el cabello húmedo, masajear y dejar actuar 10 minutos; enjuagar.', false, true, '/img/argan-ampollas.webp', false, false),
('Biotina Therapy', 'Shampoo Biotina Therapy', 'Shampoo', '5', '[{"tamanio":"1000 ml","precio":20993.5},{"tamanio":"250 ml","precio":9377.5}]'::jsonb, 'Reduce y previene la caída del cabello, fortaleciendo la fibra capilar desde la raíz hasta las puntas.', 'Reduce caída - Fortalecimiento - Cuidado raíz a punta', 'Cabello con caída', 'Aplicar sobre el cabello húmedo y masajear suavemente el cuero cabelludo hasta formar espuma. Enjuagar con abundante agua. Repetir si es necesario.', true, true, '/img/biotina-shampoo.webp', false, false),
('Biotina Therapy', 'Máscara Biotina Therapy', 'Máscara', '4', '[{"tamanio":"1000 gr","precio":23111},{"tamanio":"270 gr","precio":9801}]'::jsonb, 'Reduce y previene la caída del cabello, manteniendo el color gracias a su pH ácido. Fortalece la fibra capilar desde el interior; ideal después de alisados y tratamientos técnicos.', 'Reduce caída - Fortalecimiento - Mantiene el color', 'Cabello con caída - Post-tratamiento técnico', 'Luego del shampoo, retirar el exceso de agua y aplicar de medios a puntas. Peinar para distribuir, dejar actuar de 5 a 10 minutos y enjuagar.', true, true, '/img/biotina-mascara.webp', false, false),
('Biotina Therapy', 'Ampollas Biotina Therapy', 'Ampollas', '-', '[{"tamanio":"Caja x 12 u","precio":25850}]'::jsonb, 'Shock fortalecedor con biotina que ayuda a fortalecer la fibra capilar y reducir la caída.', 'Fortalecimiento - Reduce caída', 'Tratamiento intensivo caída', 'Luego del shampoo, con el cabello húmedo, aplicar el contenido de una ampolla directamente sobre el cuero cabelludo, raya por raya. Masajear con la yema de los dedos 2 a 3 minutos y dejar actuar 10 minutos; enjuagar. Usar 1 a 2 veces por semana durante el tratamiento.', false, true, '/img/biotina-ampollas.webp', false, false),
('Biotina Therapy', 'Protector térmico Biotina Therapy', 'Protector térmico', '-', '[{"tamanio":"200 ml","precio":24200},{"tamanio":"100 ml","precio":12210}]'::jsonb, 'Protector térmico con biotina y pantenol. Heat shield hasta 230 °C, sin enjuague y apto para uso diario: protege y fortalece el cabello antes del secador o la planchita.', 'Protege hasta 230 °C - Biotina y pantenol - Sin enjuague - Apto uso diario', 'Antes de secador - Planchita - Buclera', 'Sobre el cabello limpio, húmedo o seco, pulverizar a 20 cm de medios a puntas antes del secador, la planchita o la buclera. Peinar para distribuir. No enjuagar.', false, true, '/img/biotina-protector.webp', false, true),
('Colágeno Anti Age', 'Protector térmico Colágeno Anti Age', 'Protector térmico', '-', '[{"tamanio":"200 ml","precio":24200},{"tamanio":"100 ml","precio":12210}]'::jsonb, 'Protector térmico anti age con colágeno y elastina. Protege el cabello del calor hasta 230 °C, repara y potencia su brillo. Sin enjuague, de uso profesional.', 'Protege hasta 230 °C - Colágeno y elastina - Brillo y suavidad - Fortalece y repara', 'Antes de secador - Planchita - Buclera', 'Sobre el cabello limpio, húmedo o seco, pulverizar a 20 cm de medios a puntas antes del secador, la planchita o la buclera. Peinar para distribuir. No enjuagar.', false, true, '/img/colageno-protector.webp', false, true),
('Keratina Revitalize', 'Shampoo Keratina Revitalize', 'Shampoo', '5', '[{"tamanio":"1000 ml","precio":14507.9},{"tamanio":"250 ml","precio":6231.5}]'::jsonb, 'Repara y fortalece la fibra capilar dañada, le devuelve soltura y flexibilidad natural, logrando un cabello suave con brillo y vitalidad. Reestructurante y anti-frizz, ideal para cabellos quebradizos y maltratados.', 'Reparación - Fortalecimiento - Anti-frizz - Reestructurante', 'Cabello dañado - Quebradizo - Maltratado', 'Aplicar sobre el cabello húmedo y masajear suavemente el cuero cabelludo hasta formar espuma. Enjuagar con abundante agua. Repetir si es necesario.', false, true, '/img/keratina-shampoo.webp', false, false),
('Keratina Revitalize', 'Máscara Keratina Revitalize', 'Máscara', '4', '[{"tamanio":"1000 gr","precio":13755.28},{"tamanio":"270 gr","precio":5989.5}]'::jsonb, 'Devuelve la vitalidad, suavidad y brillo al cabello dañado. Su fórmula anti-frizz reestructura la fibra capilar, sellándola con su pH más ácido.', 'Reparación - Reestructuración - Anti-frizz - Flexibilidad', 'Cabello dañado - Frizz - Quebradizo', 'Luego del shampoo, retirar el exceso de agua y aplicar de medios a puntas. Peinar para distribuir, dejar actuar de 5 a 10 minutos y enjuagar.', true, true, '/img/keratina-mascara.webp', false, false),
('Keratina Revitalize', 'Ampollas Keratina Revitalize', 'Ampollas', '-', '[{"tamanio":"Caja x 12 u","precio":22385}]'::jsonb, 'Reparación profunda para cabello tratado, con frizz o quebradizo.', 'Reparación - Fortalecimiento', 'Cabello dañado', 'Luego del shampoo, sobre el cabello húmedo, aplicar el contenido de una ampolla de medios a puntas (o en el cuero cabelludo en tratamientos anticaída). Masajear y dejar actuar 10 minutos; enjuagar. Uso semanal o según indicación profesional.', false, true, '/img/keratina-ampollas.webp', false, false),
('Neutro Balance', 'Shampoo Neutro Balance', 'Shampoo', '7', '[{"tamanio":"1000 ml","precio":11495},{"tamanio":"250 ml","precio":4295.5}]'::jsonb, 'Limpieza profunda para todo tipo de cabellos, especialmente cueros cabelludos sensibles. Mantiene el color en los lavados.', 'Limpieza profunda - pH neutro - Cuida el color', 'Todos los tipos de cabello - Cueros cabelludos sensibles', 'Aplicar sobre el cabello húmedo y masajear suavemente el cuero cabelludo hasta formar espuma. Enjuagar con abundante agua. Repetir si es necesario.', false, true, '/img/neutro-shampoo.webp', false, false),
('Extra Acida Intense', 'Máscara Extra Ácida Intense', 'Máscara', '3,5', '[{"tamanio":"1000 gr","precio":9075},{"tamanio":"270 gr","precio":4295.5}]'::jsonb, 'Desarrollada para aplicar luego de la coloración en crema. Gracias a su pH extra ácido restaura el cabello en su totalidad, sella la fibra capilar y fija el color. Hidratación profunda y gran poder desenredante.', 'Restauración post-color - Sellado fibra capilar - Fijación color - Hidratación profunda - Desenredante', 'Post-coloración - Cabello coloreado', 'Inmediatamente después de enjuagar la coloración en crema, retirar el exceso de agua y aplicar de medios a puntas. Dejar actuar de 5 a 10 minutos y enjuagar con agua tibia o fría para sellar la cutícula.', false, true, '/img/extra-mascara.webp', false, false);
