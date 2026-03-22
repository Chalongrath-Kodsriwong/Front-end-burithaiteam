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
};

export interface ProductUI {
  id: number;
  name: string;
  brand: string;
  avatar: string;
  priceText: string;
  finalPriceText?: string;
}