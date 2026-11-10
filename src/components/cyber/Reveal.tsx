import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useExperience } from '../digital/Experience';

export function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const { stopped } = useExperience();
  return (
    <motion.div
      className={className}
      initial={stopped ? false : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{
        duration: stopped ? 0 : 0.7,
        delay: stopped ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
