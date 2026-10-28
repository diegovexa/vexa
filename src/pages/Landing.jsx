import { useState } from "react";
import { Link } from "react-router-dom";
import { SiteHeader, SiteFooter, WA_URL, scrollToId } from "../components/SiteChrome";
import ProductImage from "../components/ProductImage";
import { BRAND, LINEAS_INFO, img, getLineaByKey } from "../data/lineas";
import { LANZAMIENTOS } from "../data/localProducts";
import { formatPrice, minPrice } from "../data/store";
import { getComboPct, getTiers } from "../data/pricing";
import { useApp } from "../context/AppContext";
import "../styles/landing.css";

// Escala de pH de cada producto (PDF "Vexa Enero 2026")
const PH_POINTS = [
  { ph: 3.5, label: "Máscara Extra Ácida", slug: "extra-acida-intense" },
  { ph: 4, label: "Máscaras Biotina y Keratina", slug: "biotina-therapy" },
  { ph: 5, label: "Shampoos Biotina y Keratina · Máscara Argan", slug: "keratina-revitalize" },
  { ph: 5.5, label: "Shampoo Argan", slug: "argan-recovery" },
  { ph: 7, label: "Shampoo Neutro", slug: "neutro-balance" },
];
const PH_MIN = 3;
const PH_MAX = 7.5;

const RITUAL = [
  { n: "01", t: "Shampoo", d: "Limpia y prepara la fibra según la necesidad de cada cabello.", f: "1000 ml · 250 ml", i: "keratina-shampoo" },
  { n: "02", t: "Máscara", d: "Trata en profundidad y sella la cutícula con pH ácido.", f: "1000 gr · 270 gr", i: "keratina-mascara" },
  { n: "03", t: "Ampollas", d: "Shock intensivo para potenciar el resultado del tratamiento.", f: "Caja x 12 unidades", i: "keratina-ampollas" },
];

function LineFinder() {
  const [active, setActive] = useState(LINEAS_INFO[0].slug);
  const l = LINEAS_INFO.find((x) => x.slug === active);

  return (
    <div className="finder" style={{ "--accent": l.color, "--soft": l.soft }}>
      <div className="finder-chips" role="tablist">
        {LINEAS_INFO.map((x) => (
          <button
            key={x.slug}
            role="tab"
            aria-selected={x.slug === active}
            className={`finder-chip ${x.slug === active ? "is-active" : ""}`}
            style={{ "--accent": x.color }}
            onClick={() => setActive(x.slug)}
          >
            {x.necesidad}
          </button>
        ))}
      </div>

      <div className="finder-result" key={l.slug}>
        <div className="finder-media">
          <img src={img(l.destacado)} alt={l.nombre} />
        </div>
        <div className="finder-copy">
          <span className="eyebrow">Te recomendamos</span>
          <h3>{l.nombre}</h3>
          <p>{l.descripcion}</p>
          <ul className="tag-list">
            {l.beneficios.map((b) => <li key={b}>{b}</li>)}
          </ul>
          <Link to={`/linea/${l.slug}`} className="btn btn-accent">Ver la línea {l.nombre} →</Link>
        </div>
      </div>
    </div>
  );
}

