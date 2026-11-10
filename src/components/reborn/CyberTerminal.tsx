import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowUpRight, CornerDownLeft, Terminal } from 'lucide-react';
import { GlassPanel } from './GlassPanel';
import { useExperience } from '../digital/Experience';
import { Reveal } from './ScrollReveal';

interface Line {
  id: number;
  type: 'command' | 'output' | 'success';
  text: string;
}
const welcome: Line[] = [
  { id: 0, type: 'success', text: 'RIWI OS / SYSTEM REBORN' },
  { id: 1, type: 'output', text: 'Human creativity loaded. Escribe help para empezar.' },
];
export function CyberTerminal() {
  const [input, setInput] = useState('');
  const [lines, setLines] = useState<Line[]>(welcome);
  const [history, setHistory] = useState<string[]>([]);
  const [position, setPosition] = useState(-1);
  const sequence = useRef(2);
  const output = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const { stopped } = useExperience();
  useEffect(() => {
    if (output.current) output.current.scrollTop = output.current.scrollHeight;
  }, [lines]);
  const run = (text: string) => {
    const command = text.trim().toLowerCase();
    if (!command) return;
    setInput('');
    setPosition(-1);
    setHistory((value) => [...value, text.trim()].slice(-40));
    if (command === 'clear') {
      setLines([]);
      return;
    }
    const next: Line[] = [{ id: sequence.current++, type: 'command', text: text.trim() }];
    const respond = (text: string, type: Line['type'] = 'output') =>
      next.push({ id: sequence.current++, type, text });
    if (command === 'help') {
      respond('COMANDOS DISPONIBLES');
      respond('help   → muestra esta guía');
      respond('shop   → abre el drop destacado');
      respond('about  → descubre el código de RIWI');
      respond('clear  → limpia la terminal');
    } else if (command === 'shop') {
      respond('Drop 001 localizado. Prepara tu próxima versión.', 'success');
      document
        .getElementById('code-collection')
        ?.scrollIntoView({ behavior: stopped ? 'instant' : 'smooth' });
    } else if (command === 'about') {
      respond('Somos curiosidad, aprendizaje y creatividad compartida.');
      respond('El futuro lo construyen quienes se atreven a programarlo.');
      respond('Be a coder. Change your world.', 'success');
    } else respond(`Comando desconocido: ${text.trim()}. Escribe help.`);
    setLines((value) => [...value, ...next].slice(-100));
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    run(input);
  };
  return (
    <section
      className="reborn-section terminal-section"
      id="built-by-coders"
      data-source="riwi.shell"
    >
      <div className="reborn-container">
        <Reveal className="reborn-section-heading">
          <span className="system-eyebrow">03 / BUILT BY CODERS</span>
          <h2>
            WE DON'T JUST
            <br />
            WRITE CODE.
            <br />
            <em>WE CREATE THE FUTURE.</em>
          </h2>
          <p>
            Cada gran idea empieza con una línea.
            <br />
            Esta es la tuya.
          </p>
        </Reveal>
        <Reveal kind="terminal">
          <GlassPanel variant="hologram" className="reborn-terminal">
            <div className="terminal-chrome">
              <span className="terminal-dots">
                <i />
                <i />
                <i />
              </span>
              <span>
                <Terminal size={13} /> riwi@future:~
              </span>
              <span className="terminal-connected">
                <i /> LOCAL SESSION
              </span>
            </div>
            <div
              className="terminal-output"
              ref={output}
              role="log"
              aria-live="polite"
              aria-label="Salida de la terminal"
            >
              {lines.map((line) => (
                <div key={line.id} className={`terminal-line terminal-${line.type}`}>
                  <span aria-hidden="true">
                    {line.type === 'command' ? '❯' : line.type === 'success' ? '✓' : '·'}
                  </span>
                  <span>{line.text}</span>
                </div>
              ))}
            </div>
            <form className="terminal-command-form" onSubmit={submit}>
              <label htmlFor="terminal-input">
                <span aria-hidden="true">❯</span>
                <input
                  ref={field}
                  id="terminal-input"
                  aria-label="Comando de la terminal"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowUp') {
                      event.preventDefault();
                      const index = position < 0 ? history.length - 1 : Math.max(0, position - 1);
                      setPosition(index);
                      setInput(history[index] || '');
                    }
                    if (event.key === 'ArrowDown') {
                      event.preventDefault();
                      const index = position >= history.length - 1 ? -1 : position + 1;
                      setPosition(index);
                      setInput(index < 0 ? '' : history[index] || '');
                    }
                  }}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="Escribe help y pulsa Enter"
                />
              </label>
              <button type="submit" aria-label="Ejecutar comando">
                <CornerDownLeft size={18} />
              </button>
            </form>
            <div className="terminal-quick-commands">
              {['help', 'shop', 'about', 'clear'].map((command) => (
                <button
                  onClick={() => {
                    run(command);
                    field.current?.focus({ preventScroll: true });
                  }}
                  key={command}
                >
                  {command}
                  <ArrowUpRight size={11} />
                </button>
              ))}
            </div>
          </GlassPanel>
        </Reveal>
      </div>
    </section>
  );
}
