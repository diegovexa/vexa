// Preguntas frecuentes (/preguntas-frecuentes). El texto vive en data/faq.js.
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { SiteHeader, SiteFooter, WA_URL } from "../components/SiteChrome";
import { FAQ, parseLinks } from "../data/faq";
import { getComboPct, getTiers } from "../data/pricing";
import { useApp } from "../context/AppContext";
import { FAQ_META, setPageMeta } from "../data/seo";
import "../styles/landing.css";

function ConLinks({ texto }) {
  return parseLinks(texto).map((parte, i) =>
    parte.href ? <Link key={i} to={parte.href}>{parte.text}</Link> : <span key={i}>{parte.text}</span>
  );
}

export default function Preguntas() {
  const { config } = useApp();
  const tiers = getTiers(config);
  const comboPct = getComboPct(config);

  useEffect(() => { window.scrollTo(0, 0); setPageMeta(FAQ_META); }, []);

  return (
    <div className="site">
      <SiteHeader />

      <section className="line-hero faq-hero">
        <div className="line-hero-glow" aria-hidden="true" />
        <div className="line-hero-inner faq-hero-inner">
          <div className="line-hero-copy">
            <Link to="/" className="back-link">← Inicio</Link>
            <span className="eyebrow">Ayuda</span>
            <h1>Preguntas frecuentes</h1>
            <p className="hero-lead">
              Qué producto elegir para cada necesidad del cabello, cómo se usan y cómo comprar Vexa por mayor.
            </p>
          </div>
        </div>
      </section>

      {FAQ.map((g) => (
        <section key={g.grupo} className="section faq-group">
          <h2 className="faq-group-title">{g.grupo}</h2>
          <div className="faq-list">
            {g.items.map((item) => (
              <details key={item.q} className="faq-item">
                <summary>{item.q}</summary>
                <div className="faq-answer">
                  <p><ConLinks texto={item.a} /></p>
                  {item.id === "descuentos" && (
                    <ul className="tiers">
                      {tiers.map((t) => (
                        <li key={t.min}><strong>-{t.pct}%</strong><span>desde {t.min} unidades</span></li>
                      ))}
                      {comboPct > 0 && (
                        <li className="tier-combo"><strong>-{comboPct}%</strong><span>en el tratamiento completo de cada línea</span></li>
                      )}
                    </ul>
                  )}
                </div>
              </details>
            ))}
          </div>
        </section>
      ))}

      <section className="section faq-cta">
        <div className="next-line faq-cta-card">
          <span>¿Te quedó otra duda?</span>
          <strong>Escribinos por WhatsApp</strong>
          <div className="hero-ctas">
            <a href={WA_URL} target="_blank" rel="noreferrer" className="btn btn-accent">Consultar por WhatsApp</a>
            <Link to="/catalogo" className="btn btn-ghost">Ir al catálogo</Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