function BestSellers({ products }) {
  const top = products.filter((p) => p.active && p.destacado && p.variantes?.length);
  if (!top.length) return null;

  return (
    <section className="section" id="mas-vendidos">
      <div className="section-head section-head-row">
        <div>
          <span className="eyebrow">Los favoritos de los salones</span>
          <h2>Más vendidos</h2>
        </div>
        <Link to="/catalogo" className="btn btn-ghost">Ver todo el catálogo</Link>
      </div>
      <div className="best-grid">
        {top.map((p) => {
          const linea = getLineaByKey(p.linea);
          return (
            <Link
              key={p.id}
              to={`/catalogo?linea=${encodeURIComponent(p.linea)}`}
              className="best-card"
              style={{ "--accent": linea?.color }}
            >
              <div className="best-media">
                <ProductImage product={p} />
                <span className="best-rank">★ Más vendido</span>
              </div>
              <div className="best-body">
                <span className="best-line">{linea?.nombre || p.linea}</span>
                <h3>{p.producto}</h3>
                <span className="best-sizes">{p.variantes.map((v) => v.tamanio).join(" · ")}</span>
                <div className="best-foot">
                  <span>
                    {p.variantes.length > 1 && <small>desde </small>}
                    <strong>{formatPrice(minPrice(p))}</strong>
                  </span>
                  <span className="best-cta">Comprar →</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default function Landing() {
  const { products, config } = useApp();
  const comboPct = getComboPct(config);
  const tiers = getTiers(config);

  return (
    <div className="site">
      <SiteHeader />

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" aria-hidden="true" />
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">{BRAND.claim}</span>
            <h1>
              Cada cabello,<br />
              su <em>tratamiento</em>.
            </h1>
            <p className="hero-lead">
              Vexa Hair Evolution reúne cinco líneas de shampoo, máscara y ampollas formuladas por pH,
              para resolver cada necesidad del cabello en el salón y en casa.
            </p>
            <div className="hero-ctas">
              <Link to="/catalogo" className="btn btn-light">Ver catálogo mayorista</Link>
              <button className="btn btn-ghost" onClick={() => scrollToId("lineas")}>Conocé las líneas</button>
            </div>

            {comboPct > 0 && (
              <Link to="/catalogo?vista=combos" className="combo-cta">
                <span className="combo-cta-pct">-{comboPct}%</span>
                <span className="combo-cta-text">
                  <strong>Comprando el tratamiento completo tenés {comboPct}% de descuento</strong>
                  <small>Shampoo + máscara + ampollas de la misma línea</small>
                </span>
                <span className="combo-cta-arrow" aria-hidden="true">→</span>
              </Link>
            )}
          </div>
          <div className="hero-media">
            <img src={img("hero-lineup")} alt="Línea completa Vexa: shampoo, máscaras y ampollas" />
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...LINEAS_INFO, ...LINEAS_INFO].map((l, i) => (
            <span key={i} style={{ "--accent": l.color }}><i />{l.nombre}</span>
          ))}
        </div>
      </div>

      <BestSellers products={products} />

      {/* LÍNEAS */}
      <section className="section" id="lineas">
        <div className="section-head">
          <span className="eyebrow">Las líneas</span>
          <h2>Cinco fórmulas, un mismo estándar profesional.</h2>
          <p>Cada línea tiene su color, su pH y su objetivo. Elegí por necesidad y combiná shampoo, máscara y ampollas.</p>
        </div>

        <div className="lines-grid">
          {LINEAS_INFO.map((l, i) => (
            <Link
              to={`/linea/${l.slug}`}
              key={l.slug}
              className={`line-card ${i === 0 ? "is-wide" : ""}`}
              style={{ "--accent": l.color }}
            >
              <img src={img(l.hero)} alt={l.nombre} loading="lazy" />
              <div className="line-card-body">
                <span className="line-card-ph">pH {l.ph}</span>
                <h3>{l.nombre}</h3>
                <p>{l.claim}</p>
                <span className="line-card-more">Descubrir →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* LANZAMIENTOS */}
      <section className="section section-alt" id="lanzamientos">
        <div className="section-head">
          <span className="eyebrow">Nuevo</span>
          <h2>Protectores térmicos: protección que potencia.</h2>
          <p>Heat shield hasta 230 °C, sin enjuague y aptos para uso diario. Cuidan el cabello antes del secador, la planchita o la buclera.</p>
        </div>
        <div className="launch-grid">
          {LANZAMIENTOS.map((l) => (
            <article key={l.nombre} className="launch-card" style={{ "--accent": l.color }}>
              <img src={img(l.image)} alt={l.nombre} loading="lazy" />
              <div className="launch-body">
                <span className="launch-tag">{l.disponible ? "Ya disponible" : "Próximamente"}</span>
                <h3>{l.nombre}</h3>
                <p>{l.detalle}</p>
                {l.disponible ? (
                  <Link to={l.link} className="btn btn-light">Comprar</Link>
                ) : (
                  <a href={WA_URL} target="_blank" rel="noreferrer" className="btn btn-ghost">Consultar por WhatsApp</a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* FINDER */}
      <section className="section" id="encontra">
        <div className="section-head">
          <span className="eyebrow">Encontrá tu tratamiento</span>
          <h2>¿Qué necesita tu cabello?</h2>
        </div>
        <LineFinder />
      </section>

      {/* RITUAL */}
      <section className="section section-alt">
        <div className="section-head">
          <span className="eyebrow">El ritual Vexa</span>
          <h2>Tres pasos para un resultado profesional.</h2>
          <p>Cada producto trae su modo de uso en la página de su línea y en el catálogo.</p>
        </div>
        <ol className="ritual">
          {RITUAL.map((r) => (
            <li key={r.n}>
              <div className="ritual-media"><img src={img(r.i)} alt={r.t} loading="lazy" /></div>
              <span className="ritual-n">{r.n}</span>
              <h3>{r.t}</h3>
              <p>{r.d}</p>
              <span className="ritual-f">{r.f}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* PH */}
      <section className="section">
        <div className="section-head">
          <span className="eyebrow">Ciencia del pH</span>
          <h2>Formulados para sellar, no solo para limpiar.</h2>
          <p>
            Un pH ácido cierra la cutícula, fija el color y devuelve el brillo. Por eso cada producto Vexa tiene
            un pH pensado para su función: de 7 en la limpieza a 3,5 en el sellado post-color.
          </p>
        </div>
        <div className="ph-scale">
          <div className="ph-bar" />
          {PH_POINTS.map((p) => {
            const l = LINEAS_INFO.find((x) => x.slug === p.slug);
            const left = ((p.ph - PH_MIN) / (PH_MAX - PH_MIN)) * 100;
            return (
              <div key={p.ph} className="ph-point" style={{ left: `${left}%`, "--accent": l.color }}>
                <span className="ph-dot" />
                <strong>{String(p.ph).replace(".", ",")}</strong>
                <small>{p.label}</small>
              </div>
            );
          })}
          <div className="ph-legend"><span>Más ácido · sella y fija</span><span>Neutro · limpia</span></div>
        </div>
      </section>

      {/* MAYORISTAS */}
      <section className="section wholesale" id="mayoristas">
        <div className="wholesale-media">
          <img src={img("hero-salon")} alt="Productos Vexa en el lavatorio de un salón" loading="lazy" />
        </div>
        <div className="wholesale-copy">
          <span className="eyebrow">Para profesionales y revendedores</span>
          <h2>Cuanto más llevás, menos pagás.</h2>
          <p>
            Armá tu pedido desde el catálogo online mezclando los productos que quieras y envialo por WhatsApp.
            Te respondemos con disponibilidad y forma de entrega.
          </p>
          <ul className="tiers">
            {tiers.map((t) => (
              <li key={t.min}><strong>-{t.pct}%</strong><span>desde {t.min} unidades</span></li>
            ))}
            {comboPct > 0 && (
              <li className="tier-combo"><strong>-{comboPct}%</strong><span>en el tratamiento completo de cada línea</span></li>
            )}
          </ul>
          <div className="hero-ctas">
            <Link to="/catalogo" className="btn btn-light">Ir al catálogo</Link>
            <a href={WA_URL} target="_blank" rel="noreferrer" className="btn btn-ghost">Escribinos por WhatsApp</a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
