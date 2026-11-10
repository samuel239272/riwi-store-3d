import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowDownRight,
  ArrowUpRight,
  ArrowRight,
  Asterisk,
  Braces,
  Check,
  Code2,
  CornerDownLeft,
  Fingerprint,
  GitBranch,
  Play,
  RotateCcw,
  Scan,
  Terminal,
} from 'lucide-react';
import { DevHero } from '../components/digital/DevHero';
import { useExperience } from '../components/digital/Experience';
import { ProductCard } from '../components/catalog/ProductCard';
import { products } from '../data/products';
import { assetUrl } from '../utils/assets';
import { usePageMeta } from '../hooks/usePageMeta';

function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const { stopped } = useExperience();
  return (
    <motion.div
      className={className}
      initial={stopped ? false : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: stopped ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

const themes = [
  { name: 'Lima', color: '#d3fa6a' },
  { name: 'Cian', color: '#6ae8ef' },
  { name: 'Violeta', color: '#c5a3ff' },
];

function IdentityLab({ theme, setTheme }: { theme: number; setTheme: (value: number) => void }) {
  const root = useRef<HTMLElement>(null);
  const inView = useInView(root, { once: true, amount: 0.25 });
  const { stopped } = useExperience();
  const [run, setRun] = useState(0);
  const [written, setWritten] = useState(0);
  const lines = [
    '// El futuro empieza con una idea.',
    "import { creativity } from '@riwi/community';",
    '',
    'const identity = {',
    "  mindset: 'never stop building',",
    `  accent: '${themes[theme].color}',`,
    "  uniform: 'your next version'",
    '};',
    '',
    'export default creativity.compile(identity);',
  ];
  const total = lines.join('\n').length;
  useEffect(() => {
    if (!inView) return;
    if (stopped) {
      setWritten(total);
      return;
    }
    setWritten(0);
    const timer = window.setInterval(
      () =>
        setWritten((value) => {
          if (value + 6 >= total) {
            window.clearInterval(timer);
            return total;
          }
          return value + 6;
        }),
      32,
    );
    return () => window.clearInterval(timer);
  }, [inView, run, stopped, total]);
  const progress = stopped ? 1 : Math.max(0, (written / total - 0.38) / 0.62);
  let position = 0;
  return (
    <section className="identity-section page-width" ref={root} aria-labelledby="identity-title">
      <Reveal className="identity-heading">
        <span className="dev-label">01 / SOURCE OF IDENTITY</span>
        <h2 id="identity-title">
          NO ES UN LOGO.
          <br />
          ES UN <span>LENGUAJE.</span>
        </h2>
        <p>
          La comunidad es nuestro código fuente.
          <br />
          Tu curiosidad le da vida. Ejecuta y descubre.
        </p>
      </Reveal>
      <Reveal className="identity-workspace">
        <div className="identity-editor">
          <div className="editor-tab">
            <Code2 size={14} />
            <span>identity.ts</span>
            <i />
            <span className="tab-close">×</span>
          </div>
          <div className="source-code" aria-label="Código de la identidad RIWI">
            <div className="code-path">
              <GitBranch size={12} /> riwi / src / you / identity.ts
            </div>
            {lines.map((line, index) => {
              const start = position;
              position += line.length + 1;
              return (
                <div className={`source-line line-${index}`} key={index}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <code>{line.slice(0, Math.max(0, written - start)) || ' '}</code>
                </div>
              );
            })}
          </div>
          <div className="editor-status">
            <span>
              <GitBranch size={11} /> main*
            </span>
            <span>
              TypeScript <Check size={12} />
            </span>
          </div>
        </div>
        <div className="identity-output">
          <div className="output-header">
            <span>
              <i className="live-dot" /> LIVE PREVIEW
            </span>
            <span>RIWI_IDENTITY / 1.0</span>
          </div>
          <div className="identity-logo-wrap">
            <span className="output-corner corner-1" />
            <span className="output-corner corner-2" />
            <img
              src={assetUrl('/logos/riwi-coder.png')}
              alt="RIWI. Be a coder, change your world"
              style={{ clipPath: stopped ? 'none' : `inset(0 ${(1 - progress) * 100}% 0 0)` }}
            />
            <span
              className="logo-write-head"
              style={{ left: `${progress * 100}%`, opacity: progress > 0 && progress < 1 ? 1 : 0 }}
            />
          </div>
          <div className="output-controls">
            <div>
              <span className="dev-label">COLOR.ACCENT</span>
              <div className="theme-swatches">
                {themes.map((item, index) => (
                  <button
                    type="button"
                    key={item.name}
                    style={{ background: item.color }}
                    onClick={() => setTheme(index)}
                    aria-label={`Tema ${item.name}`}
                    aria-pressed={theme === index}
                  >
                    {theme === index && <Check size={13} />}
                  </button>
                ))}
              </div>
            </div>
            <button
              className="compile-button"
              type="button"
              onClick={() => setRun((value) => value + 1)}
            >
              <Play size={13} fill="currentColor" /> COMPILAR IDENTIDAD <CornerDownLeft size={13} />
            </button>
          </div>
        </div>
        <div className="workspace-terminal">
          <Terminal size={13} />
          <span>~/riwi</span>
          <code>npm run build:your-world</code>
          <span className="compile-status" role="status">
            {written >= total
              ? '✓ Compilado. Ahora hazlo tuyo.'
              : '↳ Escribiendo una nueva versión...'}
          </span>
        </div>
      </Reveal>
    </section>
  );
}

function SourceCollection() {
  const [category, setCategory] = useState('todos');
  const categories = [
    { id: 'todos', name: 'Todo el código' },
    { id: 'clanes', name: 'Clanes' },
    { id: 'hoodies', name: 'Hoodies' },
    { id: 'camisetas', name: 'Camisetas' },
    { id: 'chaquetas', name: 'Outerwear' },
  ];
  const selected =
    category === 'todos'
      ? [products[0], products[8], products[1], products[3]]
      : products.filter((product) => product.published && product.category === category);
  return (
    <section
      className="source-collection page-width"
      id="source-collection"
      aria-labelledby="collection-title"
    >
      <Reveal className="dev-section-heading">
        <div>
          <span className="dev-label">02 / THE SOURCE COLLECTION</span>
          <h2 id="collection-title">
            FUERA DEL EDITOR.
            <br />
            <span>DENTRO DE TU MUNDO.</span>
          </h2>
        </div>
        <Link className="dev-text-button" to="/catalogo">
          VER LOS {products.filter((product) => product.published).length} ARCHIVOS{' '}
          <ArrowUpRight size={18} />
        </Link>
      </Reveal>
      <div className="collection-toolbar">
        <div className="source-filters" aria-label="Filtrar colección">
          {categories.map((item, index) => (
            <button
              key={item.id}
              aria-pressed={category === item.id}
              onClick={() => setCategory(item.id)}
            >
              <span>{String(index).padStart(2, '0')}</span> {item.name}
              {category === item.id && <span className="filter-mark">↗</span>}
            </button>
          ))}
        </div>
        <span className="dev-label collection-count" role="status">
          {String(selected.length).padStart(2, '0')} OBJETOS / READY TO WEAR
        </span>
      </div>
      <div className="source-products">
        {selected.map((product, index) => (
          <Reveal key={product.id} className="source-product">
            <div className="file-label">
              <span>
                <Braces size={12} /> {product.name.toLowerCase().replaceAll(' ', '-')}.tsx
              </span>
              <span>{String(index + 1).padStart(2, '0')}</span>
            </div>
            <ProductCard product={product} />
          </Reveal>
        ))}
      </div>
      <div className="collection-bottom">
        <span>DISEÑADO PARA COMPILAR BUENAS IDEAS.</span>
        <Link to="/catalogo">
          Abrir todo el repositorio <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}

function PerspectiveLab() {
  const [back, setBack] = useState(false);
  const root = useRef<HTMLElement>(null);
  const { stopped } = useExperience();
  const { scrollYProgress } = useScroll({ target: root, offset: ['start end', 'end start'] });
  const turn = useTransform(scrollYProgress, [0, 1], [-12, 12]);
  const product = products[0];
  return (
    <section className="perspective-lab" ref={root} aria-labelledby="perspective-title">
      <div className="page-width perspective-grid">
        <div className="perspective-copy">
          <span className="dev-label">03 / THE REALITY LAB</span>
          <Reveal>
            <h2 id="perspective-title">
              CAMBIA
              <br />
              EL PUNTO
              <br />
              DE <span>VISTA.</span>
            </h2>
            <p>
              El mundo tiene más de una perspectiva.
              <br />
              Tu próxima prenda también. Acércate, gira
              <br />y explora cada detalle en nuestro estudio 360°.
            </p>
            <Link className="dev-button dark" to="/experiencia">
              ABRIR ESTUDIO 360° <ArrowUpRight size={20} />
            </Link>
          </Reveal>
          <span className="lab-footnote">
            <Scan size={14} /> UN NUEVO ÁNGULO. OTRA POSIBILIDAD.
          </span>
        </div>
        <div className="perspective-object">
          <span className="perspective-big-number" aria-hidden="true">
            360
          </span>
          <div className="perspective-grid-lines" aria-hidden="true" />
          <span className="lab-coord top">
            <span className="live-dot" /> OBJECT_01 / HOODIE COMPILE
          </span>
          <motion.img
            style={{ rotate: stopped ? -6 : turn }}
            key={String(back)}
            src={product.images[back ? 1 : 0].src}
            alt={`Hoodie Compile, vista ${back ? 'posterior' : 'frontal'}`}
            loading="lazy"
          />
          <span className="perspective-cross" aria-hidden="true">
            +
          </span>
          <div className="lab-object-bar">
            <div className="lab-view-tabs">
              <button aria-pressed={!back} onClick={() => setBack(false)}>
                01 / FRENTE
              </button>
              <button aria-pressed={back} onClick={() => setBack(true)}>
                02 / ESPALDA
              </button>
            </div>
            <RotateCcw size={19} />
          </div>
        </div>
      </div>
    </section>
  );
}

function NextVersion() {
  return (
    <section className="next-version page-width">
      <Reveal className="next-copy">
        <span className="dev-label">04 / YOUR NEXT VERSION</span>
        <h2>
          TU MEJOR
          <br />
          VERSIÓN
          <span className="solid-signal">
            {' '}
            NO
            <br />
            VIENE POR DEFECTO.
          </span>
        </h2>
        <div className="next-bottom">
          <p>
            Se imagina. Se construye. Se prueba.
            <br />
            Crea un maniquí con tus medidas
            <br />y encuentra tu próxima forma de expresarte.
          </p>
          <Link className="dev-button" to="/probador">
            CREAR MI VERSIÓN <ArrowUpRight size={20} />
          </Link>
        </div>
      </Reveal>
      <Reveal className="body-blueprint">
        <div className="blueprint-top">
          <Fingerprint size={21} />
          <span>
            HUMAN.CONFIG
            <br />
            <b>UNIQUE BY DESIGN</b>
          </span>
        </div>
        <svg viewBox="0 0 280 360" aria-hidden="true">
          <defs>
            <pattern id="body-grid" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M16 0H0V16" fill="none" stroke="currentColor" strokeWidth=".4" />
            </pattern>
          </defs>
          <path
            d="M140 34c-18 0-24 13-24 29 0 15 8 28 24 28s24-13 24-28c0-16-6-29-24-29ZM116 100l-34 15-26 82 16 7 28-61 8 74-9 110 22 2 19-98 19 98 22-2-9-110 8-74 28 61 16-7-26-82-34-15c-10 12-28 12-38 0Z"
            fill="url(#body-grid)"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path
            d="M32 136h216M32 188h216M32 223h216M140 16v324"
            stroke="currentColor"
            strokeWidth=".5"
            strokeDasharray="3 5"
          />
          <g fill="currentColor">
            <circle cx="100" cy="136" r="3" />
            <circle cx="180" cy="136" r="3" />
            <circle cx="107" cy="188" r="3" />
            <circle cx="172" cy="188" r="3" />
            <circle cx="106" cy="223" r="3" />
            <circle cx="174" cy="223" r="3" />
          </g>
          <text x="35" y="130" fontSize="7" fill="currentColor">
            CHEST
          </text>
          <text x="204" y="182" fontSize="7" fill="currentColor">
            WAIST
          </text>
          <text x="35" y="217" fontSize="7" fill="currentColor">
            HIP
          </text>
        </svg>
        <div className="blueprint-bottom">
          <span>
            <i className="live-dot" /> BODY_PROFILE
          </span>
          <span>YOU / v.NEXT</span>
        </div>
      </Reveal>
    </section>
  );
}

export default function DevHome() {
  const [theme, setTheme] = useState(0);
  usePageMeta(
    'El futuro se escribe. Se viste.',
    'RIWI Devwear. Explora una colección para mentes que crean, compila tu identidad y descubre cada prenda desde una nueva perspectiva.',
  );
  return (
    <div className="digital-home" style={{ '--signal': themes[theme].color } as CSSProperties}>
      <DevHero />
      <div className="dev-marquee" aria-hidden="true">
        <div>
          {[0, 1, 2, 3].map((index) => (
            <span key={index}>
              CODE IS CULTURE <Asterisk size={33} /> WEAR YOUR MIND <ArrowDownRight size={37} />{' '}
              CREATE. COMMIT. REPEAT. <Asterisk size={33} />
            </span>
          ))}
        </div>
      </div>
      <IdentityLab theme={theme} setTheme={setTheme} />
      <SourceCollection />
      <PerspectiveLab />
      <NextVersion />
      <div className="dev-endline page-width">
        <span>END OF FILE / BEGINNING OF SOMETHING.</span>
        <Code2 size={23} />
        <span>YOUR WORLD. YOUR SOURCE CODE.</span>
      </div>
    </div>
  );
}
