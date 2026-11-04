// Plugin de Vite (solo en el build): el sitio es una app React y su HTML llega vacío
// a Google y a los asistentes de IA (ChatGPT, Claude, Perplexity…), que muchas veces
// no ejecutan JavaScript. Este plugin escribe en dist/:
//   - index.html, catalogo/index.html y linea/<slug>/index.html con título, descripción,
//     Open Graph, datos estructurados y el contenido de productos en HTML plano
//   - sitemap.xml y llms.txt
// Los datos salen de src/data (lineas.js, localProducts.js), los mismos que usa la app.
// Al cargar la página, React reemplaza ese contenido por la app normal.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'vite';

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const lista = (s) => String(s || '').split(' - ').map((x) => x.trim()).filter(Boolean);
const tamanios = (p) => (p.variantes || []).map((v) => v.tamanio).join(' · ');

async function loadData(root) {
  const server = await createServer({
    root,
    configFile: false,
    logLevel: 'error',
    appType: 'custom',
    server: { middlewareMode: true, hmr: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    const lineas = await server.ssrLoadModule('/src/data/lineas.js');
    const productos = await server.ssrLoadModule('/src/data/localProducts.js');
    const store = await server.ssrLoadModule('/src/data/store.js');
    const seo = await server.ssrLoadModule('/src/data/seo.js');
    return { ...lineas, ...productos, ...store, ...seo };
  } finally {
    await server.close();
  }
}

export default function seoPrerender() {
  let root;
  let outDir;
  return {
    name: 'vexa-seo-prerender',
    apply: 'build',
    configResolved(config) {
      root = config.root;
      outDir = path.resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      const d = await loadData(root);
      const { SITE_URL, SITE_NAME, BRAND, LINEAS_INFO, LOCAL_PRODUCTS, TIPOS, SELLER_PHONE } = d;
      const waUrl = `https://wa.me/${SELLER_PHONE}`;
      const telefono = `+${SELLER_PHONE}`;
      const productosDe = (linea) =>
        LOCAL_PRODUCTS.filter((p) => p.active && p.linea === linea.key).sort(
          (a, b) => TIPOS.indexOf(a.tipo) - TIPOS.indexOf(b.tipo)
        );
      const abs = (p) => SITE_URL + p;
      const ogImage = abs('/og-vexa.jpg');

      // ---------- Datos estructurados (schema.org) ----------
      const organization = {
        '@type': 'Organization',
        '@id': abs('/#organization'),
        name: SITE_NAME,
        alternateName: 'Vexa',
        url: abs('/'),
        logo: abs('/img/logo-black.webp'),
        image: ogImage,
        description: `${BRAND.claim}. Tratamientos capilares por línea para salones y reventa, con venta mayorista.`,
        areaServed: 'AR',
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: telefono,
          contactType: 'sales',
          availableLanguage: 'es',
          url: waUrl,
        },
        brand: { '@type': 'Brand', name: 'Vexa', slogan: BRAND.tagline },
      };
      const website = {
        '@type': 'WebSite',
        '@id': abs('/#website'),
        url: abs('/'),
        name: SITE_NAME,
        inLanguage: 'es-AR',
        publisher: { '@id': abs('/#organization') },
      };
      const breadcrumb = (items) => ({
        '@type': 'BreadcrumbList',
        itemListElement: items.map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(url) })),
      });

      // ---------- Bloques de contenido en HTML plano ----------
      const productoHtml = (p, conUso) => `
        <article>
          <h3>${esc(p.producto)}</h3>
          <p>${esc(p.descripcion)}</p>
          <ul>
            <li><strong>Tipo:</strong> ${esc(p.tipo)}</li>
            ${tamanios(p) ? `<li><strong>Presentaciones:</strong> ${esc(tamanios(p))}</li>` : ''}
            ${p.ph && p.ph !== '-' ? `<li><strong>pH:</strong> ${esc(p.ph)}</li>` : ''}
            ${p.beneficios ? `<li><strong>Beneficios:</strong> ${esc(lista(p.beneficios).join(', '))}</li>` : ''}
            ${p.indicaciones ? `<li><strong>Indicado para:</strong> ${esc(lista(p.indicaciones).join(', '))}</li>` : ''}
            ${conUso && p.modo_uso ? `<li><strong>Modo de uso:</strong> ${esc(p.modo_uso)}</li>` : ''}
          </ul>
        </article>`;

      const lineaHtml = (l, nivel, conUso) => {
        const h = nivel === 1 ? 'h1' : 'h2';
        return `
        <section>
          <${h}>${nivel === 1 ? esc(l.nombre) : `<a href="/linea/${l.slug}">${esc(l.nombre)}</a>`} — ${esc(l.necesidad)}</${h}>
          <p><strong>${esc(l.claim)}</strong></p>
          <p>${esc(l.descripcion)}</p>
          <ul>
            <li><strong>Para:</strong> ${esc(l.para)}</li>
            ${l.ph ? `<li><strong>pH:</strong> ${esc(l.ph)}</li>` : ''}
            <li><strong>Claves:</strong> ${esc(l.beneficios.join(', '))}</li>
          </ul>
          ${productosDe(l).map((p) => productoHtml(p, conUso)).join('')}
        </section>`;
      };

      const comoComprar = `
        <section>
          <h2>Cómo comprar</h2>
          <p>Vexa vende por mayor a peluquerías, salones y revendedores. Armá el pedido en el
          <a href="/catalogo">catálogo mayorista</a> (precios por presentación y descuento por tratamiento completo)
          y envialo por WhatsApp, o escribinos directamente al <a href="${waUrl}">${esc(telefono)}</a>.</p>
        </section>`;

      const nav = `
        <nav>
          <a href="/">Inicio</a> · <a href="/catalogo">Catálogo mayorista</a> ·
          ${LINEAS_INFO.map((l) => `<a href="/linea/${l.slug}">${esc(l.nombre)}</a>`).join(' · ')}
        </nav>`;

      // ---------- Páginas ----------
      const pages = [
        {
          url: '/',
          file: 'index.html',
          meta: d.HOME_META,
          jsonld: [organization, website],
          body: `
            <header><h1>Vexa Hair Evolution — ${esc(BRAND.claim)}</h1>
            <p>Vexa es una marca de cosmética capilar profesional con tratamientos por línea para cada necesidad del cabello:
            brillo, caída, daño y frizz, cuero cabelludo sensible, post-coloración y protección térmica.
            Shampoo, máscara, ampollas y protector térmico pensados para salones y reventa, con venta mayorista.</p></header>
            ${nav}
            ${LINEAS_INFO.map((l) => lineaHtml(l, 2, false)).join('')}
            ${comoComprar}`,
        },
        {
          url: '/catalogo',
          file: 'catalogo/index.html',
          meta: d.CATALOGO_META,
          jsonld: [organization, website, breadcrumb([['Inicio', '/'], ['Catálogo mayorista', '/catalogo']])],
          body: `
            <header><h1>Catálogo mayorista Vexa</h1>
            <p>Todos los productos capilares profesionales de Vexa, por línea. Los precios mayoristas actualizados
            se ven en el catálogo interactivo de esta página.</p></header>
            ${nav}
            ${LINEAS_INFO.map((l) => lineaHtml(l, 2, true)).join('')}
            ${comoComprar}`,
        },
        ...LINEAS_INFO.map((l) => ({
          url: `/linea/${l.slug}`,
          file: `linea/${l.slug}/index.html`,
          meta: d.lineaMeta(l),
          jsonld: [organization, website, breadcrumb([['Inicio', '/'], [l.nombre, `/linea/${l.slug}`]])],
          body: `${nav}${lineaHtml(l, 1, true)}${comoComprar}`,
        })),
      ];

      const template = await fs.readFile(path.join(outDir, 'index.html'), 'utf8');
      if (!template.includes('<div id="root"></div>')) throw new Error('[vexa-seo] index.html sin <div id="root"></div>');

      for (const page of pages) {
        const { title, description } = page.meta;
        const canonical = abs(page.url === '/' ? '/' : page.url);
        const head = `
    <link rel="canonical" href="${canonical}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${esc(SITE_NAME)}" />
    <meta property="og:locale" content="es_AR" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="alternate" type="text/markdown" title="Resumen para asistentes de IA" href="/llms.txt" />
    <script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': page.jsonld }).replace(/</g, '\\u003c')}</script>
  </head>`;
        const html = template
          .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
          .replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${esc(description)}" />`)
          .replace('</head>', head)
          .replace('<div id="root"></div>', `<div id="root"><div class="seo-static">${page.body}</div></div>`);
        const dest = path.join(outDir, page.file);
        await fs.mkdir(path.dirname(dest), { recursive: true });
        await fs.writeFile(dest, html);
      }

      // ---------- sitemap.xml ----------
      const hoy = new Date().toISOString().slice(0, 10);
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${abs(p.url)}</loc><lastmod>${hoy}</lastmod></url>`).join('\n')}
</urlset>
`;
      await fs.writeFile(path.join(outDir, 'sitemap.xml'), sitemap);

      // ---------- llms.txt (formato llmstxt.org) ----------
      const md = [
        `# ${SITE_NAME}`,
        '',
        `> Vexa es una marca de cosmética capilar profesional con tratamientos por línea para cada necesidad del cabello. Vende shampoo, máscara, ampollas y protector térmico por mayor a peluquerías, salones y revendedores. Sitio: ${SITE_URL}`,
        '',
        `Pedidos y consultas mayoristas: catálogo en ${abs('/catalogo')} o WhatsApp ${telefono} (${waUrl}). Los precios mayoristas se actualizan en el catálogo.`,
        '',
        '## Qué línea elegir según la necesidad del cabello',
        '',
        ...LINEAS_INFO.map((l) => `- [${l.nombre}](${abs(`/linea/${l.slug}`)}): ${l.necesidad}. ${l.claim} Para: ${l.para}.`),
        '',
        ...LINEAS_INFO.flatMap((l) => [
          `## ${l.nombre}`,
          '',
          `${l.descripcion}${l.ph ? ` pH ${l.ph}.` : ''}`,
          '',
          ...productosDe(l).map(
            (p) =>
              `- **${p.producto}** (${p.tipo}${tamanios(p) ? `; ${tamanios(p)}` : ''}): ${p.descripcion}` +
              (p.indicaciones ? ` Indicado para: ${lista(p.indicaciones).join(', ')}.` : '')
          ),
          '',
        ]),
        '## Páginas',
        '',
        `- [Inicio](${abs('/')}): presentación de la marca y sus líneas`,
        `- [Catálogo mayorista](${abs('/catalogo')}): todos los productos, precios por presentación y pedido por WhatsApp`,
        '',
      ].join('\n');
      await fs.writeFile(path.join(outDir, 'llms.txt'), md);

      console.log(`[vexa-seo] ${pages.length} páginas, sitemap.xml y llms.txt generados`);
    },
  };
}
