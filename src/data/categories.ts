import type { CategoryId } from '../types/product';
export const categories: { id: CategoryId; name: string; description: string; number: string }[] = [
  { id: 'camisetas', name: 'Camisetas', description: 'Tu lenguaje, en una camiseta.', number: '01' },
  { id: 'hoodies', name: 'Hoodies', description: 'Comodidad para crear sin límites.', number: '02' },
  { id: 'camisas', name: 'Camisas', description: 'Una nueva forma de hacer equipo.', number: '03' },
  { id: 'jeans', name: 'Blue Jeans', description: 'Tu próxima rama empieza aquí.', number: '04' },
  { id: 'buzos', name: 'Buzos', description: 'Un básico que siempre vuelve.', number: '05' },
  { id: 'sudaderas', name: 'Sudaderas', description: 'Encuentra tu estado de flow.', number: '06' },
  { id: 'chaquetas', name: 'Chaquetas', description: 'Estructura técnica para cualquier entorno.', number: '07' },
  { id: 'accesorios', name: 'Accesorios', description: 'Pequeños detalles. Mucha identidad.', number: '08' },
];
export const categoryName = (id: CategoryId) => categories.find(category => category.id === id)?.name ?? id;
