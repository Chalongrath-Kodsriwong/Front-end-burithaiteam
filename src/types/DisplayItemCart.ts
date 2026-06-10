export interface Product {
  cartItemId: number;
  id: number;
  name: string;
  branch: string;
  price: number;
  originalPrice?: number;
  discountedPrice?: number | null;
  discountPct?: number;
  description: string;
  avatar: string;
  quantity: number;
  inventoryId: number | null;
  isPreorder?: boolean;
}