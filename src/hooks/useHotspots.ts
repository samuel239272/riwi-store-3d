import { useState } from 'react';
import type { ProductComponent } from '../types/product';
export function useHotspots(components: ProductComponent[]) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  return {
    selected: components.find((component) => component.id === selectedId) ?? null,
    select: setSelectedId,
    close: () => setSelectedId(null),
  };
}
