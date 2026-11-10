import { useRef, type ReactNode } from 'react';
import { useExperience } from '../digital/Experience';

export function GlassPanel({
  children,
  className = '',
  variant = 'content',
  id,
}: {
  children: ReactNode;
  className?: string;
  variant?: 'content' | 'product' | 'featured' | 'hologram';
  id?: string;
}) {
  const bounds = useRef<DOMRect | null>(null);
  const { stopped } = useExperience();
  return (
    <div
      id={id}
      className={`glass-panel glass-${variant} ${className}`}
      onPointerEnter={(event) => {
        bounds.current = event.currentTarget.getBoundingClientRect();
      }}
      onPointerMove={(event) => {
        if (stopped || event.pointerType !== 'mouse' || !bounds.current) return;
        event.currentTarget.style.setProperty(
          '--glow-x',
          `${event.clientX - bounds.current.left}px`,
        );
        event.currentTarget.style.setProperty(
          '--glow-y',
          `${event.clientY - bounds.current.top}px`,
        );
        event.currentTarget.style.setProperty(
          '--pointer-dx',
          `${((event.clientX - bounds.current.left) / bounds.current.width - 0.5) * 7}px`,
        );
        event.currentTarget.style.setProperty(
          '--pointer-dy',
          `${((event.clientY - bounds.current.top) / bounds.current.height - 0.5) * 5}px`,
        );
      }}
      onPointerLeave={(event) => {
        event.currentTarget.style.setProperty('--pointer-dx', '0px');
        event.currentTarget.style.setProperty('--pointer-dy', '0px');
      }}
    >
      {children}
    </div>
  );
}
