import { PreorderInfo } from "./Mostseller";

export interface Product {
  id: number;
  name: string;
  price: string;
  brand: string;
  avatar: string;
  preorder?: PreorderInfo | null;
  rawPrices?: number[];
  finalPrices?: number[];
}