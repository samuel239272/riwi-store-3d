import { useEffect } from 'react';
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import { useExperience } from '../digital/Experience';
import { useReborn } from './RebornExperience';

/** Lightweight source-code planes: the mascot is never transformed with them. */
export function DeveloperAtmosphere() {
  const { stopped } = useExperience();
  const { transition } = useReborn();
  const { scrollY } = useScroll();
  const pointer = useMotionValue(0);
  const pointerX = useSpring(pointer, { stiffness: 100, damping: 28 });
  const counterX = useTransform(pointerX, (value) => -value * 0.65);
  const nearY = useTransform(scrollY, (value) => -Math.sin(value / 1700) * 65);
  const farY = useTransform(scrollY, (value) => Math.sin(value / 2500) * 40);
  const opacity = useTransform(transition, [0, 0.55, 1], [0, 0, 1]);
  useEffect(() => {
    if (stopped) {
      pointer.jump(0);
      pointerX.jump(0);
      return;
    }
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') pointer.set((event.clientX / innerWidth - 0.5) * 20);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [stopped, pointer, pointerX]);
  return (
    <motion.div className="developer-atmosphere" aria-hidden="true" style={{ opacity }}>
      <svg
        className="dev-circuit-map"
        viewBox="0 0 1440 1000"
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <linearGradient id="dev-route-light">
            <stop stopColor="#8b5cf6" stopOpacity="0" />
            <stop offset=".5" stopColor="#22d3ee" />
            <stop offset="1" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g className="dev-circuit-base">
          <path d="M0 190H190L270 270H480M1440 140H1230L1160 210V390H1390M0 790H210L270 730H430V920M1440 850H1180L1110 780H970M90 0V95L160 165M1350 1000V920L1270 840" />
          <circle cx="480" cy="270" r="4" />
          <circle cx="1390" cy="390" r="4" />
          <circle cx="430" cy="920" r="4" />
          <circle cx="970" cy="780" r="4" />
        </g>
        <path
          className="dev-circuit-flow"
          d="M0 190H190L270 270H480M1440 850H1180L1110 780H970"
          stroke="url(#dev-route-light)"
        />
      </svg>
      <motion.div
        className="dev-source-plane source-plane-left"
        style={{ x: stopped ? 0 : pointerX, y: stopped ? 0 : nearY }}
      >
        <span className="dev-source-file">01 / identity.ts</span>
        <code>
          <i>01</i>
          <b>export const</b> future = {'{'}
        </code>
        <code>
          <i>02</i> community: <em>'RIWI'</em>,
        </code>
        <code>
          <i>03</i> builtBy: <em>'coders'</em>,
        </code>
        <code>
          <i>04</i> mindset: <em>'create'</em>
        </code>
        <code>
          <i>05</i>
          {'}'};
        </code>
        <code>
          <i>06</i>
          <span className="dev-code-comment">// el siguiente cambio empieza aquí</span>
        </code>
        <code>
          <i>07</i>future.<strong>create</strong>();
        </code>
      </motion.div>
      <motion.div
        className="dev-source-plane source-plane-right"
        style={{ x: stopped ? 0 : counterX, y: stopped ? 0 : farY }}
      >
        <span className="dev-source-file">02 / next-generation.tsx</span>
        <code>
          <i>01</i>
          <b>function</b> <strong>NextGeneration</strong>() {'{'}
        </code>
        <code>
          <i>02</i> <b>return</b> (
        </code>
        <code>
          <i>03</i> <strong>{'<RIWI'}</strong>
        </code>
        <code>
          <i>04</i> identity=<em>"your-own"</em>
        </code>
        <code>
          <i>05</i> ready={'{'}
          <b>true</b>
          {'}'}
        </code>
        <code>
          <i>06</i> <strong>{'/>'}</strong>
        </code>
        <code>
          <i>07</i> );
        </code>
        <code>
          <i>08</i>
          {'}'}
        </code>
      </motion.div>
      <span className="dev-world-coordinate">SOURCE / COMMUNITY / CREATION</span>
    </motion.div>
  );
}
