import { useState, useRef, useEffect } from "react";
import { useApp, LOCAL_LOGIN_ENABLED } from "../context/AppContext";
import { formatPrice, LINEAS, TIPOS, getTamaniosForTipo, tipoEmoji } from "../data/store";
import { buildCombos, getTiers, getComboPct } from "../data/pricing";
import { img } from "../data/lineas";
import { productsService } from "../services/productsService";
import { configService } from "../services/configService";
import "../styles/admin.css";

function Badge({ status }) {
  return <span className={`admin-badge ${status}`}>{status}</span>;
}

function Input({ label, ...props }) {
  return (
    <div className="admin-input-group">
      {label && <label className="admin-label">{label}</label>}
      <input {...props} className="admin-input" style={props.style} />
    </div>
  );
}

function TextArea({ label, ...props }) {
  return (
    <div className="admin-input-group">
      {label && <label className="admin-label">{label}</label>}
      <textarea rows={3} {...props} className="admin-input admin-textarea" />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div className="admin-input-group">
      {label && <label className="admin-label">{label}</label>}
      <select {...props} className="admin-select">{children}</select>
    </div>
  );
}

function Btn({ children, variant = "primary", small, ...props }) {
  return (
    <button {...props} className={`admin-btn ${variant} ${small ? 'small' : ''}`} style={props.style}>
      {children}
    </button>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`admin-modal ${wide ? 'wide' : ''}`}>
        <div className="admin-modal-header">
          <div className="admin-modal-title">{title}</div>
          <button className="admin-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="admin-modal-body">{children}</div>
      </div>
    </div>
  );
}

function VariantesEditor({ tipo, variantes, onChange }) {
  const sugeridos = getTamaniosForTipo(tipo);
  const listId = `tamanios-${tipo.replace(/\s+/g, "-")}`;
  const update = (i, key, val) => onChange(variantes.map((v, j) => j === i ? { ...v, [key]: val } : v));
  const remove = (i) => onChange(variantes.filter((_, j) => j !== i));
  const add = () => {
    const libre = sugeridos.find(t => !variantes.some(v => v.tamanio === t)) || "";
    onChange([...variantes, { tamanio: libre, precio: "" }]);
  };

  return (
    <div className="admin-variantes">
      <div className="admin-prices-title">Tamaños y precios *</div>
      {variantes.map((v, i) => (
        <div key={i} className="admin-variante-row">
          <input className="admin-input" list={listId} value={v.tamanio}
            onChange={e => update(i, "tamanio", e.target.value)} placeholder="Ej: 1000 ml" aria-label="Tamaño" />
          <div className="admin-price-input">
            <span>$</span>
            <input className="admin-input" type="number" step="0.01" min="0" value={v.precio}
              onChange={e => update(i, "precio", e.target.value)} placeholder="0" aria-label="Precio" />
          </div>
          <Btn small variant="danger" onClick={() => remove(i)} disabled={variantes.length === 1} aria-label="Quitar tamaño">✕</Btn>
        </div>
      ))}
      <datalist id={listId}>
        {sugeridos.map(t => <option key={t} value={t} />)}
      </datalist>
      <div><Btn small variant="ghost" onClick={add}>+ Agregar tamaño</Btn></div>
      <div className="admin-settings-info blue">
        El primer tamaño es el que aparece seleccionado en el catálogo y el que se usa en el combo "Profesional".
      </div>
    </div>
  );
}

