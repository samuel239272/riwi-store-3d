import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Bug,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  Gift,
  Lightbulb,
  LockKeyhole,
  Play,
  RotateCcw,
  Terminal,
  Trophy,
  Workflow,
} from 'lucide-react';
import { gameLevels, games, levelId, percentages, rewards, type GameId } from '../data/codingGames';
import { useRewards } from '../components/rewards/RewardsProvider';
import { usePageMeta } from '../hooks/usePageMeta';

const startingOrders = [
  [1, 2, 0],
  [2, 0, 1],
  [2, 0, 3, 1],
  [3, 1, 0, 2],
  [2, 3, 1, 0],
  [3, 0, 4, 2, 1],
];

function Challenge({ game, index, next }: { game: GameId; index: number; next: () => void }) {
  const level = gameLevels[game][index];
  const { solve, apply, completed } = useRewards();
  const reward = rewards.find((r) => r.id === levelId(game, index))!;
  const isAlreadyWon = completed.includes(reward.id);
  const [answer, setAnswer] = useState(() => (isAlreadyWon && game === 'debug' ? level.answers![0] : ''));
  const initialOrder = isAlreadyWon && game === 'pipeline' ? level.lines!.map((_, i) => i) : startingOrders[index];
  const [order, setOrder] = useState(initialOrder);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'wrong' | 'won'>('idle');
  const [hint, setHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [copyStatus, setCopyStatus] = useState('');
  const navigate = useNavigate();
  const input = useRef<HTMLInputElement>(null);

  const submit = () => {
    const correct = solve(game, index, game === 'debug' ? answer : order);
    setStatus(correct ? 'won' : 'wrong');
    setAttempts((n) => n + 1);
    if (!correct && attempts >= 1) setHint(true);
  };

  const move = (position: number, direction: number) => {
    const target = position + direction;
    if (target < 0 || target >= order.length) return;
    setOrder((items) => {
      const changed = [...items];
      [changed[position], changed[target]] = [changed[target], changed[position]];
      return changed;
    });
    setSelectedLine(null);
    setStatus('idle');
  };

  const handleLineClick = (position: number) => {
    if (status === 'won') return;
    if (selectedLine === null) {
      setSelectedLine(position);
    } else if (selectedLine === position) {
      setSelectedLine(null);
    } else {
      setOrder((items) => {
        const changed = [...items];
        [changed[selectedLine], changed[position]] = [changed[position], changed[selectedLine]];
        return changed;
      });
      setSelectedLine(null);
      setStatus('idle');
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(reward.code);
      setCopyStatus('Código copiado.');
    } catch {
      input.current?.select();
      setCopyStatus('Código seleccionado. Usa la opción Copiar de tu dispositivo.');
    }
  };
  return (
    <article className="challenge-panel" aria-label={`Reto ${index + 1}: ${level.title}`}>
      <header className="challenge-heading">
        <div>
          <span className="arena-kicker">
            MISIÓN {String(index + 1).padStart(2, '0')} / {level.concept}
          </span>
          <h2>{level.title}</h2>
        </div>
        <span className="reward-chip">
          <Gift size={16} /> {percentages[index]} % OFF
        </span>
      </header>
      <p className="challenge-task">{level.task}</p>
      <div className="code-workbench">
        <div className="editor-tab">
          <span className="window-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <Code2 size={14} /> {games[game].file}
          <span>JAVASCRIPT</span>
        </div>
        {game === 'debug' ? (
          <div
            className="challenge-source"
            aria-label="Código del reto"
            onClick={() => input.current?.focus()}
            style={{ cursor: 'text' }}
          >
            {level
              .code!.replace('___', () => answer || '___')
              .split('\n')
              .map((line, i) => (
                <div className="source-line" key={i}>
                  <span aria-hidden="true">{i + 1}</span>
                  <code>{line}</code>
                </div>
              ))}
          </div>
        ) : (
          <ol className="pipeline-lines" aria-label="Líneas del programa">
            {order.map((id, position) => (
              <li
                key={id}
                data-line-id={id}
                className={selectedLine === position ? 'is-selected' : ''}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('.line-moves')) return;
                  handleLineClick(position);
                }}
                style={{ cursor: status === 'won' ? 'default' : 'pointer' }}
                title="Haz clic para seleccionar y cambiar de posición, o usa las flechas"
              >
                <span className="line-position" aria-hidden="true">
                  {String(position + 1).padStart(2, '0')}
                </span>
                <code>{level.lines![id]}</code>
                <div className="line-moves">
                  <button
                    type="button"
                    aria-label={`Subir línea ${position + 1}`}
                    disabled={position === 0 || status === 'won'}
                    onClick={(e) => {
                      e.stopPropagation();
                      move(position, -1);
                    }}
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Bajar línea ${position + 1}`}
                    disabled={position === order.length - 1 || status === 'won'}
                    onClick={(e) => {
                      e.stopPropagation();
                      move(position, 1);
                    }}
                  >
                    <ArrowDown size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
        <div className="editor-status">
          <span>
            <i />{' '}
            {game === 'debug' ? 'Completa el espacio ___' : 'Usa las flechas o haz clic en las líneas para moverlas'}
          </span>
          <span>UTF-8 · JS</span>
        </div>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        {game === 'debug' && (
          <label className="answer-field">
            Tu código
            <input
              ref={input}
              aria-label="Completa el código"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              maxLength={250}
              value={answer}
              disabled={status === 'won'}
              onChange={(event) => {
                setAnswer(event.target.value);
                setStatus('idle');
              }}
              placeholder="Escribe la pieza que falta…"
            />
          </label>
        )}
        <div className="challenge-actions">
          <button
            type="submit"
            className="dev-primary"
            disabled={status === 'won' || (game === 'debug' && !answer.trim())}
          >
            <Play size={16} /> {game === 'debug' ? 'Validar solución' : 'Comprobar programa'}
          </button>
          <button
            type="button"
            className="dev-quiet"
            onClick={() => setHint(!hint)}
            aria-expanded={hint}
          >
            <Lightbulb size={16} /> {hint ? 'Ocultar pista' : 'Necesito una pista'}
          </button>
          <button
            type="button"
            className="dev-icon-button"
            aria-label="Reiniciar reto"
            onClick={() => {
              setAnswer('');
              setOrder(startingOrders[index]);
              setRetrying(true);
              setStatus('idle');
              setAttempts(0);
              setHint(false);
              setCopyStatus('');
              setSelectedLine(null);
            }}
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </form>
      {hint && (
        <div className="challenge-hint-container">
          <p className="challenge-hint">
            <Lightbulb size={17} />
            {level.hint}
          </p>
          <button
            type="button"
            className="dev-insert-hint-btn"
            onClick={() => {
              if (game === 'debug') {
                setAnswer(level.answers![0]);
              } else {
                setOrder(level.lines!.map((_, i) => i));
              }
              setStatus('idle');
            }}
          >
            <Check size={14} /> Aplicar solución sugerida
          </button>
        </div>
      )}
      <div className={`challenge-feedback ${status}`} role="status" aria-live="polite">
        {status === 'idle' && (
          <>
            <Terminal size={16} />{' '}
            {completed.includes(reward.id)
              ? 'Nivel completado. Puedes practicarlo otra vez; tu código se conserva.'
              : 'Sin reloj. Sin presión. Cada intento es una forma de aprender.'}
          </>
        )}
        {status === 'wrong' && (
          <>
            <span>Inténtalo otra vez.</span>{' '}
            {game === 'debug'
              ? 'Revisa los nombres, los símbolos y el texto solicitado. Completa solo el espacio señalado.'
              : 'Todavía hay una dependencia fuera de orden. Revisa qué variable necesita cada línea.'}{' '}
            Tus recompensas anteriores están a salvo.
          </>
        )}
        {status === 'won' && (
          <>
            <CheckCircle2 size={19} />
            <span>¡Nivel superado!</span> {level.explanation}
          </>
        )}
      </div>
      {(status === 'won' || isAlreadyWon) && (
        <div className="reward-unlocked">
          <div className="reward-unlocked-icon">
            <Trophy size={29} />
          </div>
          <div>
            <span className="arena-kicker">TU CÓDIGO DE DESCUENTO</span>
            <h3>{reward.percent} % para tu próxima selección</h3>
            <div className="reward-code-row">
              <input ref={input} aria-label="Código ganado" readOnly value={reward.code} />
              <button onClick={copy} aria-label="Copiar código ganado">
                <Copy size={16} />
              </button>
            </div>
            <p role="status">
              {copyStatus || 'Un código por nivel. Los descuentos no se acumulan.'}
            </p>
          </div>
          <div className="reward-next">
            <button className="dev-primary" onClick={next}>
              {index === 5 ? 'Explorar otro reto' : 'Siguiente nivel'}
              <ArrowRight size={16} />
            </button>
            <button
              className="dev-quiet"
              onClick={() => {
                if (apply(reward.code)) navigate('/carrito');
              }}
            >
              Usar en el carrito <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

export default function CodingArena() {
  usePageMeta(
    'Code Arcade · Aprende y gana',
    'Completa retos de programación, desbloquea niveles y gana códigos de descuento para tu selección RIWI.',
  );
  const { completed, earned, active, apply, durable } = useRewards();
  const [params, setParams] = useSearchParams();
  const game: GameId = params.get('juego') === 'pipeline' ? 'pipeline' : 'debug';
  const progress = (id: GameId) => completed.filter((key) => key.startsWith(id + ':')).length;
  const [selection, setSelection] = useState<Record<GameId, number>>(() => ({
    debug: Math.min(progress('debug'), 5),
    pipeline: Math.min(progress('pipeline'), 5),
  }));
  const index = Math.min(selection[game], progress(game));
  const [notice, setNotice] = useState('');
  const board = useRef<HTMLDivElement>(null);
  const wallet = useRef<HTMLElement>(null);
  const { hash } = useLocation();
  const xp = earned.reduce((sum, reward) => sum + reward.level * 50, 0);
  const changeGame = (id: GameId) => setParams({ juego: id });
  useEffect(() => {
    setNotice('');
  }, [game]);
  useEffect(() => {
    if (hash === '#recompensas') {
      const frame = requestAnimationFrame(() =>
        wallet.current?.scrollIntoView({ block: 'start', behavior: 'instant' }),
      );
      return () => cancelAnimationFrame(frame);
    }
  }, [hash]);
  return (
    <div className="arena-page page-width">
      <header className="arena-hero">
        <div>
          <span className="arena-kicker">
            <i /> RIWI / CODE ARCADE
          </span>
          <h1>
            ¡Obtén códigos de descuento <em>codificando!</em>
          </h1>
          <p>
            Un bug menos. Un logro más. Empieza desde cero, sube de nivel y convierte lo que
            aprendes en tu siguiente recompensa.
          </p>
          <div className="arena-tags">
            <span>01 / APRENDE</span>
            <span>02 / RESUELVE</span>
            <span>03 / DESBLOQUEA</span>
          </div>
        </div>
        <div className="arena-pass">
          <span className="arena-kicker">TU PASE DE DESARROLLADOR</span>
          <div className="pass-rank">
            <Terminal size={32} />
            <strong>
              {xp < 300 ? 'Hello, world.' : xp < 1000 ? 'Problem solver.' : 'Ready to deploy.'}
            </strong>
          </div>
          <div className="pass-stats">
            <span>
              <b>{xp}</b> XP
            </span>
            <span>
              <b>{completed.length}/12</b> NIVELES
            </span>
            <span>
              <b>{earned.length}</b> CÓDIGOS
            </span>
          </div>
          <progress max={12} value={completed.length} aria-label="Progreso total" />
          <p>
            {durable
              ? 'Tu progreso se guarda en este navegador.'
              : 'El almacenamiento está bloqueado: el progreso durará esta sesión.'}
          </p>
        </div>
      </header>
      <div className="game-select" role="group" aria-label="Elige un minijuego">
        {(['debug', 'pipeline'] as GameId[]).map((id) => (
          <button key={id} aria-pressed={game === id} onClick={() => changeGame(id)}>
            <span className={`game-symbol ${id}`} aria-hidden="true">
              {id === 'debug' ? <Bug size={25} /> : <Workflow size={25} />}
            </span>
            <span>
              <small>{games[id].tag}</small>
              <strong>{games[id].name}</strong>
              <span>{games[id].description}</span>
            </span>
            <span className="game-completion">
              {progress(id)}/6 <ArrowRight size={19} />
            </span>
          </button>
        ))}
      </div>
      <div className="arena-board" ref={board} tabIndex={-1}>
        <aside className="level-map">
          <div className="level-map-heading">
            <span className="arena-kicker">RUTA DE APRENDIZAJE</span>
            <h2>{games[game].name}</h2>
          </div>
          <ol>
            {gameLevels[game].map((level, i) => {
              const won = completed.includes(levelId(game, i)),
                locked = i > progress(game);
              return (
                <li key={i}>
                  <button
                    disabled={locked}
                    aria-current={i === index ? 'step' : undefined}
                    aria-label={`Nivel ${i + 1}: ${level.title}${locked ? ', bloqueado' : ''}`}
                    onClick={() => setSelection((current) => ({ ...current, [game]: i }))}
                  >
                    <span className="level-number">
                      {won ? (
                        <Check size={17} />
                      ) : locked ? (
                        <LockKeyhole size={14} />
                      ) : (
                        String(i + 1).padStart(2, '0')
                      )}
                    </span>
                    <span>
                      <strong>{level.title}</strong>
                      <small>{percentages[i]} % de descuento</small>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          <div className="level-map-note">
            <Gift size={22} />
            <p>
              Cada nivel abre el siguiente y te regala un código. Llega hasta el{' '}
              <strong>15 %</strong>.
            </p>
          </div>
        </aside>
        <Challenge
          key={`${game}:${index}`}
          game={game}
          index={index}
          next={() => {
            if (index < 5) setSelection((current) => ({ ...current, [game]: index + 1 }));
            else changeGame(game === 'debug' ? 'pipeline' : 'debug');
            requestAnimationFrame(() => {
              board.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
              board.current?.focus({ preventScroll: true });
            });
          }}
        />
      </div>
      <section
        className="reward-wallet"
        id="recompensas"
        ref={wallet}
        aria-labelledby="wallet-title"
      >
        <div className="wallet-heading">
          <div>
            <span className="arena-kicker">LOGROS QUE SE LLEVAN PUESTOS</span>
            <h2 id="wallet-title">Tus códigos, listos para usar.</h2>
          </div>
          <Link to="/carrito">
            Ir al carrito <ArrowRight size={17} />
          </Link>
        </div>
        <p>
          Se aplica un código a la vez sobre el precio actual de los productos. En esta tienda
          demostrativa, el descuento se refleja en tu selección; no se procesan compras.
        </p>
        {earned.length ? (
          <div className="wallet-grid">
            {earned.map((reward) => (
              <article className="wallet-ticket" key={reward.id}>
                <span>
                  {reward.percent}
                  <small>%</small>
                </span>
                <div>
                  <strong>{reward.code}</strong>
                  <small>
                    {games[reward.game].name} · Nivel {reward.level}
                  </small>
                  <button
                    onClick={() => {
                      if (apply(reward.code)) setNotice(`${reward.code} aplicado al carrito.`);
                    }}
                    disabled={active?.code === reward.code}
                  >
                    {active?.code === reward.code ? 'Aplicado al carrito' : 'Aplicar código'}{' '}
                    <ArrowRight size={13} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="wallet-empty">
            <Gift size={26} />
            <span>
              Aquí empieza tu colección de logros.
              <small>Completa tu primer nivel para desbloquear un código del 3 %.</small>
            </span>
          </div>
        )}
        <p role="status">{notice}</p>
      </section>
    </div>
  );
}
