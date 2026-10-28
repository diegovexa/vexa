// Header y footer compartidos por la landing y las páginas de línea.
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BRAND, LINEAS_INFO, img } from "../data/lineas";
import { SELLER_PHONE } from "../data/store";

export const WA_URL = `https://wa.me/${SELLER_PHONE}?text=${encodeURIComponent(
  "Hola! Quiero información para comprar Vexa por mayor."
)}`;

export function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className={`site-header ${scrolled || open ? "is-solid" : ""}`}>
      <div className="site-header-inner">
        <Link to="/" className="site-logo" aria-label="Vexa inicio">
          <img src={img("logo-white")} alt="Vexa Hair Evolution" />
        </Link>

        <nav className={`site-nav ${open ? "is-open" : ""}`}>
          {LINEAS_INFO.map((l) => (
            <Link key={l.slug} to={`/linea/${l.slug}`} style={{ "--accent": l.color }}>
              <span className="dot" /> {l.nombre}
            </Link>
          ))}
          <Link to="/catalogo" className="site-nav-cta">Catálogo mayorista</Link>
        </nav>

        <button
          className="site-burger"
          aria-label="Abrir menú"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span /><span />
        </button>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <img src={img("logo-white")} alt="Vexa Hair Evolution" />
          <p>{BRAND.claim}. Tratamientos por línea para cada necesidad del cabello, pensados para salones y reventa.</p>
        </div>
        <div className="site-footer-col">
          <h4>Líneas</h4>
          {LINEAS_INFO.map((l) => (
            <Link key={l.slug} to={`/linea/${l.slug}`}>{l.nombre}</Link>
          ))}
        </div>
        <div className="site-footer-col">
          <h4>Comprar</h4>
          <Link to="/catalogo">Catálogo mayorista</Link>
          <Link to="/catalogo?vista=combos">Tratamientos completos</Link>
          <a href={WA_URL} target="_blank" rel="noreferrer">WhatsApp</a>
        </div>
      </div>
      <div className="site-footer-bottom">© {new Date().getFullYear()} Vexa · Hair Evolution</div>
    </footer>
  );
}
