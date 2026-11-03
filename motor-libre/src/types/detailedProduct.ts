export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  images: string[];
  stock: number;
  brand?: string;
  model?: string;
}