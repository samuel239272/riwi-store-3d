import { products, getProduct } from '../data/products';
import type { Product, CategoryId } from '../types/product';
export type ProductSort = 'featured' | 'price-asc' | 'price-desc' | 'name-asc' | 'newest';
export interface CatalogQuery { query?: string; category?: string; size?: string; color?: string; collection?: string; sort?: ProductSort }
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim();
export function listProducts({ query = '', category = 'all', size = '', color = '', collection = '', sort = 'featured' }: CatalogQuery = {}) {
  const result = products.filter(product => product.published && (category === 'all' || product.category === category) && (!size || product.sizes.includes(size)) && (!color || product.colors.some(option => option.name === color)) && (!collection || product.collection === collection) && normalize(`${product.name} ${product.reference} ${product.shortDescription} ${product.collection}`).includes(normalize(query)));
  if (sort === 'price-asc') result.sort((a, b) => (a.promoPrice ?? a.price) - (b.promoPrice ?? b.price));
  if (sort === 'price-desc') result.sort((a, b) => (b.promoPrice ?? b.price) - (a.promoPrice ?? a.price));
  if (sort === 'name-asc') result.sort((a, b) => a.name.localeCompare(b.name, 'es'));
  if (sort === 'newest') result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (sort === 'featured') result.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  return result;
}
/** Replace this adapter with authenticated API calls without changing presentation components. */
export const catalogService = { list: listProducts, get: getProduct };
export interface CatalogAdminService {
  create(product: Omit<Product, 'id'>): Promise<Product>;
  update(id: string, changes: Partial<Omit<Product, 'id'>>): Promise<Product>;
  remove(id: string): Promise<void>;
  setPublished(id: string, published: boolean): Promise<Product>;
  updateInventory(id: string, stock: number): Promise<void>;
  uploadAsset(file: File, kind: 'image' | 'model' | 'print' | 'logo'): Promise<string>;
  updateCategories(categories: { id: CategoryId; name: string }[]): Promise<void>;
}
