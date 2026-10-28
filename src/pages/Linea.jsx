import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { SiteHeader, SiteFooter, WA_URL } from "../components/SiteChrome";
import ProductImage from "../components/ProductImage";
import { LINEAS_INFO, getLinea, img } from "../data/lineas";
import { formatPrice } from "../data/store";
import { useApp } from "../context/AppContext";
import "../styles/landing.css";

export default function Linea() {
  const { slug } = useParams();
  const linea = getLinea(slug);
  const { products } = useApp();

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  if (!linea) return <Navigate to="/" replace />;

  const productos = products.filter((p) => p.linea === linea.key && p.active);
  const idx = LINEAS_INFO.indexOf(linea);
  const next = LINEAS_INFO[(idx + 1) % LINEAS_INFO.length];

  return (
    <div className="site" style={{ "--accent": linea.color, "--soft": linea.soft }}>
      <SiteHeader />

      <section className="line-hero">
        <div className="line-hero-glow" aria-hidden="true" />
        <div className="line-hero-inner">
          <div className="line-hero-copy">
            <Link to="/" className="back-link">← Todas las líneas</Link>
            <span className="eyebrow">{linea.necesidad} · pH {linea.ph}</span>
            <h1>{linea.nombre}</h1>
            <p className="hero-lead">{linea.descripcion}</p>
            <ul className="tag-list">
              {linea.beneficios.map((b) => <li key={b}>{b}</li>)}
            </ul>
            <div className="hero-ctas">
              <Link to={`/catalogo?linea=${encodeURIComponent(linea.key)}`} className="btn btn-accent">
                Comprar {linea.nombre} por mayor
              </Link>
            </div>
          </div>
          <div className="line-hero-media">
            <img src={img(linea.hero)} alt={linea.nombre} />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <span className="eyebrow">Productos de la línea</span>
          <h2>Indicada para: {linea.para.toLowerCase()}.</h2>
        </div>

        <div className="products">
          {productos.map((p) => (
            <article key={p.id} className="product">
              <div className="product-media">
                <ProductImage product={p} />
                {p.nuevo && <span className="soon-badge">Nuevo</span>}
              </div>
              <div className="product-copy">
                <span className="product-kind">{p.tipo}</span>
                <h3>{p.producto}</h3>
                {p.ph && p.ph !== "-" && (
                  <dl className="product-specs"><div><dt>pH</dt><dd>{p.ph}</dd></div></dl>
                )}
                <div className="product-prices">
                  {p.variantes.map((v) => (
                    <span key={v.tamanio}>{v.tamanio}<b>{formatPrice(v.precio)}</b></span>
                  ))}
                </div>
                <p>{p.descripcion}</p>
                {p.beneficios && (
                  <ul className="tag-list tag-list-sm">
                    {p.beneficios.split(" - ").map((b) => <li key={b}>{b}</li>)}
                  </ul>
                )}
                {p.modo_uso && (
                  <details className="product-uso">
                    <summary>Modo de uso</summary>
                    <p>{p.modo_uso}</p>
                  </details>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {linea.set && (
        <section className="section line-band">
          <img src={img(linea.set)} alt={`Línea ${linea.nombre}`} loading="lazy" />
          <div className="line-band-copy">
            <span className="eyebrow">¿Tenés un salón o vendés productos de belleza?</span>
            <h2>Sumá {linea.nombre} a tu negocio.</h2>
            <p>Descuentos por cantidad y en el tratamiento completo. Armá el pedido online y confirmalo por WhatsApp.</p>
            <div className="hero-ctas">
              <Link to={`/catalogo?linea=${encodeURIComponent(linea.key)}`} className="btn btn-light">Ver precios</Link>
              <a href={WA_URL} target="_blank" rel="noreferrer" className="btn btn-ghost">Consultar por WhatsApp</a>
            </div>
          </div>
        </section>
      )}

      <Link to={`/linea/${next.slug}`} className="next-line" style={{ "--accent": next.color }}>
        <span>Siguiente línea</span>
        <strong>{next.nombre} →</strong>
      </Link>

      <SiteFooter />
    </div>
  );
}
