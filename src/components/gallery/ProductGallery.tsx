import { useState } from 'react';
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import type { Product } from '../../types/product';
import { IconButton } from '../ui/Button';
import { Modal } from '../ui/Modal';
export function ProductGallery({ product }: { product: Product }) {
  const [index, setIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const change = (direction: number) =>
    setIndex((previous) => (previous + direction + product.images.length) % product.images.length);
  const content = (expanded = false) => (
    <div
      className="gallery-content"
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          change(-1);
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          change(1);
        }
      }}
    >
      <div className="gallery-main">
        <img key={index} src={product.images[index].src} alt={product.images[index].alt} />
        <div className="gallery-arrows">
          <IconButton label="Imagen anterior" onClick={() => change(-1)}>
            <ChevronLeft size={21} />
          </IconButton>
          <IconButton label="Imagen siguiente" onClick={() => change(1)}>
            <ChevronRight size={21} />
          </IconButton>
        </div>
        <span className="gallery-count mono" aria-live="polite">
          {index + 1} / {product.images.length}
        </span>
        {!expanded && (
          <IconButton
            label="Ampliar imagen"
            className="gallery-expand"
            onClick={() => setFullscreen(true)}
          >
            <Expand size={18} />
          </IconButton>
        )}
      </div>
      <div className="gallery-thumbnails">
        {product.images.map((image, i) => (
          <button
            key={image.src}
            aria-label={`Ver imagen ${i + 1}`}
            aria-pressed={i === index}
            onClick={() => setIndex(i)}
          >
            <img src={image.src} alt="" />
          </button>
        ))}
        <span className="mono">
          RENDERS DEL MODELO
          <br />
          DE DEMOSTRACIÓN
        </span>
      </div>
    </div>
  );
  return (
    <>
      {content()}
      {fullscreen && (
        <Modal
          title={`${product.name} / GALERÍA`}
          onClose={() => setFullscreen(false)}
          className="gallery-modal"
        >
          {content(true)}
        </Modal>
      )}
    </>
  );
}
