export interface Product {
  id: number;
  name: string;
  price: string;
  brand: string;
  avatar: string;
  category?: string;
  quality?: string; // ⭐ เพิ่มตรงนี้
  numericPrices?: number[];
}