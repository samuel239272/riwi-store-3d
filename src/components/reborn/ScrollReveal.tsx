import { useRef, type ReactNode } from 'react';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type TargetAndTransition,
} from 'framer-motion';
import { useExperience } from '../digital/Experience';

export function Reveal({
  children,
  className = '',
  delay = 0,
  kind,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  kind?: 'heading' | 'surface' | 'terminal' | 'finale';
}) {
  const { stopped } = useExperience();
  const variant = kind || (className.includes('section-heading') ? 'heading' : 'surface');
  const initial: TargetAndTransition =
    variant === 'heading'
      ? { opacity: 0, y: 18, '--heading-mask': '100%' }
      : variant === 'terminal'
        ? { opacity: 0, x: -24, clipPath: 'inset(0 18% 0 0)' }
        : variant === 'finale'
          ? { opacity: 0, y: 36, scale: 0.98, clipPath: 'inset(0 0 12% 0)' }
          : { opacity: 0, y: 36, scale: 0.985, clipPath: 'inset(3% 0 0 0)' };
  return (
    <motion.div
      className={`scroll-reveal reveal-${variant} ${className}`}
      data-reveal={variant}
      initial={stopped ? false : initial}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        clipPath: 'inset(0% 0% 0% 0%)',
        '--heading-mask': '0%',
      }}
      viewport={{ once: true, amount: variant === 'heading' ? 0.22 : 0.12 }}
      transition={{
        duration: stopped ? 0 : variant === 'heading' ? 0.85 : 0.65,
        delay: stopped ? 0 : delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

export function ParallaxImage(props: {
  src: string;
  alt: string;
  width: number | string;
  height: number | string;
  loading?: 'lazy' | 'eager';
}) {
  const ref = useRef<HTMLImageElement>(null);
  const { stopped } = useExperience();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const offset = useTransform(scrollYProgress, [0, 1], [24, -24]);
  const y = useSpring(offset, { stiffness: 150, damping: 32 });
  return (
    <motion.img
      ref={ref}
      {...props}
      className="parallax-media"
      style={{ y: stopped ? 0 : y }}
      draggable={false}
    />
  );
}