function ProductForm({ product, onSave, onCancel }) {
  const isEdit = !!product?.id;
  const [form, setForm] = useState({
    linea: product?.linea || LINEAS[0],
    producto: product?.producto || "",
    tipo: product?.tipo || TIPOS[0],
    ph: product?.ph || "-",
    variantes: product?.variantes?.length
      ? product.variantes.map(v => ({ ...v }))
      : getTamaniosForTipo(TIPOS[0]).map(t => ({ tamanio: t, precio: "" })),
    descripcion: product?.descripcion || "",
    beneficios: product?.beneficios || "",
    indicaciones: product?.indicaciones || "",
    modo_uso: product?.modo_uso || "",
    destacado: !!product?.destacado,
    active: product?.active !== false,
    image_url: product?.image_url || null,
    foto: !!product?.foto,
  });
  const [imgPreview, setImgPreview] = useState(product?.image_url || null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  async function handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await productsService.uploadImage(file);
      setImgPreview(url);
      set("image_url", url);
    } catch (err) {
      alert("Error subiendo imagen: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  // Al cambiar el tipo, si todavía no hay precios cargados, sugerimos sus tamaños
  function changeTipo(tipo) {
    setForm(f => ({
      ...f,
      tipo,
      variantes: f.variantes.every(v => !v.precio)
        ? getTamaniosForTipo(tipo).map(t => ({ tamanio: t, precio: "" }))
        : f.variantes,
    }));
  }

  function handleSubmit() {
    if (!form.producto || !form.linea || !form.tipo) return alert("Completá línea, producto y tipo");
    const variantes = form.variantes
      .map(v => ({ tamanio: String(v.tamanio).trim(), precio: Number(v.precio) || 0 }))
      .filter(v => v.tamanio);
    if (!variantes.length) return alert("Cargá al menos un tamaño");
    if (variantes.some(v => !v.precio)) return alert("Cada tamaño necesita un precio");
    onSave({ ...form, variantes, id: product?.id || null });
  }

  return (
    <div className="admin-form">
      <div className="admin-img-upload">
        <div className="admin-img-preview" onClick={() => fileRef.current.click()}>
          {imgPreview ? <img src={imgPreview} alt="" /> : tipoEmoji(form.tipo)}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImage} />
        <div className="admin-img-actions">
          <Btn small variant="ghost" onClick={() => fileRef.current.click()} disabled={uploading}>
            {uploading ? '⏳ Subiendo...' : '📎 Subir foto'}
          </Btn>
          {imgPreview && (
            <Btn small variant="danger" onClick={() => { setImgPreview(null); set("image_url", null); }}>
              ✕ Quitar imagen
            </Btn>
          )}
          <label className="admin-check">
            <input type="checkbox" checked={form.foto} onChange={e => set("foto", e.target.checked)} />
            Es una foto con fondo (no un recorte)
          </label>
        </div>
      </div>

      <div className="admin-form-row">
        <Select label="Línea *" value={form.linea} onChange={e => set("linea", e.target.value)}>
          {LINEAS.map(l => <option key={l} value={l}>{l}</option>)}
        </Select>
        <Select label="Tipo *" value={form.tipo} onChange={e => changeTipo(e.target.value)}>
          {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
        </Select>
        <Input label="Producto *" value={form.producto} onChange={e => set("producto", e.target.value)} placeholder="Shampoo Argan Recovery" />
        <Input label="pH" value={form.ph} onChange={e => set("ph", e.target.value)} placeholder="5,5" />
      </div>

      <VariantesEditor tipo={form.tipo} variantes={form.variantes} onChange={v => set("variantes", v)} />

      <div className="admin-form-row">
        <div className="admin-input-group">
          <label className="admin-label">Estado</label>
          <div className="admin-form-toggle">
            {[true, false].map(v => (
              <button key={String(v)} onClick={() => set("active", v)}
                className={`admin-form-toggle-btn ${form.active === v ? 'selected' : ''}`}>
                {v ? "✓ Activo" : "✗ Oculto"}
              </button>
            ))}
          </div>
        </div>
        <div className="admin-input-group">
          <label className="admin-label">Más vendidos (inicio)</label>
          <div className="admin-form-toggle">
            {[true, false].map(v => (
              <button key={String(v)} onClick={() => set("destacado", v)}
                className={`admin-form-toggle-btn ${form.destacado === v ? 'selected' : ''}`}>
                {v ? "★ Destacar" : "No destacar"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <TextArea label="Descripción" value={form.descripcion} onChange={e => set("descripcion", e.target.value)} placeholder="Descripción del producto" />
      <Input label="Beneficios (separados con ' - ')" value={form.beneficios} onChange={e => set("beneficios", e.target.value)} placeholder="Hidratación - Brillo - Reparación" />
      <Input label="Indicaciones (separadas con ' - ')" value={form.indicaciones} onChange={e => set("indicaciones", e.target.value)} placeholder="Cabello dañado - Frizz" />
      <TextArea label="Modo de uso" value={form.modo_uso} onChange={e => set("modo_uso", e.target.value)} placeholder="Cómo se aplica el producto" />

      <div className="admin-form-footer">
        <Btn variant="ghost" onClick={onCancel}>Cancelar</Btn>
        <Btn onClick={handleSubmit} disabled={uploading}>{isEdit ? "Guardar cambios" : "Crear producto"}</Btn>
      </div>
    </div>
  );
}

function ProductsSection() {
  const { products, refreshProducts, localMode } = useApp();
  const [modal, setModal] = useState(null);

  async function saveProduct(formData) {
    try {
      if (formData.id) {
        await productsService.update(formData.id, formData);
      } else {
        await productsService.create(formData);
      }
      await refreshProducts();
      setModal(null);
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  async function deleteProduct(id) {
    if (!window.confirm("¿Eliminar este producto permanentemente?")) return;
    try {
      await productsService.delete(id);
      await refreshProducts();
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  async function toggle(product, field) {
    try {
      if (field === "active") await productsService.toggleActive(product.id, !product.active);
      else await productsService.toggleDestacado(product.id, !product.destacado);
      await refreshProducts();
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  return (
    <div>
      <div className="admin-section-header">
        <div>
          <div className="admin-section-title">Productos</div>
          <div className="admin-section-subtitle">
            {products.length} cargados {localMode ? "en modo local (este navegador)" : "en base de datos"}
          </div>
        </div>
        <Btn onClick={() => setModal("new")}>+ Nuevo producto</Btn>
      </div>

      <div className="admin-stats">
        {[
          { label: "Total", val: products.length, icon: "📦" },
          { label: "Activos", val: products.filter(p => p.active).length, icon: "✅" },
          { label: "Más vendidos", val: products.filter(p => p.destacado).length, icon: "★" },
          { label: "Líneas", val: [...new Set(products.map(p => p.linea))].length, icon: "🏷️" },
        ].map(s => (
          <div key={s.label} className="admin-stat-card">
            <div className="admin-stat-icon">{s.icon}</div>
            <div className="admin-stat-value">{s.val}</div>
            <div className="admin-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="admin-table-wrap">
        {products.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">📦</div>
            <div className="admin-empty-text">No hay productos aún. ¡Creá el primero!</div>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                {["Producto", "Línea", "Tamaños y precios", "Más vendido", "Estado", ""].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="admin-product-cell">
                      <div className="admin-product-thumb">
                        {p.image_url ? <img src={p.image_url} alt="" /> : tipoEmoji(p.tipo)}
                      </div>
                      <div>
                        <div className="admin-product-name">{p.producto}</div>
                        <div className="admin-product-meta">{p.tipo} · pH {p.ph}</div>
                      </div>
                    </div>
                  </td>
                  <td className="admin-linea-cell">{p.linea}</td>
                  <td className="admin-price-cell">
                    {p.variantes.map(v => (
                      <div key={v.tamanio} className="admin-variant-line">
                        <span>{v.tamanio}</span> <strong>{formatPrice(v.precio)}</strong>
                      </div>
                    ))}
                  </td>
                  <td>
                    <button onClick={() => toggle(p, "destacado")} className={`admin-star ${p.destacado ? 'on' : ''}`}
                      aria-pressed={p.destacado} title="Mostrar en 'Más vendidos' del inicio">
                      {p.destacado ? "★" : "☆"}
                    </button>
                  </td>
                  <td>
                    <button onClick={() => toggle(p, "active")} className={`admin-active-toggle ${p.active ? 'active' : 'inactive'}`}>
                      {p.active ? "● Activo" : "○ Oculto"}
                    </button>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <Btn small variant="ghost" onClick={() => setModal(p)}>Editar</Btn>
                      <Btn small variant="danger" onClick={() => deleteProduct(p.id)}>🗑</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal title={modal === "new" ? "Nuevo producto" : `Editar: ${modal.producto}`} onClose={() => setModal(null)} wide>
          <ProductForm product={modal === "new" ? null : modal} onSave={saveProduct} onCancel={() => setModal(null)} />
        </Modal>
      )}
    </div>
  );
}

function PromosSection() {
  const { config, refreshConfig, products } = useApp();
  const [tiers, setTiers] = useState([]);
  const [comboPct, setComboPct] = useState(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!config) return;
    setTiers(getTiers(config).map(t => ({ ...t })));
    setComboPct(getComboPct(config));
  }, [config]);

  const update = (i, key, val) => setTiers(ts => ts.map((t, j) => j === i ? { ...t, [key]: val } : t));
  const combos = buildCombos(products, { ...config, combo_pct: comboPct });
  const validTiers = tiers.filter(t => Number(t.min) > 0 && Number(t.pct) > 0).sort((a, b) => a.min - b.min);

  async function handleSave() {
    const clean = validTiers.map(t => ({ min: Number(t.min), pct: Number(t.pct) }));
    if (clean.some(t => t.pct >= 100) || Number(comboPct) >= 100) return alert("Los porcentajes deben ser menores a 100");
    if (new Set(clean.map(t => t.min)).size !== clean.length) return alert("Hay dos escalones con la misma cantidad");
    try {
      await configService.update({ ...config, descuentos: clean, combo_pct: Number(comboPct) || 0 });
      await refreshConfig();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  return (
    <div>
      <div className="admin-section-title admin-section-margin">Descuentos y promociones</div>
      <div className="admin-stack-lg">
        <div className="admin-settings-card">
          <div className="admin-settings-title">📦 Descuento por cantidad (precio mayorista)</div>
          <div className="admin-settings-info blue">
            Se cuentan todas las unidades del pedido: el cliente puede mezclar shampoos, máscaras, ampollas, protectores y combos
            (un combo cuenta como la cantidad de productos que trae). Se aplica el escalón más alto que alcance.
          </div>
          <div className="admin-tiers">
            <div className="admin-tier-row admin-tier-head"><span>A partir de (unidades)</span><span>Descuento %</span><span /></div>
            {tiers.map((t, i) => (
              <div key={i} className="admin-tier-row">
                <input className="admin-input" type="number" min="1" value={t.min} onChange={e => update(i, "min", e.target.value)} aria-label="Unidades mínimas" />
                <input className="admin-input" type="number" min="0" max="99" step="0.5" value={t.pct} onChange={e => update(i, "pct", e.target.value)} aria-label="Porcentaje de descuento" />
                <Btn small variant="danger" onClick={() => setTiers(ts => ts.filter((_, j) => j !== i))} aria-label="Quitar escalón">✕</Btn>
              </div>
            ))}
            <div><Btn small variant="ghost" onClick={() => setTiers(ts => [...ts, { min: "", pct: "" }])}>+ Agregar escalón</Btn></div>
          </div>
          {validTiers.length > 0 && (
            <div className="admin-settings-info green">
              <strong>Así lo ve el cliente:</strong>{" "}
              {validTiers.map(t => `${t.min}+ unidades → ${t.pct}% off`).join(" · ")}
            </div>
          )}
        </div>

        <div className="admin-settings-card">
          <div className="admin-settings-title">🧴 Tratamiento completo (combo)</div>
          <div className="admin-form-row">
            <Input label="Descuento del combo %" type="number" min="0" max="99" step="0.5" value={comboPct}
              onChange={e => setComboPct(e.target.value)} />
          </div>
          <div className="admin-settings-info blue">
            Se arma automáticamente un combo por línea con su shampoo, máscara y ampollas activos. Este porcentaje es el que
            muestra el botón de la página de inicio. Si el descuento por cantidad es mayor, se aplica el mayor (no se suman).
          </div>
          {combos.length > 0 && (
            <div className="admin-combo-preview">
              {combos.map(c => (
                <div key={c.id}>
                  <strong>{c.linea}</strong>
                  {c.sizes.map(s => (
                    <span key={s.label}>{s.label}: {s.detalle} — <s>{formatPrice(s.lista)}</s> {formatPrice(s.precio)}</span>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="admin-settings-card">
          <div className="admin-settings-title">★ Más vendidos</div>
          <div className="admin-settings-info yellow">
            En la sección Productos, marcá con la estrella ☆ los productos que aparecen en "Más vendidos" de la página de inicio.
            Ahora hay {products.filter(p => p.destacado && p.active).length} destacados activos.
          </div>
        </div>

        <div className="admin-settings-footer">
          {saved && <span className="admin-settings-saved">✓ Guardado</span>}
          <Btn onClick={handleSave}>Guardar promociones</Btn>
        </div>
      </div>
    </div>
  );
}

function OrdersSection() {
  const { orders, loadOrders, updateOrderStatus } = useApp();
  const [filter, setFilter] = useState("todos");

  useEffect(() => { loadOrders(); }, []);

  function sendWA(order) {
    const msg = `Hola ${order.cliente_nombre}! ✅ Confirmamos tu pedido:\n\n` +
      order.items.map(i => `• ${i.name} ${i.tamanio} x${i.qty}`).join("\n") +
      `\n\nTotal: ${formatPrice(order.total)}\nTe avisamos cuando esté listo. ✨`;
    window.open(`https://wa.me/${order.cliente_telefono}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  const counts = {
    todos: orders.length,
    pendiente: orders.filter(o => o.status === "pendiente").length,
    confirmado: orders.filter(o => o.status === "confirmado").length,
    enviado: orders.filter(o => o.status === "enviado").length,
  };
  const filtered = filter === "todos" ? orders : orders.filter(o => o.status === filter);

  return (
    <div>
      <div className="admin-section-margin">
        <div className="admin-section-title">Pedidos</div>
        <div className="admin-section-subtitle">{orders.length} pedidos en total</div>
      </div>

      <div className="admin-filters">
        {Object.entries(counts).map(([k, v]) => (
          <button key={k} onClick={() => setFilter(k)}
            className={`filter-pill ${filter === k ? 'active' : ''}`}>
            {k.charAt(0).toUpperCase() + k.slice(1)} ({v})
          </button>
        ))}
      </div>

      <div className="admin-stack">
        {filtered.length === 0 && (
          <div className="admin-empty">
            {orders.length === 0
              ? "Los pedidos aparecerán acá cuando los clientes completen su compra"
              : "No hay pedidos en esta categoría"}
          </div>
        )}
        {filtered.map(order => (
          <div key={order.id} className="admin-order-card">
            <div className="admin-order-header">
              <div>
                <div className="admin-order-title-row">
                  <span className="admin-order-client">{order.cliente_nombre}</span>
                  <Badge status={order.status} />
                </div>
                <div className="admin-order-meta">
                  {order.cliente_telefono && `${order.cliente_telefono} · `}
                  {new Date(order.created_at).toLocaleDateString("es-AR")}
                </div>
              </div>
              <div className="admin-order-total">{formatPrice(order.total)}</div>
            </div>
            <div className="admin-order-items">
              {order.items.map((item, i) => (
                <span key={i} className="admin-order-item-tag">
                  {item.name} {item.tamanio} ×{item.qty}{item.descuento_pct ? ` (-${item.descuento_pct}%)` : ""}
                </span>
              ))}
            </div>
            <div className="admin-order-actions">
              <Btn small variant="green" onClick={() => sendWA(order)}>
                <svg className="admin-wa-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                Confirmar por WA
              </Btn>
              {order.status === "pendiente" && <Btn small variant="success" onClick={() => updateOrderStatus(order.id, "confirmado")}>✓ Confirmar</Btn>}
              {order.status === "confirmado" && <Btn small variant="ghost" onClick={() => updateOrderStatus(order.id, "enviado")}>🚚 Marcar enviado</Btn>}
              {order.status !== "cancelado" && <Btn small variant="danger" onClick={() => updateOrderStatus(order.id, "cancelado")}>Cancelar</Btn>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsSection() {
  const { config, refreshConfig } = useApp();
  const [cfg, setCfg] = useState({
    shop_name: "Vexa",
    phone: "5491138382863",
    currency: "ARS",
    welcome_msg: "Hola! Gracias por elegir Vexa. Revisá nuestro catálogo mayorista",
    min_order: 0,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (config) {
      setCfg({
        shop_name: config.shop_name || "Vexa",
        phone: config.phone || "5491138382863",
        currency: config.currency || "ARS",
        welcome_msg: config.welcome_msg || "",
        min_order: config.min_order || 0,
      });
    }
  }, [config]);

  const set = (k, v) => setCfg(c => ({ ...c, [k]: v }));

  async function handleSave() {
    try {
      // Se mezcla con la config actual para no pisar descuentos ni combos
      await configService.update({ ...config, ...cfg });
      await refreshConfig();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  return (
    <div>
      <div className="admin-section-title admin-section-margin">Configuración</div>
      <div className="admin-stack-lg">
        <div className="admin-settings-card">
          <div className="admin-settings-title">🏪 Datos del negocio</div>
          <div className="admin-settings-grid">
            <Input label="Nombre" value={cfg.shop_name} onChange={e => set("shop_name", e.target.value)} />
            <Input label="Teléfono WhatsApp (recibe los pedidos)" value={cfg.phone} onChange={e => set("phone", e.target.value)} placeholder="5491155667788" />
            <Input label="Pedido mínimo ($)" type="number" value={cfg.min_order} onChange={e => set("min_order", e.target.value)} />
            <Select label="Moneda" value={cfg.currency} onChange={e => set("currency", e.target.value)}>
              <option value="ARS">ARS – Peso argentino</option>
              <option value="USD">USD – Dólar</option>
              <option value="BRL">BRL – Real</option>
            </Select>
          </div>
        </div>

        <div className="admin-settings-card">
          <div className="admin-settings-title"><span className="admin-whatsapp-dot">●</span> Mensajes WhatsApp</div>
          <div className="admin-stack">
            <div className="admin-input-group">
              <label className="admin-label">Mensaje de bienvenida</label>
              <textarea value={cfg.welcome_msg} onChange={e => set("welcome_msg", e.target.value)} rows={3}
                className="admin-input admin-textarea" />
            </div>
            <div className="admin-settings-info green">
              <strong>Preview:</strong> "{cfg.welcome_msg}"
            </div>
          </div>
        </div>

        <div className="admin-settings-footer">
          {saved && <span className="admin-settings-saved">✓ Guardado</span>}
          <Btn onClick={handleSave}>Guardar cambios</Btn>
        </div>
      </div>
    </div>
  );
}

const NAV = [
  { id: "products", label: "Productos", icon: "📦" },
  { id: "promos", label: "Promos", icon: "🏷️" },
  { id: "orders", label: "Pedidos", icon: "🛒" },
  { id: "settings", label: "Config", icon: "⚙️" },
];

function AdminApp() {
  const { orders, signOut, user, localMode } = useApp();
  const [page, setPage] = useState("products");
  const pending = orders.filter(o => o.status === "pendiente").length;

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-brand-name">✨ Admin Vexa</div>
          <div className="admin-sidebar-brand-email">{user?.email}</div>
          {localMode && <div className="admin-local-badge">Modo local · sin Supabase</div>}
        </div>
        <nav className="admin-sidebar-nav">
          {NAV.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)}
              className={`admin-nav-btn ${page === n.id ? 'active' : ''}`}>
              <span className="admin-nav-icon">{n.icon}</span>
              {n.label}
              {n.id === "orders" && pending > 0 && (
                <span className="admin-nav-badge">{pending}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <a href="#/catalogo" className="admin-sidebar-link">🌐 Ver catálogo</a>
          <button onClick={signOut} className="admin-sidebar-logout">🚪 Cerrar sesión</button>
        </div>
      </div>

      <div className="admin-content">
        {page === "products" && <ProductsSection />}
        {page === "promos" && <PromosSection />}
        {page === "orders" && <OrdersSection />}
        {page === "settings" && <SettingsSection />}
      </div>
    </div>
  );
}

export default function Admin() {
  const { user, signIn, loading, localMode } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [logging, setLogging] = useState(false);
  const localLogin = localMode && LOCAL_LOGIN_ENABLED;

  async function handleLogin(e) {
    e.preventDefault();
    setLogging(true);
    setError("");
    try {
      await signIn(email, password);
    } catch (err) {
      setError("Credenciales incorrectas");
    } finally {
      setLogging(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-inner">
          <div className="admin-loading-icon">✨</div>
          <div className="admin-loading-text">Cargando...</div>
        </div>
      </div>
    );
  }

  if (!user) return (
    <div className="admin-login">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <img className="admin-login-logo-img" src={img("logo-black")} alt="Vexa" />
          <div className="admin-login-title">Panel Admin</div>
          <div className="admin-login-sub">Catálogo mayorista</div>
        </div>
        <form onSubmit={handleLogin} className="admin-login-form">
          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@vexa.com" required />
          <Input label="Contraseña" type="password" value={password}
            onChange={e => setPassword(e.target.value)} placeholder="••••••••" required={!localLogin} />
          {localLogin && (
            <div className="admin-settings-info yellow">
              Modo local (Supabase no responde): entrás con cualquier email, sin contraseña. Los cambios se guardan solo en
              este navegador. Solo funciona con <code>npm run dev</code>.
            </div>
          )}
          {error && <div className="admin-login-error">{error}</div>}
          <Btn className="admin-btn-block" disabled={logging}>
            {logging ? "Ingresando..." : "Ingresar →"}
          </Btn>
        </form>
      </div>
    </div>
  );

  return <AdminApp />;
}
