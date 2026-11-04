// Preguntas frecuentes. Las respuestas salen de la información del sitio (líneas, modos de uso,
// sección mayoristas); no agregar datos que la marca no haya confirmado (envíos, mínimos, pagos).
// Los links van como [texto](/ruta): los dibuja la página y el build los usa en el HTML y en llms.txt.
// id "descuentos": la página agrega debajo los porcentajes vigentes (config del admin).

export const FAQ = [
  {
    grupo: 'Elegir el tratamiento',
    items: [
      {
        q: '¿Qué productos Vexa sirven para la caída del cabello?',
        a: 'La línea [Biotina Therapy](/linea/biotina-therapy) reduce y previene la caída fortaleciendo la fibra desde la raíz hasta las puntas. Incluye shampoo, máscara de pH ácido (mantiene el color y es ideal después de alisados), ampollas que se pueden aplicar en el cuero cabelludo en tratamientos anticaída y un protector térmico con biotina y pantenol.',
      },
      {
        q: '¿Qué conviene para el cabello dañado, quebradizo o con frizz?',
        a: '[Keratina Revitalize](/linea/keratina-revitalize): repara y reestructura la fibra dañada, le devuelve flexibilidad y controla el frizz. Su máscara de pH ácido sella la cutícula.',
      },
      {
        q: '¿Qué uso después de teñir?',
        a: 'La [Máscara Extra Ácida Intense](/linea/extra-acida-intense), con pH 3,5: se aplica inmediatamente después de enjuagar la coloración en crema, sella la fibra, fija el color y aporta hidratación profunda.',
      },
      {
        q: '¿Tienen shampoo para cuero cabelludo sensible?',
        a: 'Sí, el shampoo [Neutro Balance](/linea/neutro-balance), de pH neutro (7): limpieza profunda para todo tipo de cabello, especialmente cueros cabelludos sensibles, que mantiene el color lavado tras lavado.',
      },
      {
        q: '¿Cuál es la línea de uso diario?',
        a: '[Argan Recovery](/linea/argan-recovery), para cabellos mixtos: el aceite de argán aporta elasticidad y resistencia, y el filtro UV y la vitamina E protegen la fibra y le devuelven el brillo.',
      },
      {
        q: '¿Tienen protector térmico?',
        a: 'Sí, dos: el [Protector térmico Biotina Therapy](/producto/protector-termico-biotina-therapy), con biotina y pantenol, y el [Protector térmico Colágeno Anti Age](/producto/protector-termico-colageno-anti-age), con colágeno y elastina. Los dos protegen hasta 230 °C, no llevan enjuague y vienen en 200 y 100 ml.',
      },
    ],
  },
  {
    grupo: 'Uso de los productos',
    items: [
      {
        q: '¿En qué orden se usan los productos?',
        a: 'Primero el shampoo, que limpia y prepara la fibra; después la máscara, que trata en profundidad y sella la cutícula, y por último las ampollas, un shock intensivo que potencia el resultado. El protector térmico va al final, antes del secador, la planchita o la buclera.',
      },
      {
        q: '¿Por qué importa el pH de cada producto?',
        a: 'Un pH ácido cierra la cutícula, fija el color y devuelve el brillo. Por eso cada producto Vexa tiene un pH pensado para su función: de 7 en la limpieza a 3,5 en el sellado post-color.',
      },
      {
        q: '¿Cómo se aplica el protector térmico?',
        a: 'Sobre el cabello limpio, húmedo o seco, se pulveriza a 20 cm de medios a puntas antes del secador, la planchita o la buclera, y se peina para distribuirlo. No se enjuaga.',
      },
      {
        q: '¿Qué presentaciones hay?',
        a: 'Shampoo en 1000 ml y 250 ml, máscara en 1000 g y 270 g, ampollas en caja de 12 unidades y protectores térmicos en 200 ml y 100 ml. El detalle de cada producto está en el [catálogo mayorista](/catalogo).',
      },
    ],
  },
  {
    grupo: 'Compras mayoristas',
    items: [
      {
        q: '¿Quién puede comprar Vexa por mayor?',
        a: 'Vexa vende por mayor a peluquerías, salones y revendedores de productos de belleza.',
      },
      {
        q: '¿Cómo hago un pedido?',
        a: 'Armá el pedido en el [catálogo mayorista](/catalogo) mezclando los productos que quieras y envialo por WhatsApp. Te respondemos con la disponibilidad y la forma de entrega.',
      },
      {
        id: 'descuentos',
        q: '¿Hay descuentos por cantidad?',
        a: 'Sí. El descuento crece según el total de unidades del pedido, y se pueden mezclar shampoos, máscaras, ampollas y protectores. Además, el tratamiento completo de cada línea (shampoo, máscara y ampollas) tiene un descuento propio.',
      },
      {
        q: '¿Cómo se coordina la entrega?',
        a: 'Al recibir tu pedido por WhatsApp te confirmamos la disponibilidad y coordinamos la forma de entrega.',
      },
    ],
  },
];

// "[texto](/ruta)" → partes { text, href } para dibujar links
export function parseLinks(texto) {
  const partes = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m;
  while ((m = re.exec(texto))) {
    if (m.index > last) partes.push({ text: texto.slice(last, m.index) });
    partes.push({ text: m[1], href: m[2] });
    last = re.lastIndex;
  }
  if (last < texto.length) partes.push({ text: texto.slice(last) });
  return partes;
}

export const sinLinks = (texto) => texto.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
