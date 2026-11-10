import { Html } from '@react-three/drei';
import type { ProductComponent } from '../../types/product';
export function Hotspots({
  components,
  selectedId,
  onSelect,
}: {
  components: ProductComponent[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <>
      {components.map((component, index) => (
        <Html key={component.id} position={component.position} center zIndexRange={[20, 0]} occlude>
          <button
            className={`hotspot ${selectedId === component.id ? 'selected' : ''}`}
            aria-label={`Inspeccionar ${component.name}`}
            aria-pressed={selectedId === component.id}
            onClick={() => onSelect(component.id)}
          >
            {String(index + 1).padStart(2, '0')}
          </button>
        </Html>
      ))}
    </>
  );
}
