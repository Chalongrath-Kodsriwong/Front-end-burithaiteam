import type { PreorderInfo } from "./Mostseller";

export interface Product {
  id: number;
  name: string;
  price: string;
  brand: string;
  avatar: string;
  category?: string;
  quality?: string;
  numericPrices?: number[];
  finalPrices?: number[];
  preorder?: PreorderInfo | null;
}