import { lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from 'framer-motion';
import {
  ArrowUpRight,
  Box,
  Check,
  Code2,
  Copy,
  FileCode2,
  Image,
  Play,
  RotateCcw,
  Terminal,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useExperience } from '../digital/Experience';
import { useVisibility } from '../../hooks/useVisibility';
import type { Product } from '../../types/product';
import type { ModelStatus } from '../../scenes/ModelLoader';

const LiveGarment = lazy(() =>
  import('../viewer/ProductViewer').then((module) => ({ default: module.ProductViewer })),
);
type Mode = 'source' | 'live' | 'photo';
type Phase = 'idle' | 'loading' | 'revealing' | 'ready' | 'error';

function RevealMeter({ progress }: { progress: MotionValue<number> }) {
  const [percent, setPercent] = useState(() => Math.round(progress.get() * 100));
  useMotionValueEvent(progress, 'change', (value) => setPercent(Math.round(value * 100)));
  return (
    <div
      className="fashion-reveal-meter"
      role="progressbar"
      aria-label="Reconstrucción holográfica de la prenda"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
    >
      <span>
        RECONSTRUCCIÓN HOLOGRÁFICA <b>{String(percent).padStart(2, '0')}%</b>
      </span>
      <div>
        <motion.i style={{ scaleX: progress }} />
      </div>
    </div>
  );
}

function SourceLine({
  number,
  children,
  changed,
  active = false,
}: {
  number: number;
  children?: ReactNode;
  changed?: string;
  active?: boolean;
}) {
  return (
    <code
      key={changed}
      className={`${changed ? 'source-selection-line' : ''} ${active ? 'source-active-line' : ''}`}
    >
      <i aria-hidden="true">{String(number).padStart(2, '0')}</i>
      <span>{children || '\u00a0'}</span>
    </code>
  );
}

export function CodeFashionStage({
  product,
  size,
  color,
}: {
  product: Product;
  size: string;
  color: string;
}) {
  const [mode, setMode] = useState<Mode>('source');
  const [phase, setPhase] = useState<Phase>('idle');
  const [networkProgress, setNetworkProgress] = useState(0);
  const [session, setSession] = useState(0);
  const [back, setBack] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const { stopped, paused, systemReduced } = useExperience();
  const stage = useRef<HTMLDivElement>(null);
  const projection = useRef<HTMLDivElement>(null);
  const visible = useVisibility(projection);
  const progress = useMotionValue(0);
  const scanY = useTransform(progress, [0, 1], [360, 20]);
  const controller = useRef<AnimationPlaybackControls | undefined>(undefined);
  const instant = useRef(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const colorHex =
    product.colors.find((option) => option.name === color)?.hex || product.colors[0].hex;
  const sourceText = `// Tu selección, en código.\nexport const loadout = {\n  piece: ${JSON.stringify(product.name)},\n  reference: ${JSON.stringify(product.reference)},\n  size: ${JSON.stringify(size)},\n  color: ${JSON.stringify(color)},\n  hex: ${JSON.stringify(colorHex)},\n  collection: ${JSON.stringify(product.collection)}\n};\n\nexport default loadout;`;
  useMotionValueEvent(progress, 'change', (value) =>
    stage.current?.setAttribute('data-hologram-progress', value.toFixed(4)),
  );
  useEffect(
    () => () => {
      controller.current?.stop();
      clearTimeout(copyTimer.current);
    },
    [],
  );
  useEffect(() => {
    if (phase !== 'revealing') return;
    if (systemReduced || instant.current) {
      progress.set(1);
      setPhase('ready');
      return;
    }
    const animation = animate(progress, 1, {
      duration: 2.4 * (1 - progress.get()),
      ease: 'linear',
      onComplete: () => setPhase('ready'),
    });
    controller.current = animation;
    if (paused || !visible) animation.pause();
    return () => animation.stop();
  }, [phase, systemReduced, progress]);
  useEffect(() => {
    if (phase !== 'revealing') return;
    if (paused || !visible) controller.current?.pause();
    else controller.current?.play();
  }, [paused, visible, phase]);
  const onStatus = useCallback((status: ModelStatus) => {
    setNetworkProgress(status.progress);
    if (status.state === 'ready') setPhase('revealing');
    else setPhase(status.state === 'error' ? 'error' : 'loading');
  }, []);
  const materialize = (keyboard = false) => {
    controller.current?.stop();
    instant.current = keyboard;
    progress.set(0);
    setNetworkProgress(0);
    setPhase('loading');
    setSession((value) => value + 1);
    setMode('live');
    requestAnimationFrame(() => {
      projection.current?.scrollIntoView({
        block: 'center',
        behavior: stopped || keyboard ? 'instant' : 'smooth',
      });
      if (keyboard) projection.current?.focus({ preventScroll: true });
    });
  };
  const show = (next: Mode) => {
    controller.current?.stop();
    setMode(next);
    setPhase('idle');
    progress.set(0);
  };
  const copySource = async () => {
    try {
      await navigator.clipboard.writeText(sourceText);
      setCopyState('copied');
    } catch {
      setCopyState('error');
    }
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopyState('idle'), 2000);
  };
  const label =
    phase === 'loading'
      ? 'Recibiendo geometría'
      : phase === 'revealing'
        ? 'Reconstruyendo tu prenda'
        : phase === 'ready'
          ? 'Tu identidad, materializada'
          : phase === 'error'
            ? 'Explora la vista alternativa'
            : 'Del código a tu mundo';
  return (
    <div
      ref={stage}
      className={`code-fashion-stage fashion-workbench ${phase === 'revealing' ? 'is-materializing' : ''}`}
      data-code-mode={mode}
      data-materialization-state={phase}
      data-hologram-progress="0"
    >
      <div className="fashion-workbench-chrome">
        <span className="fashion-window-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>RIWI / IDENTITY STUDIO</span>
        <span className="fashion-editor-connected">
          <i /> LIVE SELECTION
        </span>
      </div>
      <div className="fashion-workspace">
        <div className="fashion-editor">
          <div className="fashion-editor-tab">
            <FileCode2 size={14} />
            <span>loadout.config.ts</span>
            <span className="fashion-tab-dirty" aria-hidden="true" />
            <button onClick={() => void copySource()} aria-label="Copiar código">
              {copyState === 'copied' ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
          <div className="fashion-editor-breadcrumb">
            collection <span>/</span> drop-001 <span>/</span> tu-identidad
          </div>
          <div
            className="fashion-source-lines fashion-editor-source"
            aria-label="Código de tu selección"
          >
            <SourceLine number={1}>
              <span className="syntax-comment">// Tu selección, en código.</span>
            </SourceLine>
            <SourceLine number={2}>
              <b>export const</b> <span className="syntax-variable">loadout</span> = {'{'}
            </SourceLine>
            <SourceLine number={3} changed={product.id}>
              {' '}
              piece: <em>{JSON.stringify(product.name)}</em>,
            </SourceLine>
            <SourceLine number={4}>
              {' '}
              reference: <em>{JSON.stringify(product.reference)}</em>,
            </SourceLine>
            <SourceLine number={5} changed={size}>
              {' '}
              size: <em>{JSON.stringify(size)}</em>,
            </SourceLine>
            <SourceLine number={6} changed={color}>
              {' '}
              color: <em>{JSON.stringify(color)}</em>,
            </SourceLine>
            <SourceLine number={7} changed={colorHex}>
              {' '}
              hex: <em>{JSON.stringify(colorHex)}</em>,{' '}
              <span className="source-color-dot" style={{ background: colorHex }} />
            </SourceLine>
            <SourceLine number={8}>
              {' '}
              collection: <em>{JSON.stringify(product.collection)}</em>
            </SourceLine>
            <SourceLine number={9}>{'}'};</SourceLine>
            <SourceLine number={10} />
            <SourceLine number={11} active={phase === 'revealing'}>
              <b>export default</b> <span className="syntax-variable">loadout</span>;
            </SourceLine>
          </div>
          <div className="fashion-editor-console" aria-live="polite">
            <div>
              <Terminal size={12} />
              <span>OUTPUT</span>
              <span>LOCAL SESSION</span>
            </div>
            <p>
              <b>›</b>{' '}
              {phase === 'loading'
                ? 'Cargando modelo y materiales…'
                : phase === 'revealing'
                  ? 'Reconstrucción holográfica en curso…'
                  : phase === 'ready'
                    ? 'Geometría lista. Explora tu creación.'
                    : phase === 'error'
                      ? 'Modelo no disponible. La foto sigue lista.'
                      : 'Configuración sincronizada con tu selección.'}
            </p>
            {copyState !== 'idle' && (
              <p role="status">
                {copyState === 'copied'
                  ? 'Código copiado.'
                  : 'No se pudo copiar. Selecciona el código para copiarlo.'}
              </p>
            )}
          </div>
          <div className="fashion-editor-action">
            <span>ESCRIBE TU PRÓXIMA VERSIÓN.</span>
            <button className="system-button" onClick={(event) => materialize(event.detail === 0)}>
              <Play size={14} />
              <span>Materializar prenda 3D</span>
              <ArrowUpRight size={16} />
            </button>
          </div>
          <div className="fashion-editor-status">
            <span>
              <Code2 size={11} /> TypeScript
            </span>
            <span>
              UTF-8 <Check size={11} /> SELECCIÓN VÁLIDA
            </span>
          </div>
        </div>
        <div
          ref={projection}
          className="fashion-projection"
          tabIndex={-1}
          role="region"
          aria-label="Proyección de tu prenda"
        >
          <div className="fashion-projection-title">
            <span>
              <i />{' '}
              {mode === 'live'
                ? 'HOLOGRAPHIC OUTPUT'
                : mode === 'photo'
                  ? 'EDITORIAL VIEW'
                  : 'PROJECTION PREVIEW'}
            </span>
            <span>{product.reference}</span>
          </div>
          <div className={`fashion-projection-space ${mode === 'live' ? 'has-live-model' : ''}`}>
            <div className="fashion-projection-grid" aria-hidden="true" />
            <div className="fashion-projection-floor" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            {mode === 'source' && (
              <div className="fashion-blueprint" aria-hidden="true">
                <img src={product.images[0].src} alt="" width="900" height="1000" />
                <span>READY TO MATERIALIZE</span>
              </div>
            )}
            {mode === 'live' && (
              <div className="fashion-live">
                <Suspense
                  fallback={
                    <div className="fashion-asset-loading" role="status">
                      Preparando el visor…
                    </div>
                  }
                >
                  <LiveGarment
                    key={`${product.id}-${session}`}
                    product={product}
                    color={colorHex}
                    compact
                    onStatusChange={onStatus}
                    hologram={{ progress, active: phase === 'revealing' || phase === 'loading' }}
                  />
                </Suspense>
              </div>
            )}
            {mode === 'photo' && (
              <div className="fashion-photo">
                <img
                  src={product.images[back ? 1 : 0].src}
                  alt={`${product.name}, vista ${back ? 'posterior' : 'frontal'}`}
                  width="900"
                  height="1000"
                  loading="lazy"
                />
                <button className="fashion-photo-flip" onClick={() => setBack((value) => !value)}>
                  <RotateCcw size={12} />
                  {back ? 'VER FRENTE' : 'VER ESPALDA'}
                </button>
              </div>
            )}
            {phase === 'revealing' && mode === 'live' && (
              <motion.div className="fashion-holo-scan" style={{ y: scanY }} aria-hidden="true">
                <i />
                <span>BUILDING IDENTITY</span>
              </motion.div>
            )}
          </div>
          <div className="fashion-projection-readout">
            <span className="fashion-output-label">{label}</span>
            {phase === 'loading' && mode === 'live' && (
              <div className="fashion-network-status" role="status">
                <span>DESCARGA DEL MODELO</span>
                <b>{networkProgress > 0 ? `${networkProgress}%` : 'EN CURSO'}</b>
                <div>
                  <i style={{ transform: `scaleX(${networkProgress / 100})` }} />
                </div>
              </div>
            )}
            {mode === 'live' && (phase === 'revealing' || phase === 'ready') && (
              <RevealMeter progress={progress} />
            )}
            {mode === 'source' && (
              <p>Selecciona tu pieza y transforma su código en una prenda 3D.</p>
            )}
            {phase === 'ready' && (
              <span className="fashion-output-ready">
                <Check size={11} /> GEOMETRÍA COMPLETA · ARRASTRA PARA EXPLORAR
              </span>
            )}
          </div>
          <div className="fashion-mode-bar" aria-label="Presentación de la prenda">
            <button aria-pressed={mode === 'source'} onClick={() => show('source')}>
              <Code2 size={13} />
              Código
            </button>
            <button
              aria-pressed={mode === 'live'}
              onClick={(event) => materialize(event.detail === 0)}
            >
              <Box size={13} />
              3D
            </button>
            <button aria-pressed={mode === 'photo'} onClick={() => show('photo')}>
              <Image size={13} />
              Foto
            </button>
            <Link to={`/producto/${product.id}`}>
              Ficha <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
