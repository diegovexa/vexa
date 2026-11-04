import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { createPortal } from "react-dom";
import { useApp } from "../context/AppContext";
import { formatPrice, SELLER_PHONE, LINEAS, TIPOS } from "../data/store";
import { buildCombos, computeCart } from "../data/pricing";
import { img, getLineaByKey, conRecorte } from "../data/lineas";
import ProductImage from "../components/ProductImage";
import ProductShowcase from "../components/ProductShowcase";
import { SiteFooter } from "../components/SiteChrome";
import { CATALOGO_META, setPageMeta } from "../data/seo";
import "../styles/catalogo.css";

function WhatsAppIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

// Anima una copia de la imagen del producto volando hasta el botón del carrito
function flyToCart(imgEl, onDone) {
  const target = document.querySelector("[data-cart-target]");
  if (!imgEl || !target || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    onDone?.();
    return;
  }
  const from = imgEl.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  const clone = imgEl.cloneNode();
  Object.assign(clone.style, {
    position: "fixed", left: `${from.left}px`, top: `${from.top}px`,
    width: `${from.width}px`, height: `${from.height}px`, objectFit: "contain",
    zIndex: 1000, pointerEvents: "none", margin: 0,
  });
  document.body.appendChild(clone);
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const anim = clone.animate(
    [
      { transform: "translate(0,0) scale(1)", opacity: 1 },
      { transform: `translate(${dx * 0.6}px, ${dy * 0.6 - 60}px) scale(0.5)`, opacity: 0.9, offset: 0.6 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.12)`, opacity: 0.4 },
    ],
    { duration: 650, easing: "cubic-bezier(.5,-0.2,.6,1)" }
  );
  anim.onfinish = () => { clone.remove(); onDone?.(); };
}

function SizePicker({ variantes, value, onChange, accent }) {
  if (variantes.length <= 1) {
    return <div className="size-single">{variantes[0]?.tamanio}</div>;
  }
  return (
    <div className="size-picker" role="radiogroup" aria-label="Tamaño" style={{ "--accent": accent }}>
      {variantes.map((v, i) => (
        <button
          key={v.tamanio}
          role="radio"
          aria-checked={value === i}
          className={`size-opt ${value === i ? "is-active" : ""}`}
          onClick={() => onChange(i)}
        >
          {v.tamanio}
        </button>
      ))}
    </div>
  );
}

function QtyControl({ qty, setQty }) {
  return (
    <div className="qty-control">
      <button className="qty-btn" aria-label="Restar" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
      <span className="qty-value" aria-live="polite">{qty}</span>
      <button className="qty-btn" aria-label="Sumar" onClick={() => setQty(q => q + 1)}>+</button>
    </div>
  );
}

// Detalle del producto en una tarjeta emergente (abajo en mobile, centrada en pantallas grandes)
function ProductDetail({ product, accent, onClose }) {
  const closeRef = useRef();
  const linea = getLineaByKey(product.linea);
  const beneficios = product.beneficios ? product.beneficios.split(" - ") : [];

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return createPortal(
    <div className="pdetail-layer" onClick={onClose}>
      <div
        className="pdetail"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`pdetail-${product.id}`}
        style={{ "--accent": accent }}
        onClick={e => e.stopPropagation()}
      >
        <button ref={closeRef} className="pdetail-close" aria-label="Cerrar" onClick={onClose}>✕</button>
        <div className="pdetail-head">
          <ProductImage product={product} className="pdetail-img" />
          <div>
            <div className="pcard-kind">{linea?.nombre || product.linea} · {product.tipo}{product.ph && product.ph !== "-" ? ` · pH ${product.ph}` : ""}</div>
            <h3 className="pdetail-name" id={`pdetail-${product.id}`}>{product.producto}</h3>
            <div className="pdetail-sizes">
              {product.variantes.map(v => <span key={v.tamanio}>{v.tamanio} <b>{formatPrice(v.precio)}</b></span>)}
            </div>
          </div>
        </div>
        <div className="pdetail-body">
          {product.descripcion && <p>{product.descripcion}</p>}
          {beneficios.length > 0 && (
            <div className="pcard-tags">{beneficios.map(b => <span key={b}>{b}</span>)}</div>
          )}
          {product.indicaciones && (
            <div className="pdetail-block"><strong>Indicado para</strong><span>{product.indicaciones.split(" - ").join(" · ")}</span></div>
          )}
          {product.modo_uso && (
            <div className="pdetail-block pcard-uso"><strong>Modo de uso</strong><span>{product.modo_uso}</span></div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function ProductCard({ product, onAdd }) {
  const [sizeIdx, setSizeIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const imgRef = useRef();
  const closeDetail = useCallback(() => setOpen(false), []);
  const linea = getLineaByKey(product.linea);
  const accent = linea?.color || "#1a1a1a";
  const variante = product.variantes[sizeIdx] || product.variantes[0];
  const beneficios = product.beneficios ? product.beneficios.split(" - ") : [];

  function handleAdd() {
    onAdd({
      key: `${product.id}|${variante.tamanio}`,
      productId: product.id,
      name: product.producto,
      tipo: product.tipo,
      linea: product.linea,
      tamanio: variante.tamanio,
      precio: variante.precio,
      image_url: product.image_url,
      foto: !!product.foto,
    }, qty, imgRef.current);
    setQty(1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  return (
    <article className="pcard" style={{ "--accent": accent }}>
      <div className="pcard-media">
        <ProductImage product={product} imgRef={imgRef} />
        <span className="pcard-badge">{linea?.nombre || product.linea}</span>
        {product.nuevo && <span className="pcard-new">Nuevo</span>}
      </div>

      <div className="pcard-body">
        <div className="pcard-kind">{product.tipo}{product.ph && product.ph !== "-" ? ` · pH ${product.ph}` : ""}</div>
        <h3 className="pcard-name">{product.producto}</h3>

        {beneficios.length > 0 && (
          <div className="pcard-tags">
            {beneficios.slice(0, 3).map(b => <span key={b}>{b}</span>)}
          </div>
        )}

        <SizePicker variantes={product.variantes} value={sizeIdx} onChange={setSizeIdx} accent={accent} />

        <div className="pcard-price">{formatPrice(variante?.precio)}</div>

        <div className="pcard-actions">
          <QtyControl qty={qty} setQty={setQty} />
          <button className={`add-btn ${added ? "is-added" : ""}`} onClick={handleAdd} disabled={!variante?.precio}>
            {added ? "✓ Agregado" : "Agregar"}
          </button>
        </div>

        <button className="pcard-more" aria-haspopup="dialog" onClick={() => setOpen(true)}>
          Ver detalle y modo de uso <span aria-hidden="true">›</span>
        </button>

        {open && <ProductDetail product={product} accent={accent} onClose={closeDetail} />}
      </div>
    </article>
  );
}

function ComboCard({ combo, onAdd }) {
  const [sizeIdx, setSizeIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const imgRef = useRef();
  const linea = getLineaByKey(combo.linea);
  const size = combo.sizes[sizeIdx] || combo.sizes[0];

  function handleAdd() {
    onAdd({
      key: `${combo.id}|${size.label}`,
      productId: combo.id,
      isCombo: true,
      name: combo.nombre,
      tipo: "Tratamiento completo",
      linea: combo.linea,
      tamanio: size.detalle,
      componentes: size.componentes,
      lista: size.lista,
      precio: size.precio,
      comboPct: combo.pct,
      image_url: linea ? img(linea.set) : null,
      foto: true,
    }, qty, imgRef.current);
    setQty(1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  return (
    <article className="ccard" style={{ "--accent": linea?.color || "#1a1a1a" }}>
      <div className="ccard-media">
        {linea && <img ref={imgRef} src={img(linea.set)} alt={combo.nombre} loading="lazy" />}
        {combo.pct > 0 && <span className="ccard-off">-{combo.pct}%</span>}
      </div>
      <div className="ccard-body">
        <div className="pcard-kind">Tratamiento completo</div>
        <h3 className="pcard-name">{linea?.nombre || combo.linea}</h3>
        <p className="ccard-claim">{linea?.claim}</p>

        <ul className="ccard-items">
          {size.componentes.map(c => (
            <li key={c.id}>
              <ProductImage product={{ ...c, linea: combo.linea }} className="ccard-thumb" />
              <span>{c.tipo}</span>
              <small>{c.tamanio}</small>
            </li>
          ))}
        </ul>

        {combo.sizes.length > 1 && (
          <div className="size-picker" role="radiogroup" aria-label="Presentación" style={{ "--accent": linea?.color }}>
            {combo.sizes.map((s, i) => (
              <button key={s.label} role="radio" aria-checked={sizeIdx === i}
                className={`size-opt ${sizeIdx === i ? "is-active" : ""}`} onClick={() => setSizeIdx(i)}>
                {s.label}
              </button>
            ))}
          </div>
        )}

        <div className="ccard-prices">
          <span className="pcard-price">{formatPrice(size.precio)}</span>
          {size.lista > size.precio && <s>{formatPrice(size.lista)}</s>}
        </div>

        <div className="pcard-actions">
          <QtyControl qty={qty} setQty={setQty} />
          <button className={`add-btn ${added ? "is-added" : ""}`} onClick={handleAdd}>
            {added ? "✓ Agregado" : "Agregar combo"}
          </button>
        </div>
      </div>
    </article>
  );
}

// Hero: vitrina animada con el nombre, la necesidad y el acceso a cada línea
function CatalogHero({ onPick }) {
  return (
    <ProductShowcase
      className="chero"
      renderCopy={(l, i, n, isActive) => (
        <div className="chero-copy">
          <span className="chero-index">{String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")} · {l.necesidad}</span>
          <h2>{l.nombre}</h2>
          <p>{l.claim}</p>
          <button className="chero-cta" tabIndex={isActive ? 0 : -1} onClick={() => onPick(l.key)}>
            Ver la línea <span aria-hidden="true">→</span>
          </button>
        </div>
      )}
    />
  );
}

// Selector de categoría colapsado: muestra la selección actual y se despliega al tocarlo
function CategoryPicker({ lineaFilter, setLineaFilter, tipoFilter, setTipoFilter, tipos }) {
  const [open, setOpen] = useState(false);
  const linea = lineaFilter !== "todas" ? getLineaByKey(lineaFilter) : null;
  const activos = (linea ? 1 : 0) + (tipoFilter !== "todos" ? 1 : 0);

  return (
    <div className={`catpick ${open ? "is-open" : ""}`}>
      <button className="catpick-toggle" aria-expanded={open} aria-controls="catpick-panel" onClick={() => setOpen(o => !o)}>
        <span className="catpick-label">Categoría</span>
        <span className="catpick-current">
          {activos === 0 && "Todas"}
          {linea && <span className="catpick-chip" style={{ "--accent": linea.color }}><i className="pill-dot" />{linea.nombre}</span>}
          {tipoFilter !== "todos" && <span className="catpick-chip">{tipoFilter}</span>}
        </span>
        <span className="catpick-chev" aria-hidden="true">▾</span>
      </button>

      <div className="catpick-panel" id="catpick-panel">
        <div className="catpick-inner">
          <div className="catpick-group">
            <span className="catpick-title">Línea</span>
            <div className="catalogo-filters">
              <button onClick={() => setLineaFilter("todas")} className={`filter-pill ${lineaFilter === "todas" ? "active" : ""}`}>Todas</button>
              {LINEAS.map(l => (
                <button key={l} onClick={() => setLineaFilter(lineaFilter === l ? "todas" : l)}
                  className={`filter-pill ${lineaFilter === l ? "active" : ""}`}
                  style={{ "--accent": getLineaByKey(l)?.color }}>
                  <i className="pill-dot" />{getLineaByKey(l)?.nombre || l}
                </button>
              ))}
            </div>
          </div>
          <div className="catpick-group">
            <span className="catpick-title">Producto</span>
            <div className="catalogo-filters">
              <button onClick={() => setTipoFilter("todos")} className={`filter-pill ${tipoFilter === "todos" ? "active" : ""}`}>Todos</button>
              {tipos.map(t => (
                <button key={t} onClick={() => setTipoFilter(tipoFilter === t ? "todos" : t)} className={`filter-pill ${tipoFilter === t ? "active" : ""}`}>{t}</button>
              ))}
            </div>
          </div>
          <button className="catpick-done" onClick={() => setOpen(false)}>Listo</button>
        </div>
      </div>
    </div>
  );
}

function CartView({ summary, onClose, onSent }) {
  const { addOrder, changeQty, removeFromCart, config } = useApp();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [sent, setSent] = useState(false);
  const { lines, unidades, tier, next, faltan, lista, total, ahorro } = summary;
  const minOrder = Number(config?.min_order) || 0;
  const belowMin = minOrder > 0 && total < minOrder;

  async function sendToWhatsApp() {
    let msg = "Hola! Quiero realizar el siguiente pedido:\n\n";
    lines.forEach(l => {
      msg += `• ${l.name} — ${l.tamanio} x${l.qty} = ${formatPrice(l.totalLinea)}${l.pct ? ` (-${l.pct}%)` : ""}\n`;
      if (l.isCombo) l.componentes.forEach(c => { msg += `   ◦ ${c.producto} ${c.tamanio}\n`; });
    });
    msg += `\nUnidades: ${unidades}`;
    if (ahorro > 0) msg += `\nSubtotal: ${formatPrice(lista)}\nDescuento: -${formatPrice(ahorro)}`;
    msg += `\n*Total: ${formatPrice(total)}*`;
    if (name) msg += `\nNombre: ${name}`;
    if (phone) msg += `\nTeléfono: ${phone}`;

    try {
      await addOrder({
        cliente_nombre: name || "Cliente nuevo",
        cliente_telefono: phone,
        items: lines.map(l => ({
          name: l.name, tipo: l.tipo, tamanio: l.tamanio, price: l.isCombo ? l.lista : l.precio,
          qty: l.qty, descuento_pct: l.pct, total: l.totalLinea,
        })),
        total,
      });
    } catch (err) {
      console.error("Error guardando pedido:", err);
    }

    const phoneNumber = config?.phone || SELLER_PHONE;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(msg)}`, "_blank");
    setSent(true);
    onSent();
  }

  if (sent) return (
    <div className="cart-sent">
      <div className="cart-sent-icon">✨</div>
      <div className="cart-sent-title">¡Pedido enviado!</div>
      <div className="cart-sent-msg">Se abrió WhatsApp con tu pedido. Te confirmamos disponibilidad y entrega en breve.</div>
      <button className="cart-sent-btn" onClick={onClose}>Volver al catálogo</button>
    </div>
  );

  return (
    <div className="cart-view">
      <div className="cart-header">
        <button className="cart-back-btn" onClick={onClose}>← Seguir comprando</button>
        <h2 className="cart-title">
          Tu pedido <span className="cart-title-count">({unidades} {unidades === 1 ? "unidad" : "unidades"})</span>
        </h2>
      </div>

      {lines.length === 0 ? (
        <div className="cart-empty">
          <div className="cart-empty-icon">🛒</div>
          <div className="cart-empty-text">El carrito está vacío</div>
        </div>
      ) : (
        <>
          {next && (
            <div className="cart-progress">
              <div>
                {tier ? <>Tenés <b>-{tier.pct}%</b>. </> : null}
                Sumá <b>{faltan} {faltan === 1 ? "unidad" : "unidades"}</b> más y llegás a <b>-{next.pct}%</b>
              </div>
              <div className="cart-progress-bar"><span style={{ width: `${Math.min(100, (unidades / next.min) * 100)}%` }} /></div>
            </div>
          )}
          {!next && tier && <div className="cart-progress is-max">🎉 Llegaste al descuento máximo: <b>-{tier.pct}%</b></div>}

          <div className="cart-items">
            {lines.map(item => (
              <div key={item.key} className="cart-item" style={{ "--accent": getLineaByKey(item.linea)?.color }}>
                <ProductImage product={{ image_url: item.image_url, linea: item.linea, tipo: item.tipo, foto: item.foto }}
                  alt={item.name} className="cart-item-img" />
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-detail">{item.tamanio}</div>
                  <div className="cart-item-detail">
                    {formatPrice(item.isCombo ? item.lista : item.precio)} c/u
                    {item.pct > 0 && <span className="cart-item-off">-{item.pct}%</span>}
                  </div>
                </div>
                <div className="cart-item-qty">
                  <button className="cart-qty-btn" aria-label="Restar" onClick={() => changeQty(item.key, -1)}>−</button>
                  <span className="cart-qty-value">{item.qty}</span>
                  <button className="cart-qty-btn" aria-label="Sumar" onClick={() => changeQty(item.key, 1)}>+</button>
                </div>
                <div className="cart-item-price">
                  {item.pct > 0 && <s>{formatPrice(item.listaLinea)}</s>}
                  {formatPrice(item.totalLinea)}
                </div>
                <button className="cart-item-remove" aria-label={`Quitar ${item.name}`} onClick={() => removeFromCart(item.key)}>✕</button>
              </div>
            ))}
          </div>

          <div className="cart-total">
            {ahorro > 0 && (
              <>
                <div className="cart-total-row"><span>Subtotal</span><span>{formatPrice(lista)}</span></div>
                <div className="cart-total-row is-save"><span>Descuentos</span><span>-{formatPrice(ahorro)}</span></div>
              </>
            )}
            <div className="cart-total-row is-total"><span>Total</span><span>{formatPrice(total)}</span></div>
          </div>

          <div className="cart-form">
            <label>
              <span className="cart-form-label">Tu nombre</span>
              <input className="cart-form-input" type="text" placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} />
            </label>
            <label>
              <span className="cart-form-label">Tu WhatsApp (opcional)</span>
              <input className="cart-form-input" type="tel" placeholder="+54 9 11 1234 5678" value={phone} onChange={e => setPhone(e.target.value)} />
            </label>
          </div>

          {belowMin && <div className="cart-min">El pedido mínimo es de {formatPrice(minOrder)}.</div>}
          <button className="cart-send-btn" onClick={sendToWhatsApp} disabled={belowMin}>
            <WhatsAppIcon size={20} /> Enviar pedido por WhatsApp
          </button>
          <div className="cart-send-hint">Se abrirá WhatsApp con el resumen de tu pedido</div>
        </>
      )}
    </div>
  );
}

