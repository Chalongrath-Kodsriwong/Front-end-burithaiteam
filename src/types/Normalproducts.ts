import { PreorderInfo } from "./Mostseller";

export interface Product {
  id: number;
  name: string;
  price: string;
  brand: string;
  avatar: string;
  preorder?: PreorderInfo | null;
  bestDiscount?: { originalPrice: number; finalPrice: number; discountPercent: number; source: string } | null;
  rawPrices?: number[];
  finalPrices?: number[];
}