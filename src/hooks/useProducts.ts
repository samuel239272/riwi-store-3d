import { useMemo } from 'react';
import { catalogService, type CatalogQuery } from '../services/catalog';
export type { ProductSort } from '../services/catalog';
export function useProducts(filters: CatalogQuery) {
  const { query, category, size, color, collection, sort } = filters;
  return useMemo(() => catalogService.list({ query, category, size, color, collection, sort }), [query, category, size, color, collection, sort]);
}
