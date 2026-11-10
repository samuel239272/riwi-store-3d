import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { animate, motion, useMotionValue, useTransform, type MotionValue } from 'framer-motion';
import { ArrowRight, Play, SkipForward, VolumeX } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { assetUrl } from '../../utils/assets';
import { useExperience } from '../digital/Experience';
import { MascotAnchor } from './MascotAnchor';
import { TechOrbit } from './TechField';
import { DeveloperAtmosphere } from './DeveloperAtmosphere';

export type IntroState =
  | 'BOOT'
  | 'INTRO_PLAYING'
  | 'INTRO_TRANSITION'
  | 'EXPERIENCE_READY'
  | 'EXPERIENCE_FALLBACK';
type Action =
  | { type: 'prepared' | 'transitionComplete' | 'replay' | 'fallback' }
  | { type: 'finish'; failed: boolean };
interface Machine {
  state: IntroState;
  failed: boolean;
}
function reducer(machine: Machine, action: Action): Machine {
  if (action.type === 'replay') return { state: 'BOOT', failed: false };
  if (action.type === 'prepared' && machine.state === 'BOOT')
    return { ...machine, state: 'INTRO_PLAYING' };
  if (action.type === 'fallback') return { state: 'EXPERIENCE_FALLBACK', failed: true };
  if (action.type === 'finish' && ['BOOT', 'INTRO_PLAYING'].includes(machine.state))
    return { state: 'INTRO_TRANSITION', failed: action.failed };
  if (action.type === 'transitionComplete' && machine.state === 'INTRO_TRANSITION')
    return { ...machine, state: machine.failed ? 'EXPERIENCE_FALLBACK' : 'EXPERIENCE_READY' };
  return machine;
}
const STORAGE = 'riwi.reborn.intro.v1';
const RebornContext = createContext<{
  state: IntroState;
  ready: boolean;
  transition: MotionValue<number>;
  replay: () => void;
} | null>(null);
export function useReborn() {
  const context = useContext(RebornContext);
  if (!context) throw new Error('RebornExperience is required.');
  return context;
}
function skipOnEntry(path: string) {
  try {
    return (
      path !== '/' ||
      sessionStorage.getItem(STORAGE) === 'seen' ||
      matchMedia('(prefers-reduced-motion: reduce)').matches ||
      Boolean(
        (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData,
      )
    );
  } catch {
    return true;
  }
}

export function RebornExperience({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { stopped } = useExperience();
  const [skipInitially] = useState(() => skipOnEntry(location.pathname));
  const [machine, dispatch] = useReducer(reducer, {
    state: skipInitially ? 'EXPERIENCE_READY' : 'BOOT',
    failed: false,
  });
  const { state } = machine;
  const stateRef = useRef(state);
  stateRef.current = state;
  const ready = state === 'EXPERIENCE_READY' || state === 'EXPERIENCE_FALLBACK';
  const transition = useMotionValue(skipInitially ? 1 : 0);
  const progress = useMotionValue(0);
  const plateOpacity = useTransform(transition, [0, 0.23, 0.46, 1], [1, 1, 0, 0]);
  const worldOpacity = useTransform(transition, [0, 0.22, 0.52, 1], [0, 0, 1, 1]);
  const shadeOpacity = useTransform(transition, [0, 0.24, 0.65, 1], [0, 0, 0.38, 0.48]);
  const worldBlur = useTransform(
    transition,
    [0, 0.24, 0.75, 1],
    ['blur(0px)', 'blur(0px)', 'blur(7px)', 'blur(7px)'],
  );
  const video = useRef<HTMLVideoElement>(null);
  const activated = useRef(false);
  const attachVideo = useCallback((element: HTMLVideoElement | null) => {
    const previous = video.current;
    video.current = element;
    // Strict Mode briefly detaches and reattaches callback refs. Release only
    // after a real removal, so the development intro keeps its media source.
    if (!element && previous)
      queueMicrotask(() => {
        if (video.current === previous) return;
        previous.pause();
        previous.removeAttribute('src');
        previous.load();
      });
  }, []);
  const skipButton = useRef<HTMLButtonElement>(null);
  const introEntered = useRef(!skipInitially);
  const [blocked, setBlocked] = useState(false);
  const finish = useCallback((failed = false) => {
    if (!['BOOT', 'INTRO_PLAYING'].includes(stateRef.current)) return;
    video.current?.pause();
    try {
      sessionStorage.setItem(STORAGE, 'seen');
    } catch {
      /* Session persistence is optional. */
    }
    dispatch({ type: 'finish', failed });
  }, []);
  useEffect(() => {
    if (state !== 'BOOT') return;
    let cancelled = false;
    transition.set(0);
    progress.set(0);
    setBlocked(false);
    const prepare = async () => {
      await Promise.all(
        [
          '/media/riwi-cyber-final.webp',
          '/media/riwi-world-clean.webp',
          '/media/riwi-mascot-alpha.avif',
        ].map(async (path) => {
          const image = new Image();
          image.src = assetUrl(path);
          await image.decode();
        }),
      );
    };
    const prepared = () => {
      if (!cancelled) {
        activated.current = true;
        dispatch({ type: 'prepared' });
      }
    };
    const timer = window.setTimeout(prepared, 3500);
    prepare()
      .then(prepared)
      .catch(() => {
        if (!cancelled) {
          transition.set(1);
          dispatch({ type: 'fallback' });
        }
      });
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [state, transition, progress]);
  useEffect(() => {
    if (state !== 'INTRO_PLAYING') return;
    const media = video.current;
    if (!media) return;
    media.muted = true;
    media.play().catch(() => setBlocked(true));
    skipButton.current?.focus({ preventScroll: true });
    const watchdog = window.setTimeout(() => {
      if (media.currentTime < 0.1 || media.readyState < 2) finish(true);
    }, 7000);
    const timeout = window.setTimeout(() => finish(true), 17000);
    return () => {
      window.clearTimeout(watchdog);
      window.clearTimeout(timeout);
    };
  }, [state, finish]);
  useEffect(() => {
    if (state !== 'INTRO_TRANSITION') return;
    if (stopped) {
      transition.set(1);
      dispatch({ type: 'transitionComplete' });
      return;
    }
    const animation = animate(transition, 1, {
      duration: 1.8,
      ease: 'linear',
      onComplete: () => dispatch({ type: 'transitionComplete' }),
    });
    return () => animation.stop();
  }, [state, stopped, transition]);
  useEffect(() => {
    if (ready || state === 'INTRO_TRANSITION') return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') finish();
    };
    window.addEventListener('keydown', escape);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', escape);
    };
  }, [state, ready, finish]);
  useEffect(() => {
    if (!ready) {
      introEntered.current = true;
      return;
    }
    if (introEntered.current) {
      document.getElementById('main-content')?.focus({ preventScroll: true });
      introEntered.current = false;
    }
  }, [ready]);
  const replay = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    activated.current = false;
    transition.set(0);
    dispatch({ type: 'replay' });
  }, [transition]);
  const playing = activated.current && (state === 'INTRO_PLAYING' || state === 'INTRO_TRANSITION');
  const phase = ready ? 'ready' : state === 'INTRO_TRANSITION' ? 'entering' : 'intro';
  return (
    <RebornContext.Provider value={{ state, ready, transition, replay }}>
      <div
        className={`system-reborn state-${state}`}
        data-cinema-state={state}
        data-cinema-phase={phase}
      >
        <div className="reborn-world" aria-hidden="true">
          <motion.img
            className="world-clean"
            style={{ opacity: worldOpacity, filter: worldBlur, scale: 1.035 }}
            src={assetUrl('/media/riwi-world-clean.webp')}
            alt=""
          />
          <motion.div className="world-color-grade" style={{ opacity: shadeOpacity }} />
          <div className="world-atmosphere" />
          <DeveloperAtmosphere />
          <motion.img
            className="world-final-plate"
            style={{ opacity: plateOpacity }}
            src={assetUrl('/media/riwi-cyber-final.webp')}
            alt=""
          />
          {playing && (
            <video
              ref={attachVideo}
              className={`reborn-intro-video ${state === 'INTRO_TRANSITION' ? 'is-holding' : ''}`}
              src={assetUrl('/media/riwi-cyber-intro.mp4')}
              poster={assetUrl('/media/riwi-cyber-arrival.webp')}
              autoPlay={state === 'INTRO_PLAYING'}
              playsInline
              muted
              preload="auto"
              onLoadedMetadata={(event) => {
                event.currentTarget.playbackRate = event.currentTarget.duration / 10;
              }}
              onTimeUpdate={(event) => {
                const media = event.currentTarget;
                if (media.duration) progress.set(media.currentTime / media.duration);
              }}
              onEnded={() => finish()}
              onError={() => finish(true)}
            />
          )}
          {state === 'BOOT' && (
            <img
              className="world-boot-plate"
              src={assetUrl('/media/riwi-cyber-arrival.webp')}
              alt=""
            />
          )}
        </div>
        <MascotAnchor />
        {!ready && state !== 'INTRO_TRANSITION' && (
          <section className="reborn-intro-controls" aria-label="Introducción a RIWI System Reborn">
            <div className="intro-top">
              <span>
                RIWI / <b>SYSTEM REBORN</b>
                <small>
                  {state === 'BOOT' ? 'PREPARING YOUR ARRIVAL' : 'TRANSMISSION 001 / 10 SECONDS'}
                </small>
              </span>
              <button ref={skipButton} onClick={() => finish()}>
                Saltar introducción <SkipForward size={16} />
              </button>
            </div>
            {blocked && (
              <div className="intro-manual">
                <span>YOUR NEXT WORLD IS READY.</span>
                <button
                  onClick={() =>
                    video.current
                      ?.play()
                      .then(() => setBlocked(false))
                      .catch(() => finish(true))
                  }
                >
                  <Play size={18} /> Reproducir introducción
                </button>
                <button onClick={() => finish(true)}>
                  Entrar a la experiencia <ArrowRight size={15} />
                </button>
              </div>
            )}
            <div className="intro-bottom">
              <span>
                <VolumeX size={13} /> EXPERIENCIA SIN SONIDO
              </span>
              <span>ESTABLISHING A NEW REALITY...</span>
              <div className="intro-progress">
                <motion.span style={{ scaleX: progress }} />
              </div>
            </div>
          </section>
        )}
        <div
          className="reborn-interface"
          inert={state === 'BOOT' || state === 'INTRO_PLAYING'}
          aria-hidden={state === 'BOOT' || state === 'INTRO_PLAYING' ? true : undefined}
        >
          {children}
        </div>
        <TechOrbit />
        <div
          id="reborn-tech-overlays"
          className="reborn-tech-overlays"
          hidden={state === 'BOOT' || state === 'INTRO_PLAYING'}
        />
      </div>
    </RebornContext.Provider>
  );
}
