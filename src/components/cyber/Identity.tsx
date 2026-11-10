import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { Braces, Check, Code2, GitBranch, Play, Terminal } from 'lucide-react';
import { assetUrl } from '../../utils/assets';
import { useExperience } from '../digital/Experience';
import { Reveal } from './Reveal';

export function Identity() {
  const root = useRef<HTMLElement>(null);
  const visible = useInView(root, { once: true, amount: 0.2 });
  const { stopped } = useExperience();
  const [mode, setMode] = useState<'code' | 'manifesto'>('code');
  const [run, setRun] = useState(0);
  const [written, setWritten] = useState(0);
  const source =
    mode === 'code'
      ? [
          "import { curiosity } from '@riwi';",
          '',
          'const identity = {',
          "  mindset: 'always learning',",
          "  source: 'human creativity',",
          "  next: 'your own world'",
          '};',
          '',
          'export default curiosity.build(identity);',
        ]
      : [
          '// THE HUMAN SOURCE CODE',
          '',
          '01. Imagina lo que todavía no existe.',
          '02. Aprende. Comparte. Vuelve a intentar.',
          '03. Haz de tu curiosidad una identidad.',
          '',
          'Be a coder.',
          'Change your world.',
        ];
  const total = source.join('\n').length;
  useEffect(() => {
    if (!visible) return;
    if (stopped) {
      setWritten(total);
      return;
    }
    setWritten(0);
    const timer = window.setInterval(
      () =>
        setWritten((value) => {
          if (value + 5 >= total) {
            window.clearInterval(timer);
            return total;
          }
          return value + 5;
        }),
      32,
    );
    return () => window.clearInterval(timer);
  }, [visible, stopped, mode, run, total]);
  const progress = stopped ? 1 : Math.min(1, Math.max(0, (written / total - 0.3) / 0.7));
  let offset = 0;
  return (
    <section ref={root} className="cyber-identity cyber-container" id="riwi-identity">
      <Reveal className="cyber-section-heading">
        <div>
          <span className="cyber-eyebrow">05 / THE HUMAN SOURCE CODE</span>
          <h2>
            Tu identidad.
            <br />
            <em>En constante evolución.</em>
          </h2>
        </div>
        <p>
          No se trata solo de lo que llevas.
          <br />
          Se trata de lo que eres capaz de crear.
        </p>
      </Reveal>
      <Reveal className="cyber-identity-workspace">
        <div className="cyber-code-editor">
          <div className="cyber-editor-tabs">
            <button aria-pressed={mode === 'code'} onClick={() => setMode('code')}>
              <Code2 size={13} /> identity.ts
            </button>
            <button aria-pressed={mode === 'manifesto'} onClick={() => setMode('manifesto')}>
              <Braces size={13} /> manifesto.md
            </button>
          </div>
          <div className="cyber-code-path">
            <GitBranch size={12} /> riwi / community / your-next-self
          </div>
          <div className="cyber-source" aria-label="Código de la identidad RIWI">
            {source.map((line, index) => {
              const start = offset;
              offset += line.length + 1;
              return (
                <div className={`cyber-source-line source-${index}`} key={index}>
                  <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <code>{line.slice(0, Math.max(0, written - start)) || ' '}</code>
                </div>
              );
            })}
          </div>
          <div className="cyber-editor-bottom">
            <span>
              <GitBranch size={11} /> main / creativity
            </span>
            <span>
              UTF-8 <Check size={11} />
            </span>
          </div>
        </div>
        <div className="cyber-identity-preview">
          <div className="identity-preview-heading">
            <span>
              <i className="cyber-status-dot" /> ORIGINAL IDENTITY
            </span>
            <span>RIWI / EST. IN CURIOSITY</span>
          </div>
          <div className="cyber-logo-output">
            <span className="output-bracket bracket-left">[</span>
            <img
              src={assetUrl('/logos/riwi-coder.png')}
              alt="RIWI. Be a coder, change your world"
              style={{ clipPath: stopped ? 'none' : `inset(0 ${(1 - progress) * 100}% 0 0)` }}
            />
            <span className="output-bracket bracket-right">]</span>
          </div>
          <div className="identity-preview-bottom">
            <span>
              LA MARCA ES EL INICIO.
              <br />
              <b>LO QUE CONSTRUYES ES LA HISTORIA.</b>
            </span>
            <button onClick={() => setRun((value) => value + 1)} className="cyber-compile">
              <Play size={12} fill="currentColor" /> Compilar identidad
            </button>
          </div>
        </div>
        <div className="cyber-terminal">
          <Terminal size={13} />
          <span>~/riwi</span>
          <code>npm run your-next-version</code>
          <span className="cyber-compile-status" role="status">
            {written >= total
              ? '✓ Identidad compilada. Tu historia continúa.'
              : '↳ Escribiendo una nueva versión...'}
          </span>
        </div>
      </Reveal>
    </section>
  );
}
