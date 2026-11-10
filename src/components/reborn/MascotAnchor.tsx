import { useEffect, useRef } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useReborn } from './RebornExperience';
import { useExperience } from '../digital/Experience';
import { useVisibility } from '../../hooks/useVisibility';
import { assetUrl } from '../../utils/assets';

const BASE_WIDTH = 400;
const BASE_HEIGHT = (BASE_WIDTH * 930) / 547;
const clamp = (value: number) => Math.max(0, Math.min(1, value));
export function MascotAnchor() {
  const viewport = useMotionValue({ width: innerWidth, height: innerHeight });
  const journey = useMotionValue(0);
  const scrollRange = useRef(1);
  const returning = useRef<ReturnType<typeof animate> | null>(null);
  const { transition, state } = useReborn();
  const { stopped, systemReduced } = useExperience();
  const location = useLocation();
  const monumental = location.pathname === '/' && !systemReduced;
  const root = useRef<HTMLDivElement>(null);
  const visible = useVisibility(root);
  useEffect(() => {
    const measure = () => {
      scrollRange.current = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    };
    const resize = () => {
      viewport.set({ width: innerWidth, height: innerHeight });
      measure();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener('resize', resize);
    measure();
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, [viewport]);
  useEffect(() => {
    returning.current?.stop();
    if (!monumental || stopped) return;
    const depth = () => clamp(window.scrollY / scrollRange.current);
    // Catch up gently after a paused scroll; pausing itself never repositions the image.
    returning.current = animate(journey, depth(), {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    });
    const follow = () => {
      returning.current?.stop();
      journey.set(depth());
    };
    window.addEventListener('scroll', follow, { passive: true });
    return () => {
      returning.current?.stop();
      window.removeEventListener('scroll', follow);
    };
  }, [journey, monumental, stopped]);
  const coordinates = () => {
    const { width: w, height: h } = viewport.get();
    const reveal = transition.get();
    const depth = journey.get();
    const frameScale = Math.max(w / 1920, h / 1080);
    const source = {
      x: (w - 1920 * frameScale) / 2 + 720 * frameScale,
      y: (h - 1080 * frameScale) / 2 + 130 * frameScale,
      scale: (950 * frameScale) / BASE_HEIGHT,
    };
    const height = monumental ? h * (w < 760 ? 1.95 : 2.35) : Math.min(h * 0.84, w * 1.6, 880);
    const centeredScale = height / BASE_HEIGHT;
    const top = h * (w < 760 ? 0.13 : 0.12);
    const bottom = h * 0.88 - height;
    const target = {
      x: (w - BASE_WIDTH * centeredScale) / 2,
      y: monumental ? top + (bottom - top) * depth : (h - height) / 2 + 18,
      scale: centeredScale,
    };
    const blendTime = Math.min(1, Math.max(0, (reveal - 0.35) / 0.65));
    const blend = blendTime * blendTime * (3 - 2 * blendTime);
    return {
      x: source.x + (target.x - source.x) * blend,
      y: source.y + (target.y - source.y) * blend,
      scale: source.scale + (target.scale - source.scale) * blend,
    };
  };
  const x = useTransform(() => coordinates().x);
  const y = useTransform(() => coordinates().y);
  const scale = useTransform(() => coordinates().scale);
  const opacity = useTransform(transition, [0, 0.23, 0.42, 1], [0, 0, 1, 1]);
  return (
    <div className={`mascot-plane ${monumental ? 'mascot-journey' : 'mascot-complete'}`}>
      <motion.div
        ref={root}
        className={`mascot-anchor ${!visible || stopped ? 'is-still' : ''}`}
        role="img"
        aria-label="Mascota RIWI: astronauta con casco bajo el brazo, saludando"
        aria-hidden={state === 'BOOT' || state === 'INTRO_PLAYING'}
        style={{
          x,
          y,
          scale,
          opacity,
          width: BASE_WIDTH,
          height: BASE_HEIGHT,
          transformOrigin: '0 0',
        }}
        data-mascot-state={state}
        data-mascot-mode={monumental ? 'scroll-reveal' : 'complete'}
      >
        <div className="mascot-ambient-glow" />
        <div className="mascot-ground-light" />
        <div className="mascot-sprite">
          <img
            src={assetUrl('/media/riwi-mascot-alpha.avif')}
            alt=""
            aria-hidden="true"
            width="1672"
            height="941"
            style={{
              width: `${(1672 / 547) * 100}%`,
              height: `${(941 / 930) * 100}%`,
              left: `${(-585 / 547) * 100}%`,
              top: `${(-7 / 930) * 100}%`,
            }}
          />
        </div>
        <span className="mascot-dock-caption">RIWI / CREATIVE SPIRIT</span>
      </motion.div>
    </div>
  );
}