export default function Catalogo() {
  const { products, config, loading, loadError, loadData, cart, addToCart, clearCart } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const vista = searchParams.get("vista") === "combos" ? "combos" : "productos";
  const [lineaFilter, setLineaFilter] = useState(() => {
    const l = searchParams.get("linea");
    return LINEAS.includes(l) ? l : "todas";
  });
  const [tipoFilter, setTipoFilter] = useState(() => {
    const t = searchParams.get("tipo");
    return TIPOS.includes(t) ? t : "todos";
  });
  const [view, setView] = useState("catalog");
  const [toast, setToast] = useState(null);
  const [bump, setBump] = useState(false);
  const toastTimer = useRef();

  useEffect(() => { window.scrollTo(0, 0); }, [view, vista]);
  useEffect(() => { setPageMeta(CATALOGO_META); }, []);

  const combos = useMemo(() => buildCombos(products, config), [products, config]);
  const comboPct = combos[0]?.pct ?? 0;
  const summary = useMemo(() => computeCart(cart, config), [cart, config]);

  const filtered = useMemo(() => products.filter(p => {
    if (!p.active || !p.variantes?.length) return false;
    const lineaOk = lineaFilter === "todas" || p.linea === lineaFilter;
    const tipoOk = tipoFilter === "todos" || p.tipo === tipoFilter;
    return lineaOk && tipoOk;
  }).map(conRecorte), [products, lineaFilter, tipoFilter]);

  const tiposDisponibles = TIPOS.filter(t => products.some(p => p.active && p.tipo === t));

  function setVista(v) {
    const next = new URLSearchParams(searchParams);
    if (v === "combos") next.set("vista", "combos"); else next.delete("vista");
    setSearchParams(next, { replace: true });
    setView("catalog");
  }

  // Desde el hero: filtra por la línea y baja hasta los productos
  function pickLinea(key) {
    setLineaFilter(key);
    setTipoFilter("todos");
    if (vista !== "productos") setVista("productos");
    requestAnimationFrame(() => {
      document.getElementById("catalogo-productos")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function handleAdd(item, qty, imgEl) {
    addToCart(item, qty);
    flyToCart(imgEl, () => {
      setBump(true);
      setTimeout(() => setBump(false), 450);
    });
    clearTimeout(toastTimer.current);
    setToast({ ...item, qty });
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }

  if (loading) {
    return (
      <div className="catalogo-loading">
        <div className="catalogo-loading-inner">
          <img src={img("logo-white")} alt="Vexa" className="catalogo-loading-logo" />
          <div className="catalogo-loading-text">Cargando catálogo...</div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="catalogo-error">
        <div className="catalogo-error-inner">
          <div className="catalogo-error-icon">⚠️</div>
          <div className="catalogo-error-title">Error al cargar</div>
          <div className="catalogo-error-msg">{loadError}</div>
          <button className="retry-btn" onClick={loadData}>Reintentar</button>
        </div>
      </div>
    );
  }

  const unidades = summary.unidades;

  return (
    <div className="catalogo">
      <header className="catalogo-header">
        <div className="catalogo-header-inner">
          <Link to="/" className="catalogo-brand">
            <img className="catalogo-logo" src={img("logo-white")} alt="Vexa Hair Evolution" />
            <span className="catalogo-brand-sub">CATÁLOGO MAYORISTA</span>
          </Link>
          <button
            data-cart-target
            className={`catalogo-cart-btn ${unidades > 0 ? "has-items" : ""} ${bump ? "bump" : ""}`}
            onClick={() => setView(view === "cart" ? "catalog" : "cart")}
            aria-label={`Ver carrito, ${unidades} unidades`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 6h15l-1.5 9h-12z" /><path d="M6 6 5 3H2" /><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /></svg>
            <span>{unidades > 0 ? formatPrice(summary.total) : "Carrito"}</span>
            {unidades > 0 && <span className="cart-count">{unidades}</span>}
          </button>
        </div>
      </header>

      <main className="catalogo-content">
        {view === "catalog" ? (
          <>
            <CatalogHero onPick={pickLinea} />

            <div className="vista-tabs" role="tablist" id="catalogo-productos">
              <button role="tab" aria-selected={vista === "productos"} className={vista === "productos" ? "is-active" : ""} onClick={() => setVista("productos")}>
                Productos
              </button>
              <button role="tab" aria-selected={vista === "combos"} className={vista === "combos" ? "is-active" : ""} onClick={() => setVista("combos")}>
                Tratamientos completos {comboPct > 0 && <span className="tab-off">-{comboPct}%</span>}
              </button>
            </div>

            {vista === "productos" ? (
              <>
                <CategoryPicker
                  lineaFilter={lineaFilter} setLineaFilter={setLineaFilter}
                  tipoFilter={tipoFilter} setTipoFilter={setTipoFilter}
                  tipos={tiposDisponibles}
                />

                <div className="catalogo-count">
                  {filtered.length} producto{filtered.length !== 1 ? "s" : ""}
                  {lineaFilter !== "todas" ? ` en ${getLineaByKey(lineaFilter)?.nombre || lineaFilter}` : ""}
                  {tipoFilter !== "todos" ? ` · ${tipoFilter}` : ""}
                </div>

                {filtered.length === 0 ? (
                  <div className="catalogo-empty">
                    <div className="catalogo-empty-icon">😕</div>
                    <div className="catalogo-empty-text">Sin productos para ese filtro</div>
                  </div>
                ) : (
                  <div className="catalogo-grid">
                    {filtered.map(p => <ProductCard key={p.id} product={p} onAdd={handleAdd} />)}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="combos-intro">
                  <h1>Tratamientos completos</h1>
                  <p>
                    Shampoo + máscara{combos.some(c => c.sizes[0].componentes.length > 2) ? " + ampollas" : ""} de la misma línea
                    {comboPct > 0 ? <> con <b>{comboPct}% de descuento</b></> : null}. Elegí presentación profesional o chica.
                  </p>
                </div>
                {combos.length === 0 ? (
                  <div className="catalogo-empty"><div className="catalogo-empty-text">No hay tratamientos completos disponibles.</div></div>
                ) : (
                  <div className="combos-grid">
                    {combos.map(c => <ComboCard key={c.id} combo={c} onAdd={handleAdd} />)}
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <CartView summary={summary} onClose={() => setView("catalog")} onSent={clearCart} />
        )}
      </main>

      {/* Mismo pie que el resto del sitio (con el crédito del desarrollador) */}
      <div className="site catalogo-footer"><SiteFooter /></div>

      {view === "catalog" && unidades > 0 && (
        <div className="cart-bar" role="region" aria-label="Resumen del pedido">
          <div className="cart-bar-info">
            <strong>{unidades} {unidades === 1 ? "unidad" : "unidades"} · {formatPrice(summary.total)}</strong>
            <span>
              {summary.next
                ? `Sumá ${summary.faltan} más para -${summary.next.pct}%`
                : summary.tier ? `Descuento -${summary.tier.pct}% aplicado` : ""}
            </span>
          </div>
          <button className="cart-bar-btn" onClick={() => setView("cart")}>Ver pedido →</button>
        </div>
      )}

      {toast && (
        <div className="catalogo-toast" role="status">
          <ProductImage product={{ image_url: toast.image_url, linea: toast.linea, tipo: toast.tipo, foto: toast.foto }} className="toast-img" />
          <div className="toast-text">
            <strong>Agregado al pedido</strong>
            <span>{toast.qty} × {toast.name} · {toast.tamanio}</span>
          </div>
          <button className="toast-btn" onClick={() => { setToast(null); setView("cart"); }}>Ver pedido</button>
        </div>
      )}
    </div>
  );
}
