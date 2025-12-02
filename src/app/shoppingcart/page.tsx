"use client";

import DisplayItemCart from "./section_shoppingcart/displayItemcart";
import SimilarProduct from "../detail_product/section_detailproduct/similar_product";
import Normalproducts from "../components/section_page/Normalproducts";

export default function ShoppingCartPage() {
  return (
    <>
      {/* <h1 className="text-3xl font-bold mb-6 text-center">🛒 Shopping Cart</h1> */}
        <div className="max-w-7xl mx-auto px-4 py-10">
        <DisplayItemCart />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-10">
            {/* <SimilarProduct productId="" limit={0} /> */}
            <Normalproducts />
        </div>
    </>
  );
}
