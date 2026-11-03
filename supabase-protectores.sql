-- Agrega los protectores térmicos (Biotina y Colágeno) si todavía no están cargados
-- y les pone la foto nueva (frasco de 200 ml + 100 ml).
-- Correr en Supabase → SQL Editor → Run. Se puede correr más de una vez sin duplicar.

INSERT INTO productos (linea, producto, tipo, ph, variantes, descripcion, beneficios, indicaciones, modo_uso, destacado, active, image_url, foto, nuevo)
SELECT 'Biotina Therapy', 'Protector térmico Biotina Therapy', 'Protector térmico', '-', '[{"tamanio":"200 ml","precio":24200},{"tamanio":"100 ml","precio":12210}]'::jsonb, 'Protector térmico con biotina y pantenol. Heat shield hasta 230 °C, sin enjuague y apto para uso diario: protege y fortalece el cabello antes del secador o la planchita.', 'Protege hasta 230 °C - Biotina y pantenol - Sin enjuague - Apto uso diario', 'Antes de secador - Planchita - Buclera', 'Sobre el cabello limpio, húmedo o seco, pulverizar a 20 cm de medios a puntas antes del secador, la planchita o la buclera. Peinar para distribuir. No enjuagar.', false, true, '/img/biotina-protector-foto.webp', true, true
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE producto = 'Protector térmico Biotina Therapy');

INSERT INTO productos (linea, producto, tipo, ph, variantes, descripcion, beneficios, indicaciones, modo_uso, destacado, active, image_url, foto, nuevo)
SELECT 'Colágeno Anti Age', 'Protector térmico Colágeno Anti Age', 'Protector térmico', '-', '[{"tamanio":"200 ml","precio":24200},{"tamanio":"100 ml","precio":12210}]'::jsonb, 'Protector térmico anti age con colágeno y elastina. Protege el cabello del calor hasta 230 °C, repara y potencia su brillo. Sin enjuague, de uso profesional.', 'Protege hasta 230 °C - Colágeno y elastina - Brillo y suavidad - Fortalece y repara', 'Antes de secador - Planchita - Buclera', 'Sobre el cabello limpio, húmedo o seco, pulverizar a 20 cm de medios a puntas antes del secador, la planchita o la buclera. Peinar para distribuir. No enjuagar.', false, true, '/img/colageno-protector-foto.webp', true, true
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE producto = 'Protector térmico Colágeno Anti Age');

-- Si ya estaban cargados con el recorte anterior, pasarlos a la foto nueva
UPDATE productos SET image_url = '/img/biotina-protector-foto.webp', foto = true
WHERE producto = 'Protector térmico Biotina Therapy' AND image_url = '/img/biotina-protector.webp';

UPDATE productos SET image_url = '/img/colageno-protector-foto.webp', foto = true
WHERE producto = 'Protector térmico Colágeno Anti Age' AND image_url = '/img/colageno-protector.webp';
