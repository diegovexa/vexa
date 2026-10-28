// Imagen de producto centrada sobre un brillo del color de la línea.
// Los recortes (PNG/WebP con transparencia) se muestran enteros; las fotos ocupan todo el recuadro.
import { getLineaByKey } from "../data/lineas";
import { tipoEmoji } from "../data/store";
import "../styles/shared.css";

export default function ProductImage({ product, src, alt, linea, className = "", imgRef }) {
  const color = getLineaByKey(linea || product?.linea)?.color || "#888";
  const url = src ?? product?.image_url;
  const foto = product?.foto;

  return (
    <div className={`pimg ${foto ? "is-photo" : ""} ${className}`} style={{ "--glow": color }}>
      {url ? (
        <img ref={imgRef} src={url} alt={alt || product?.producto || ""} loading="lazy" draggable="false" />
      ) : (
        <span className="pimg-emoji" aria-hidden="true">{tipoEmoji(product?.tipo)}</span>
      )}
    </div>
  );
}
