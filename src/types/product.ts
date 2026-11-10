export type Vector3Tuple = [number, number, number];
export type CategoryId = 'camisetas' | 'camisas' | 'jeans' | 'buzos' | 'hoodies' | 'sudaderas' | 'accesorios' | 'chaquetas' | 'clanes';
export interface ProductComponent { id: string; name: string; description: string; position: Vector3Tuple; image?: string; technicalInfo?: string }
export interface Product {
  id: string; name: string; reference: string; category: CategoryId; description: string; shortDescription: string;
  price: number; promoPrice?: number; colors: { name: string; hex: string }[]; sizes: string[]; stock: number; material: string;
  images: { src: string; alt: string }[]; model3D?: { exterior: string; hasInterior?: boolean; scale?: number };
  components: ProductComponent[]; illustrative: boolean; featured?: boolean; collection: string; published: boolean; createdAt: string;
}
