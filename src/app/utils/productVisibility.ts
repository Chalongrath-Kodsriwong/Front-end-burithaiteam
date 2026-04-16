export function extractFinitePrices(product: any): number[] {
  const rawPrices = Array.isArray(product?.prices)
    ? product.prices
    : product?.price !== undefined
      ? [product.price]
      : [];

  const pricesFromField = rawPrices
    .map((value: unknown) => Number(value))
    .filter((value: number) => Number.isFinite(value) && value > 0);

  if (pricesFromField.length > 0) {
    return pricesFromField;
  }

  const nestedInventories = Array.isArray(product?.variants)
    ? product.variants.flatMap((variant: any) =>
        Array.isArray(variant?.inventories)
          ? variant.inventories.map((inventory: any) => Number(inventory?.price))
          : []
      )
    : [];

  return nestedInventories.filter(
    (value: number) => Number.isFinite(value) && value > 0
  );
}

export function isSellableProduct(product: any): boolean {
  const id = Number(product?.id_products ?? product?.id);
  if (!Number.isFinite(id) || id <= 0) {
    return false;
  }

  return extractFinitePrices(product).length > 0;
}
