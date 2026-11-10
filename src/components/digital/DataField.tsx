import { useEffect, useRef } from 'react';
import { useExperience } from './Experience';

/** A bounded, procedural particle sculpture. No WebGL or external assets required. */
export function DataField() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const { stopped } = useExperience();
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const context = element.getContext('2d');
    if (!context) return;
    let frame = 0;
    let time = 0;
    let previous = 0;
    let visible = false;
    let width = 600;
    let height = 600;
    const pointer = { x: 0, y: 0 };
    const points = Array.from({ length: 760 }, (_, i) => {
      const u = ((i % 76) / 76) * Math.PI * 2;
      const v = (Math.floor(i / 76) / 10) * Math.PI * 2;
      const radius = 1.35 + 0.34 * Math.cos(v);
      return [
        radius * Math.cos(u),
        radius * Math.sin(u),
        0.34 * Math.sin(v) + 0.22 * Math.sin(u * 3),
      ] as const;
    });
    const draw = (stamp: number) => {
      const delta = Math.min((stamp - previous) / 1000 || 0, 0.05);
      previous = stamp;
      if (!stopped) time += delta * 0.12;
      context.clearRect(0, 0, width, height);
      const angle = time + 0.28 + pointer.x;
      const tilt = 0.78 + pointer.y;
      const scale = Math.min(width, height) * 0.26;
      const projected = points.map(([x, y, z]) => {
        const rx = x * Math.cos(angle) - z * Math.sin(angle);
        const rz = x * Math.sin(angle) + z * Math.cos(angle);
        const ry = y * Math.cos(tilt) - rz * Math.sin(tilt);
        const depth = y * Math.sin(tilt) + rz * Math.cos(tilt);
        return { x: width / 2 + rx * scale, y: height / 2 + ry * scale, z: depth };
      });
      const color = getComputedStyle(element).getPropertyValue('--signal').trim() || '#d3fa6a';
      projected.forEach((point, i) => {
        context.globalAlpha = 0.22 + (point.z + 1.8) / 5;
        context.fillStyle = color;
        context.beginPath();
        context.arc(point.x, point.y, point.z > 0.3 ? 1.4 : 0.8, 0, Math.PI * 2);
        context.fill();
        if (i % 3 === 0 && i + 1 < projected.length) {
          const next = projected[i + 1];
          context.globalAlpha *= 0.3;
          context.strokeStyle = color;
          context.lineWidth = 0.5;
          context.beginPath();
          context.moveTo(point.x, point.y);
          context.lineTo(next.x, next.y);
          context.stroke();
        }
      });
      context.globalAlpha = 1;
      if (!stopped && visible && !document.hidden) frame = requestAnimationFrame(draw);
    };
    const start = () => {
      cancelAnimationFrame(frame);
      previous = 0;
      frame = requestAnimationFrame(draw);
    };
    const resize = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width;
      height = entry.contentRect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      element.width = width * dpr;
      element.height = height * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      start();
    });
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else cancelAnimationFrame(frame);
    });
    const visibility = () => {
      if (document.hidden) cancelAnimationFrame(frame);
      else if (visible) start();
    };
    const move = (event: PointerEvent) => {
      if (stopped || event.pointerType !== 'mouse') return;
      const rect = element.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left - width / 2) / width) * 0.22;
      pointer.y = ((event.clientY - rect.top - height / 2) / height) * 0.15;
    };
    resize.observe(element);
    observer.observe(element);
    element.parentElement?.addEventListener('pointermove', move);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      observer.disconnect();
      element.parentElement?.removeEventListener('pointermove', move);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [stopped]);
  return <canvas ref={canvas} className="data-field" aria-hidden="true" />;
}
