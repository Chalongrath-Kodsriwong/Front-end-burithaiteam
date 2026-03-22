export interface CartItem {
  cartItemId: number;
  id: number;
  variantId: number;
  inventoryId: number;
  quantity: number;
}

export interface CartContextType {
  cartItems: CartItem[];
  refreshCart: () => Promise<void>;
  addToCart: (
    productId: number,
    qty: number,
    variantId: number,
    inventoryId: number
  ) => Promise<void>;
  increaseQuantity: (cartItemId: number) => Promise<void>;
  decreaseQuantity: (cartItemId: number) => Promise<void>;
  clearCart: () => void;   // ⭐ เพิ่มตรงนี้
}