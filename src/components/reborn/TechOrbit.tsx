import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Database, Pin, X } from 'lucide-react';
import { technologies } from '../../data/technologies';
import { assetUrl } from '../../utils/assets';
import { useVisibility } from '../../hooks/useVisibility';
import { useExperience } from '../digital/Experience';

export function TechOrbit() {
  const root = useRef<HTMLDivElement>(null);
  const visible = useVisibility(root);
  const { stopped } = useExperience();
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<string | null>(null);
  const mobile = innerWidth < 760;
  const candidate = pinned ?? (mobile ? null : (hovered ?? focused));
  const active = candidate === dismissed ? null : candidate;
  useEffect(() => {
    if (!active || !mobile) return;
    const frame = requestAnimationFrame(() =>
      root.current?.scrollIntoView({ block: 'start', behavior: stopped ? 'instant' : 'smooth' }),
    );
    return () => cancelAnimationFrame(frame);
  }, [active, mobile, stopped]);
  const close = (id: string) => {
    setPinned(null);
    setHovered(null);
    setFocused(null);
    setDismissed(id);
    document.getElementById(`tech-trigger-${id}`)?.focus();
  };
  return (
    <div
      ref={root}
      className={`tech-orbit ${visible ? '' : 'orbit-paused'}`}
      aria-label="RIWI Tech Orbit"
    >
      <span className="orbit-caption">KNOWLEDGE / IN ORBIT</span>
      {technologies.map((technology, index) => {
        const open = active === technology.id;
        return (
          <div
            key={technology.id}
            className={`tech-orb orb-${technology.id} ${index % 2 ? 'align-right' : ''} ${open ? 'is-open' : ''}`}
            style={
              {
                '--tech-color': technology.color,
                '--orbit-index': index,
                '--mobile-col': index % 2,
                '--mobile-row': Math.floor(index / 2),
                '--float-delay': `${index * -0.9}s`,
                '--float-duration': `${5 + index * 0.55}s`,
              } as CSSProperties
            }
            onMouseEnter={() => {
              setHovered(technology.id);
              if (dismissed !== technology.id) setDismissed(null);
            }}
            onMouseLeave={() => {
              setHovered(null);
              setDismissed(null);
            }}
            onFocusCapture={() => setFocused(technology.id)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null))
                setFocused(null);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                close(technology.id);
              }
            }}
          >
            <div className="tech-capsule">
              <button
                id={`tech-trigger-${technology.id}`}
                className="tech-trigger"
                aria-label={`Explorar tecnología ${technology.name}`}
                aria-expanded={open}
                aria-controls={`tech-info-${technology.id}`}
                aria-pressed={pinned === technology.id}
                onClick={() => {
                  setDismissed(null);
                  setPinned((value) => (value === technology.id ? null : technology.id));
                }}
              >
                {technology.icon ? (
                  <span
                    className="tech-glyph"
                    aria-hidden="true"
                    style={{ maskImage: `url("${assetUrl(`/tech/${technology.icon}.svg`)}")` }}
                  />
                ) : (
                  <Database size={28} aria-hidden="true" />
                )}
                <span className="tech-trigger-label">
                  {technology.name === 'JavaScript'
                    ? 'JS'
                    : technology.name === 'TypeScript'
                      ? 'TS'
                      : technology.name}
                </span>
              </button>
              <div className="tech-details" id={`tech-info-${technology.id}`} aria-hidden={!open}>
                <div className="tech-info-heading">
                  <span>{technology.name}</span>
                  <button
                    tabIndex={open ? 0 : -1}
                    onClick={() => close(technology.id)}
                    aria-label={`Cerrar información de ${technology.name}`}
                  >
                    <X size={13} />
                  </button>
                </div>
                <span className="tech-category">{technology.category}</span>
                <p>{technology.description}</p>
                <span className="tech-application">APLICACIÓN / {technology.application}</span>
                {pinned === technology.id && (
                  <span className="tech-pinned">
                    <Pin size={10} /> PANEL FIJADO
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
