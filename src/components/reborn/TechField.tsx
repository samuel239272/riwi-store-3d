import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useTransform,
  type MotionStyle,
} from 'framer-motion';
import { Database, Pin, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { technologies } from '../../data/technologies';
import { assetUrl } from '../../utils/assets';
import { useExperience } from '../digital/Experience';
import { useReborn } from './RebornExperience';

type Viewport = { width: number; height: number };
type Anchor = { id: string; x: number; y: number; size: number };
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function FloatingTechnology({
  index,
  active,
  viewport,
  onAnchor,
  children,
}: {
  index: number;
  active: boolean;
  viewport: Viewport;
  onAnchor: (anchor: Anchor) => void;
  children: ReactNode;
}) {
  const { stopped } = useExperience();
  const { ready } = useReborn();
  const { scrollY } = useScroll();
  const clock = useRef(0);
  const { width: w, height: h } = viewport;
  const size = w < 760 ? 48 : 64;
  const point = (time: number) => {
    const angle = time * 0.000085 * (1 + index * 0.055) + (index * Math.PI) / 3 + 0.1;
    const sine = Math.sin(angle);
    const depth = stopped
      ? 0
      : Math.sin(scrollY.get() / (850 + index * 170) + index * 0.65) * h * (0.035 + index * 0.007);
    return {
      x: clamp((0.5 + 0.43 * Math.cos(angle)) * w - size / 2, 10, w - size - 10),
      y: clamp(
        (0.48 + 0.34 * sine + 0.28 * Math.pow(Math.max(0, -sine), 8)) * h + depth,
        112,
        h - size - 20,
      ),
    };
  };
  const initial = point(0);
  const x = useMotionValue(initial.x);
  const y = useMotionValue(initial.y);
  const rotate = useMotionValue(0);
  useLayoutEffect(() => {
    const next = point(clock.current);
    x.set(next.x);
    y.set(next.y);
    if (active) onAnchor({ id: technologies[index].id, x: next.x, y: next.y, size });
  }, [w, h]);
  useLayoutEffect(() => {
    if (active) onAnchor({ id: technologies[index].id, x: x.get(), y: y.get(), size });
  }, [active, onAnchor]);
  useAnimationFrame((_, delta) => {
    if (active || stopped || !ready || document.hidden) return;
    clock.current += Math.min(delta, 50);
    const next = point(clock.current);
    const follow = 1 - Math.exp(-delta / 200);
    x.set(x.get() + (next.x - x.get()) * follow);
    y.set(y.get() + (next.y - y.get()) * follow);
    rotate.set(Math.sin(clock.current / (5200 + index * 370) + index) * 4);
  });
  return (
    <motion.div
      className={`field-orb ${active ? 'is-open' : ''}`}
      data-depth={index + 1}
      style={
        {
          x,
          y,
          rotate,
          width: size,
          height: size,
          scale: 0.86 + index * 0.035,
          opacity: active ? 1 : 0.58 + index * 0.045,
          '--tech-color': technologies[index].color,
        } as MotionStyle
      }
    >
      {children}
    </motion.div>
  );
}

export function TechOrbit() {
  const { transition, state } = useReborn();
  const { stopped } = useExperience();
  const location = useLocation();
  const opacity = useTransform(transition, [0, 0.6, 1], [0, 0, 1]);
  const [viewport, setViewport] = useState({ width: innerWidth, height: innerHeight });
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<string | null>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [keyboard, setKeyboard] = useState(false);
  const leaveTimer = useRef<number | undefined>(undefined);
  const candidate = pinned ?? hovered ?? focused;
  const active = candidate === dismissed ? null : candidate;
  const hidden = state === 'BOOT' || state === 'INTRO_PLAYING';
  const onAnchor = useCallback(
    (next: Anchor) =>
      setAnchor((previous) =>
        previous?.id === next.id &&
        previous.x === next.x &&
        previous.y === next.y &&
        previous.size === next.size
          ? previous
          : next,
      ),
    [],
  );
  const hold = (id: string) => {
    clearTimeout(leaveTimer.current);
    setHovered(id);
    if (dismissed !== id) setDismissed(null);
  };
  const leave = () => {
    clearTimeout(leaveTimer.current);
    leaveTimer.current = window.setTimeout(() => setHovered(null), 140);
  };
  const close = useCallback((id: string) => {
    clearTimeout(leaveTimer.current);
    setHovered(null);
    setFocused(null);
    setPinned(null);
    setDismissed(id);
    document.getElementById(`tech-trigger-${id}`)?.focus({ preventScroll: true });
  }, []);
  useEffect(() => {
    const resize = () => setViewport({ width: innerWidth, height: innerHeight });
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      clearTimeout(leaveTimer.current);
    };
  }, []);
  useEffect(() => {
    setHovered(null);
    setFocused(null);
    setPinned(null);
    setDismissed(null);
  }, [location.pathname, hidden]);
  useEffect(() => {
    if (!active) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close(active);
      }
    };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [active, close]);
  const technology = technologies.find((item) => item.id === active);
  const host = document.getElementById('reborn-tech-overlays');
  const panelWidth = Math.min(320, viewport.width - 32);
  const panelHeight = Math.min(248, Math.max(90, viewport.height - 120));
  const minTop = Math.max(
    16,
    Math.min(viewport.width < 760 ? 88 : 112, viewport.height - panelHeight - 16),
  );
  const panelLeft = anchor ? clamp(anchor.x - 24, 16, viewport.width - panelWidth - 16) : 16;
  const panelTop = anchor
    ? clamp(
        anchor.y > viewport.height * 0.55
          ? anchor.y - panelHeight - 12
          : anchor.y + anchor.size + 12,
        minTop,
        viewport.height - panelHeight - 16,
      )
    : minTop;
  return (
    <>
      <motion.div
        className="tech-field tech-field-unframed"
        style={{ opacity }}
        aria-label="RIWI Tech Orbit"
        aria-hidden={hidden}
        inert={hidden}
      >
        {technologies.map((item, index) => (
          <FloatingTechnology
            key={item.id}
            index={index}
            active={active === item.id}
            viewport={viewport}
            onAnchor={onAnchor}
          >
            <button
              id={`tech-trigger-${item.id}`}
              className="field-trigger tech-trigger-unframed"
              aria-label={`Explorar tecnología ${item.name}`}
              aria-expanded={active === item.id}
              aria-controls={`tech-info-${item.id}`}
              aria-pressed={pinned === item.id}
              onMouseEnter={() => {
                setKeyboard(false);
                if (viewport.width >= 760) hold(item.id);
              }}
              onMouseLeave={leave}
              onFocus={(event) => {
                setKeyboard(event.currentTarget.matches(':focus-visible'));
                clearTimeout(leaveTimer.current);
                setFocused(item.id);
              }}
              onBlur={(event) => {
                if (
                  !(
                    event.relatedTarget instanceof Element &&
                    event.relatedTarget.closest('.tech-inspector')
                  )
                ) {
                  setFocused(null);
                  setDismissed(null);
                }
              }}
              onClick={(event) => {
                setKeyboard(event.detail === 0);
                setDismissed(null);
                setPinned((value) => (value === item.id ? null : item.id));
              }}
            >
              {item.icon ? (
                <span
                  className="tech-glyph"
                  aria-hidden="true"
                  style={{ maskImage: `url("${assetUrl(`/tech/${item.icon}.svg`)}")` }}
                />
              ) : (
                <Database size={36} aria-hidden="true" />
              )}
            </button>
          </FloatingTechnology>
        ))}
      </motion.div>
      {technology &&
        anchor?.id === active &&
        host &&
        !hidden &&
        createPortal(
          <motion.aside
            key={technology.id}
            id={`tech-info-${technology.id}`}
            className="tech-inspector"
            role="region"
            aria-labelledby={`tech-title-${technology.id}`}
            initial={stopped || keyboard ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: stopped || keyboard ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={
              {
                left: panelLeft,
                top: panelTop,
                width: panelWidth,
                maxHeight: panelHeight,
                '--tech-color': technology.color,
              } as MotionStyle
            }
            onMouseEnter={() => hold(technology.id)}
            onMouseLeave={leave}
            onFocusCapture={() => setFocused(technology.id)}
          >
            <span className="tech-inspector-file">~/stack/{technology.id}.md</span>
            <div className="tech-inspector-heading">
              <h3 id={`tech-title-${technology.id}`}>{technology.name}</h3>
              <button
                onClick={() =>
                  setPinned((value) => (value === technology.id ? null : technology.id))
                }
                aria-label={`Fijar información de ${technology.name}`}
                aria-pressed={pinned === technology.id}
              >
                <Pin size={15} />
              </button>
              <button
                aria-label={`Cerrar información de ${technology.name}`}
                onClick={() => close(technology.id)}
              >
                <X size={17} />
              </button>
            </div>
            <span className="tech-category">{technology.category}</span>
            <p>{technology.description}</p>
            <span className="tech-application">APLICACIÓN / {technology.application}</span>
          </motion.aside>,
          host,
        )}
    </>
  );
}
