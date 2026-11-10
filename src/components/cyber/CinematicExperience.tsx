import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ArrowRight, Play, SkipForward, VolumeX } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { assetUrl } from '../../utils/assets';
import { useExperience } from '../digital/Experience';

const SEEN_KEY = 'riwi.cyber.intro.v1';
type Phase = 'intro' | 'entering' | 'ready';
const CinemaContext = createContext({ phase: 'ready' as Phase, replay: () => {} });
export const useCinema = () => useContext(CinemaContext);
function skipAutomatically(path: string) {
  try {
    return (
      path !== '/' ||
      sessionStorage.getItem(SEEN_KEY) === 'seen' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      Boolean(
        (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData,
      )
    );
  } catch {
    return true;
  }
}

export function CinematicExperience({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { systemReduced } = useExperience();
  const [phase, setPhase] = useState<Phase>(() =>
    skipAutomatically(location.pathname) ? 'ready' : 'intro',
  );
  const [activated, setActivated] = useState(phase === 'intro');
  const [blocked, setBlocked] = useState(false);
  const [progress, setProgress] = useState(0);
  const [finalFrame, setFinalFrame] = useState(phase !== 'intro');
  const video = useRef<HTMLVideoElement>(null);
  const skip = useRef<HTMLButtonElement>(null);
  const previousPhase = useRef(phase);
  const finish = useCallback(() => {
    video.current?.pause();
    setFinalFrame(true);
    setPhase(systemReduced ? 'ready' : 'entering');
    try {
      sessionStorage.setItem(SEEN_KEY, 'seen');
    } catch {
      /* Session storage is optional. */
    }
  }, [systemReduced]);

  useEffect(() => {
    if (phase !== 'intro') return;
    const media = video.current;
    if (!media) return;
    setBlocked(false);
    media.muted = true;
    const play = media.play();
    play?.catch(() => setBlocked(true));
    const watchdog = window.setTimeout(() => {
      if (media.readyState < 2 || media.currentTime < 0.1) finish();
    }, 7000);
    const timeout = window.setTimeout(finish, 17000);
    return () => {
      window.clearTimeout(watchdog);
      window.clearTimeout(timeout);
    };
  }, [phase, activated, finish]);
  useEffect(() => {
    if (phase !== 'entering') return;
    const timer = window.setTimeout(() => setPhase('ready'), 1100);
    return () => window.clearTimeout(timer);
  }, [phase]);
  useEffect(() => {
    if (phase === 'intro') {
      const overflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      skip.current?.focus({ preventScroll: true });
      const escape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') finish();
      };
      window.addEventListener('keydown', escape);
      return () => {
        document.body.style.overflow = overflow;
        window.removeEventListener('keydown', escape);
      };
    }
  }, [phase, finish]);
  useEffect(() => {
    if (phase === 'ready' && previousPhase.current !== 'ready')
      document.getElementById('main-content')?.focus({ preventScroll: true });
    previousPhase.current = phase;
  }, [phase]);
  const replay = useCallback(() => {
    setActivated(true);
    setBlocked(false);
    setProgress(0);
    setFinalFrame(false);
    setPhase('intro');
    if (video.current) {
      if (video.current.error) video.current.load();
      else video.current.currentTime = 0;
    }
  }, []);

  return (
    <CinemaContext.Provider value={{ phase, replay }}>
      <div className={`cyber-experience cinema-${phase}`} data-cinema-phase={phase}>
        <div className="cinema-environment" aria-hidden="true">
          <img className="cinema-arrival" src={assetUrl('/media/riwi-cyber-arrival.webp')} alt="" />
          <video
            ref={video}
            className="cinematic-video"
            src={activated ? assetUrl('/media/riwi-cyber-intro.mp4') : undefined}
            poster={assetUrl('/media/riwi-cyber-arrival.webp')}
            autoPlay={activated && phase === 'intro'}
            muted
            playsInline
            preload={activated ? 'auto' : 'none'}
            onEnded={finish}
            onError={finish}
            onTimeUpdate={(event) => {
              const media = event.currentTarget;
              if (media.duration) setProgress(media.currentTime / media.duration);
            }}
          />
          <img
            className={`cinema-final ${finalFrame ? 'is-visible' : ''}`}
            src={assetUrl('/media/riwi-cyber-final.webp')}
            alt=""
          />
          <div className="cinema-shade" />
        </div>
        {phase === 'intro' && (
          <section className="cinema-controls" aria-label="Introducción al universo RIWI">
            <div className="cinema-top">
              <span>
                RIWI <b>CYBER</b>
                <small>TRANSMISIÓN / 001</small>
              </span>
              <button ref={skip} onClick={finish}>
                Saltar introducción <SkipForward size={15} />
              </button>
            </div>
            {blocked && (
              <div className="cinema-play">
                <span>EL FUTURO ESTÁ AL OTRO LADO.</span>
                <button
                  onClick={() => {
                    video.current
                      ?.play()
                      .then(() => setBlocked(false))
                      .catch(finish);
                  }}
                >
                  <Play size={19} /> Reproducir introducción
                </button>
                <button onClick={finish}>
                  Entrar a la tienda <ArrowRight size={15} />
                </button>
              </div>
            )}
            <div className="cinema-bottom">
              <span>
                <VolumeX size={13} /> EXPERIENCIA CINEMATOGRÁFICA / SIN SONIDO
              </span>
              <span>
                ESTABLISHING A NEW REALITY<span className="cinema-loading-dots">...</span>
              </span>
              <div className="cinema-progress">
                <span style={{ transform: `scaleX(${progress})` }} />
              </div>
            </div>
          </section>
        )}
        <div
          className="cinema-content"
          inert={phase === 'intro'}
          aria-hidden={phase === 'intro' ? true : undefined}
        >
          {children}
        </div>
      </div>
    </CinemaContext.Provider>
  );
}
