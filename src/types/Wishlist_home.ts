export type WishlistItem = {
  id: number; // user_id (จาก backend map)
  product: {
    id: number;
    name: string;
    description?: string | null;
    variant?: string | null;
    inventory?: string | null;
    imageUrl?: string | null;
  };
};