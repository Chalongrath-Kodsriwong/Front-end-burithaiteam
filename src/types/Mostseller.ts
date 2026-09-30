export type PreorderInfo = {
  originalPrice: number;
  preorderPrice: number;
  discountPercent: number;
  releaseDate?: string | null;
  mode: string;
};

export type ApiProduct = {
  id_products: number;
  name: string;
  brand?: string | null;
  images?: { url: string }[];
  prices?: number[];
  discount?: null | {
    name: string;
    discountType: string;
    discountValue: number;
    finalPrices?: number[];
  };
  preorder?: PreorderInfo | null;
  bestDiscount?: { originalPrice: number; finalPrice: number; discountPercent: number; source: string } | null;
  soldQuantity?: number;
};

export interface ProductUI {
  id: number;
  name: string;
  brand: string;
  avatar: string;
  priceText: string;
  rawPrices?: number[];
  finalPrices?: number[];
  preorder?: PreorderInfo | null;
  bestDiscount?: { originalPrice: number; finalPrice: number; discountPercent: number; source: string } | null;
  soldQty?: number;
}
