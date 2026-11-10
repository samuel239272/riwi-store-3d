import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useExperience } from '../digital/Experience';
import {
  Expand,
  Minimize,
  Minus,
  Plus,
  RotateCcw,
  MousePointer2,
  LoaderCircle,
  Sun,
  Rotate3D,
  Scan,
  X,
} from 'lucide-react';
import type { Product, Vector3Tuple } from '../../types/product';
import {
  CAMERA_PRESETS,
  PRESET_LABELS,
  type CameraCommand,
  type CameraPreset,
} from '../../types/viewer';
import type { ModelStatus } from '../../scenes/ModelLoader';
import type { GarmentHologram } from '../../three/garmentHologram';
import { IconButton } from '../ui/Button';
import { useVisibility } from '../../hooks/useVisibility';
import { useHotspots } from '../../hooks/useHotspots';
import { supportsWebGL } from '../../utils/webgl';
import '../../styles/viewer.css';

const ProductScene = lazy(() => import('../../scenes/ProductScene'));
const presets: CameraPreset[] = ['front', 'rear', 'left', 'right'];

export function ProductViewer({
  product,
  color,
  compact = false,
  onGallery,
  onStatusChange,
  hologram,
}: {
  product: Product;
  color?: string;
  compact?: boolean;
  onGallery?: () => void;
  onStatusChange?: (status: ModelStatus) => void;
  hologram?: GarmentHologram;
}) {
  const root = useRef<HTMLDivElement>(null);
  const visible = useVisibility(root);
  const { stopped: reducedMotion, systemReduced } = useExperience();
  const [webgl] = useState(supportsWebGL);
  const [status, setStatus] = useState<ModelStatus>({ state: 'loading', progress: 0 });
  const [command, setCommand] = useState<CameraCommand>({ id: 0 });
  const [preset, setPreset] = useState<CameraPreset>('perspective');
  const [fullscreen, setFullscreen] = useState(false);
  const [details, setDetails] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [lighting, setLighting] = useState<'studio' | 'soft'>('studio');
  const [retry, setRetry] = useState(0);
  const hotspots = useHotspots(product.components);
  const fallback = !webgl || !product.model3D || status.state === 'error';
  const statusCallback = useRef(onStatusChange);
  statusCallback.current = onStatusChange;
  useEffect(() => {
    statusCallback.current?.(fallback ? { state: 'error', progress: 0 } : status);
  }, [status, fallback]);
  const selectPreset = (value: CameraPreset) => {
    setAutoRotate(false);
    setPreset(value);
    setCommand((previous) => ({
      id: previous.id + 1,
      position: CAMERA_PRESETS[value],
      target: [0, 0.12, 0],
    }));
  };
  const zoom = (factor: number) =>
    setCommand((previous) => ({ id: previous.id + 1, zoom: factor }));
  const focus = useCallback((point: Vector3Tuple) => {
    const target = point.map((value) => Math.max(-1.2, Math.min(1.2, value))) as Vector3Tuple;
    setCommand((previous) => ({ id: previous.id + 1, target, zoom: 0.78 }));
  }, []);
  useEffect(() => {
    const update = () => setFullscreen(document.fullscreenElement === root.current);
    document.addEventListener('fullscreenchange', update);
    return () => document.removeEventListener('fullscreenchange', update);
  }, []);
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (root.current?.requestFullscreen) await root.current.requestFullscreen();
      else setFullscreen((value) => !value);
    } catch {
      setFullscreen((value) => !value);
    }
  };
  useEffect(() => {
    if (!fullscreen) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFullscreen(false);
    };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [fullscreen]);
  return (
    <div
      ref={root}
      className={`product-viewer ${compact ? 'compact' : ''} ${fullscreen ? 'is-fullscreen' : ''}`}
      data-testid="product-viewer"
      data-model-status={fallback ? 'fallback' : status.state}
      data-model-progress={status.progress}
      data-hologram-active={Boolean(hologram?.active && !systemReduced)}
    >
      <div className="viewer-top">
        <span className="viewer-badge">
          <i />
          {fallback ? 'IMÁGENES DEL PRODUCTO' : 'LIVE / 3D STUDIO'}
        </span>
        <span>{product.reference}</span>
      </div>
      <div className="viewer-watermark" aria-hidden="true">
        360<span>°</span>
      </div>
      <div
        className="scene-container"
        tabIndex={fallback ? -1 : 0}
        role="region"
        aria-label="Visor interactivo. Flechas para cambiar de vista, más y menos para zoom, cero para restablecer."
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (
            ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '-', '=', '0'].includes(
              event.key,
            )
          )
            event.preventDefault();
          if (event.key === 'ArrowLeft') selectPreset('left');
          if (event.key === 'ArrowRight') selectPreset('right');
          if (event.key === 'ArrowUp') selectPreset('top');
          if (event.key === 'ArrowDown') selectPreset('front');
          if (event.key === '+' || event.key === '=') zoom(0.8);
          if (event.key === '-') zoom(1.25);
          if (event.key === '0') selectPreset('perspective');
        }}
      >
        {fallback ? (
          <div className="viewer-fallback">
            <img src={product.images[0]?.src} alt={product.images[0]?.alt ?? product.name} />
            <div className="fallback-message" role="status">
              <strong>
                {!webgl
                  ? 'Tu dispositivo no dispone de WebGL.'
                  : !product.model3D
                    ? 'Modelo 3D aún no disponible.'
                    : 'No se pudo cargar el modelo 3D.'}
              </strong>
              <span>Puedes seguir explorando las imágenes.</span>
              {onGallery && <button onClick={onGallery}>Abrir galería →</button>}
              {webgl && product.model3D && (
                <button
                  onClick={() => {
                    setStatus({ state: 'loading', progress: 0 });
                    setRetry((value) => value + 1);
                  }}
                >
                  Reintentar carga
                </button>
              )}
            </div>
          </div>
        ) : (
          <Suspense
            fallback={
              <div className="viewer-loading">
                <LoaderCircle className="spinner" size={22} />
                <span>Compilando experiencia 3D…</span>
              </div>
            }
          >
            <ProductScene
              key={`${product.id}-${retry}`}
              product={product}
              color={color ?? product.colors[0]?.hex}
              command={command}
              visible={visible}
              showHotspots={details && status.state === 'ready'}
              selectedId={hotspots.selected?.id}
              reducedMotion={reducedMotion}
              autoRotate={autoRotate}
              lighting={lighting}
              onSelect={hotspots.select}
              onStatus={setStatus}
              onFocus={focus}
              hologram={systemReduced ? undefined : hologram}
            />
          </Suspense>
        )}
      </div>
      {!fallback && status.state === 'loading' && (
        <div className="loading-status" role="status">
          $ loading garment{status.progress > 0 ? `… ${status.progress}%` : '…'}
        </div>
      )}
      {!fallback && (
        <>
          <div className="viewer-tools">
            <IconButton label="Acercar" onClick={() => zoom(0.8)}>
              <Plus size={17} />
            </IconButton>
            <IconButton label="Alejar" onClick={() => zoom(1.25)}>
              <Minus size={17} />
            </IconButton>
            <span className="tool-divider" />
            <IconButton label="Restablecer cámara" onClick={() => selectPreset('perspective')}>
              <RotateCcw size={17} />
            </IconButton>
            <IconButton
              label={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
              onClick={() => void toggleFullscreen()}
            >
              {fullscreen ? <Minimize size={17} /> : <Expand size={17} />}
            </IconButton>
          </div>
          {!compact && (
            <>
              <div className="camera-presets" aria-label="Vistas de cámara">
                {presets.map((value) => (
                  <button
                    key={value}
                    aria-pressed={preset === value}
                    onClick={() => selectPreset(value)}
                  >
                    {PRESET_LABELS[value]}
                  </button>
                ))}
              </div>
              <div className="viewer-options">
                <button
                  aria-pressed={autoRotate && !reducedMotion}
                  disabled={reducedMotion}
                  title={
                    reducedMotion
                      ? 'Desactivada por tu preferencia de movimiento reducido'
                      : undefined
                  }
                  onClick={() => setAutoRotate((value) => !value)}
                >
                  <Rotate3D size={15} /> Rotación automática
                </button>
                <button
                  aria-label="Cambiar iluminación"
                  aria-pressed={lighting === 'soft'}
                  onClick={() => setLighting((value) => (value === 'studio' ? 'soft' : 'studio'))}
                >
                  <Sun size={15} /> Luz {lighting === 'studio' ? 'estudio' : 'suave'}
                </button>
                {product.components.length > 0 && (
                  <button
                    aria-pressed={details}
                    onClick={() => {
                      setDetails((value) => !value);
                      hotspots.close();
                    }}
                  >
                    <Scan size={15} /> Detalles
                  </button>
                )}
              </div>
            </>
          )}
          <div className="viewer-hint">
            <MousePointer2 size={13} />
            <span>ARRASTRA PARA EXPLORAR</span>
            <span className="hint-line" />
            <span>360°</span>
          </div>
          {details && !compact && (
            <div className="component-selector">
              <label htmlFor={`component-${product.id}`}>Inspeccionar</label>
              <select
                id={`component-${product.id}`}
                value={hotspots.selected?.id ?? ''}
                onChange={(event) => hotspots.select(event.target.value || null)}
              >
                <option value="">Elige un detalle</option>
                {product.components.map((component) => (
                  <option key={component.id} value={component.id}>
                    {component.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {hotspots.selected && details && (
            <div className="hotspot-panel" role="status">
              <IconButton label="Cerrar detalle" onClick={hotspots.close}>
                <X size={16} />
              </IconButton>
              <span className="mono">// DETALLE DEL DISEÑO</span>
              <h3>{hotspots.selected.name}</h3>
              <p>{hotspots.selected.description}</p>
            </div>
          )}
        </>
      )}
      <span className="model-note">
        {product.illustrative ? 'Modelo conceptual · diseño de muestra' : 'Modelo del producto'}
      </span>
    </div>
  );
}
