// Página de cada producto (/producto/protector-termico-colageno-anti-age): misma estética que la
// página de su línea, con el color de la línea. Existe para que Google y los asistentes de IA
// puedan mostrar un producto puntual cuando alguien lo busca.
import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { SiteHeader, SiteFooter } from "../components/SiteChrome";
import ProductImage from "../components/ProductImage";
import { getLineaByKey, conRecorte } from "../data/lineas";
import { formatPrice, minPrice, SELLER_PHONE } from "../data/store";
import { useApp } from "../context/AppContext";
import { productoSlug, productoPath, productoMeta, setPageMeta } from "../data/seo";
import "../styles/landing.css";

const lista = (s) => String(s || "").split(" - ").map((x) => x.trim()).filter(Boolean);

export default function Producto() {
  const { slug } = useParams();
  const { products, loading } = useApp();
  const raw = products.find((p) => p.active && productoSlug(p.producto) === slug);

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);
  useEffect(() => { if (raw) setPageMeta(productoMeta(raw)); }, [raw]);

  if (!raw) {
    return loading
      ? <div className="site"><SiteHeader /></div>
      : <Navigate to="/catalogo" replace />;
  }

  const p = conRecorte(raw);
  const linea = getLineaByKey(p.linea);
  const hermanos = products.filter((x) => x.active && x.linea === p.linea && x.id !== p.id).map(conRecorte);
  const comprar = `/catalogo?linea=${encodeURIComponent(p.linea)}&tipo=${encodeURIComponent(p.tipo)}`;
  const waUrl = `https://wa.me/${SELLER_PHONE}?text=${encodeURIComponent(`Hola! Quiero información para comprar ${p.producto} por mayor.`)}`;
  const indicaciones = lista(p.indicaciones);

  return (
    <div className="site" style={{ "--accent": linea?.color, "--soft": linea?.soft }}>
      <SiteHeader />

      <section className="line-hero">
        <div className="line-hero-glow" aria-hidden="true" />
        <div className="line-hero-inner">
          <div className="line-hero-copy">
            {linea && <Link to={`/linea/${linea.slug}`} className="back-link">← Línea {linea.nombre}</Link>}
            <span className="eyebrow">
              {linea?.nombre || p.linea} · {p.tipo}{p.ph && p.ph !== "-" ? ` · pH ${p.ph}` : ""}
            </span>
            <h1 className="product-title">{p.producto}</h1>
            <p className="hero-lead">{p.descripcion}</p>
            {p.beneficios && (
              <ul className="tag-list">
                {lista(p.beneficios).map((b) => <li key={b}>{b}</li>)}
              </ul>
            )}
            <div className="product-prices product-prices-lg">
              {p.variantes.map((v) => (
                <span key={v.tamanio}>{v.tamanio}<b>{formatPrice(v.precio)}</b></span>
              ))}
            </div>
            <div className="hero-ctas">
              <Link to={comprar} className="btn btn-accent">Comprar por mayor</Link>
              <a href={waUrl} target="_blank" rel="noreferrer" className="btn btn-ghost">Consultar por WhatsApp</a>
            </div>
          </div>
          <div className="product-hero-media">
            <ProductImage product={p} />
            {p.nuevo && <span className="soon-badge">Nuevo</span>}
          </div>
        </div>
      </section>

      {(p.modo_uso || indicaciones.length > 0) && (
        <section className="section product-facts">
          {p.modo_uso && (
            <div className="fact-card fact-card-wide">
              <span className="eyebrow">Modo de uso</span>
              <p>{p.modo_uso}</p>
            </div>
          )}
          {indicaciones.length > 0 && (
            <div className="fact-card">
              <span className="eyebrow">Indicado para</span>
              <ul className="tag-list tag-list-sm">
                {indicaciones.map((i) => <li key={i}>{i}</li>)}
              </ul>
            </div>
          )}
          {linea && (
            <div className="fact-card">
              <span className="eyebrow">La línea</span>
              <p><strong>{linea.nombre}</strong> · {linea.claim}</p>
              <Link to={`/linea/${linea.slug}`} className="fact-link">Ver la línea completa →</Link>
            </div>
          )}
        </section>
      )}

      {hermanos.length > 0 && (
        <section className="section section-alt">
          <div className="section-head">
            <span className="eyebrow">Completá el tratamiento</span>
            <h2>Más de {linea?.nombre || p.linea}</h2>
          </div>
          <div className="best-grid">
            {hermanos.map((h) => (
              <Link key={h.id} to={productoPath(h)} className="best-card">
                <div className="best-media"><ProductImage product={h} /></div>
                <div className="best-body">
                  <span className="best-line">{h.tipo}</span>
                  <h3>{h.producto}</h3>
                  <span className="best-sizes">{h.variantes.map((v) => v.tamanio).join(" · ")}</span>
                  <div className="best-foot">
                    <span>
                      {h.variantes.length > 1 && <small>desde </small>}
                      <strong>{formatPrice(minPrice(h))}</strong>
                    </span>
                    <span className="best-cta">Ver →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}
