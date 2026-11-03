// Vitrina animada: un producto por línea; cada uno entra desde la derecha empujando al anterior.
// La usan el hero del inicio y el del catálogo. Cada uno pone sus textos con renderCopy
// y ubica las piezas con las variables --ps-* (ver showcase.css).
import { useEffect, useRef, useState } from "react";
import { img, getLineaByKey } from "../data/lineas";
import { LINEAS } from "../data/store";
import "../styles/showcase.css";

const SLIDE_MS = 3400;

export default function ProductShowcase({ className = "", renderCopy, label = "Líneas Vexa" }) {
  const slides = LINEAS.map(getLineaByKey).filter(l => l?.destacado);
  const n = slides.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const drag = useRef(null);
  const swiped = useRef(false);
  const rootRef = useRef(null);

  // Ajusta cada nombre de fondo para que ocupe justo el ancho de la vitrina
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const fit = () => {
      const target = el.clientWidth - 24;
      el.querySelectorAll(".ps-word").forEach(w => {
        const size = parseFloat(getComputedStyle(w).fontSize);
        if (w.scrollWidth) w.style.fontSize = `${size * target / w.scrollWidth}px`;
      });
    };
    fit();
    document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (paused || n < 2) return;
    const t = setTimeout(() => setActive(a => (a + 1) % n), SLIDE_MS);
    return () => clearTimeout(t);
  }, [active, paused, n]);

  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const go = (d) => setActive(a => (a + d + n) % n);

  function onPointerDown(e) {
    drag.current = { x: e.clientX, y: e.clientY };
    swiped.current = false;
    setPaused(true);
  }
  function onPointerUp(e) {
    const start = drag.current;
    drag.current = null;
    setPaused(false);
    if (!start) return;
    const dx = e.clientX - start.x;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - start.y)) {
      swiped.current = true;
      go(dx < 0 ? 1 : -1);
    }
  }

  return (
    <section
      ref={rootRef}
      className={`ps ${className}`}
      aria-roledescription="carrusel"
      aria-label={label}
      style={{ "--ps-accent": slides[active]?.color }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => { drag.current = null; setPaused(false); }}
    >
      <div className="ps-glow" aria-hidden="true" />
      {slides.map((l, i) => {
        // Distancia al slide activo, envuelta para que el carrusel sea infinito
        let off = i - active;
        if (off > n / 2) off -= n;
        if (off < -n / 2) off += n;
        const pos = off === 0 ? "is-active" : off === 1 ? "is-next" : off === -1 ? "is-prev" : "is-far";
        const word = l.nombre.split(" ")[0];
        return (
          <div
            key={l.key}
            className={`ps-slide ${pos}`}
            style={{ "--off": off, "--accent": l.color }}
            aria-hidden={off !== 0}
          >
            <span className="ps-word" aria-hidden="true" style={{ "--chars": word.length }}>{word}</span>
            {renderCopy?.(l, i, n, off === 0)}
            {/* Tocar el producto pasa al siguiente sin esperar */}
            <div className="ps-stage" onClick={() => { if (!swiped.current) go(1); }}>
              <img className="ps-product" src={img(l.destacado)} alt={off === 0 ? l.nombre : ""} draggable="false" />
            </div>
          </div>
        );
      })}

      <div className="ps-dots">
        {slides.map((l, i) => (
          <button
            key={l.key}
            className={`ps-dot ${i === active ? "is-active" : ""} ${paused ? "is-paused" : ""}`}
            style={{ "--accent": l.color, "--dur": `${SLIDE_MS}ms` }}
            aria-label={`Ver ${l.nombre}`}
            aria-current={i === active}
            onPointerDown={e => e.stopPropagation()}
            onClick={() => setActive(i)}
          >
            <i key={i === active ? active : "idle"} />
          </button>
        ))}
      </div>
    </section>
  );
}
