import { Variant, Product } from "../types";

/**
 * Utility functions for handling product variants
 */

/**
 * Get the lowest price from an array of variants
 * @param {Variant[]} variants - Array of product variants
 * @returns {number} - Lowest price or 0 if no variants
 */
export const getLowestPrice = (variants: Variant[]): number => {
  if (!variants || variants.length === 0) return 0;
  const prices = variants.map((v) => v.sale_price || v.price).filter((p) => p != null && p > 0);
  if (prices.length === 0) return 0;
  return Math.min(...prices);
};

/**
 * Get the highest price from an array of variants
 * @param {Variant[]} variants - Array of product variants
 * @returns {number} - Highest price or 0 if no variants
 */
export const getHighestPrice = (variants: Variant[]): number => {
  if (!variants || variants.length === 0) return 0;
  const prices = variants.map((v) => v.sale_price || v.price).filter((p) => p != null && p > 0);
  if (prices.length === 0) return 0;
  return Math.max(...prices);
};

/**
 * Get formatted price range string
 * @param {Variant[]} variants - Array of product variants
 * @returns {string} - Formatted price range (e.g., "₹1,000 - ₹2,000" or "₹1,000")
 */
export const getPriceRange = (variants: Variant[]): string => {
  if (!variants || variants.length === 0) return "₹0";

  const lowest = getLowestPrice(variants);
  const highest = getHighestPrice(variants);

  if (lowest === highest) {
    return `₹${lowest.toLocaleString()}`;
  }

  return `₹${lowest.toLocaleString()} - ₹${highest.toLocaleString()}`;
};

/**
 * Get unique colors from variants
 * @param {Variant[]} variants - Array of product variants
 * @returns {string[]} - Array of unique color strings
 */
export const getAvailableColors = (variants: Variant[]): string[] => {
  if (!variants || variants.length === 0) return [];

  const colors = variants
    .map((v) => v.color)
    .filter((color): color is string => !!(color && color.trim() !== ""));

  return [...new Set(colors)];
};

/**
 * Get unique sizes from variants
 * @param {Variant[]} variants - Array of product variants
 * @returns {string[]} - Array of unique size strings
 */
export const getAvailableSizes = (variants: Variant[]): string[] => {
  if (!variants || variants.length === 0) return [];

  const sizes = variants
    .map((v) => v.size)
    .filter((size): size is string => !!(size && size.trim() !== ""));

  return [...new Set(sizes)];
};

/**
 * Get total stock across all variants
 * @param {Variant[]} variants - Array of product variants
 * @returns {number} - Total stock quantity
 */
export const getTotalStock = (variants: Variant[]): number => {
  if (!variants || variants.length === 0) return 0;
  return variants.reduce((total, v) => total + (v.stock_qty || 0), 0);
};

/**
 * Find a specific variant by color and/or size
 * @param {Variant[]} variants - Array of product variants
 * @param {string|null} color - Color to match (optional)
 * @param {string|null} size - Size to match (optional)
 * @returns {Variant|null} - Matching variant or null
 */
export const findVariant = (
  variants: Variant[],
  color: string | null = null,
  size: string | null = null,
): Variant | null => {
  if (!variants || variants.length === 0) return null;

  return (
    variants.find((v) => {
      const colorMatch = !color || v.color === color;
      const sizeMatch = !size || v.size === size;
      return colorMatch && sizeMatch;
    }) || null
  );
};

/**
 * Check if a variant is available (has stock)
 * @param {Variant} variant - Product variant
 * @returns {boolean} - True if variant has stock
 */
export const isVariantAvailable = (variant: Variant): boolean => {
  if (!variant) return false;
  return variant.stock_qty > 0;
};

/**
 * Get the first available variant (with stock)
 * @param {Variant[]} variants - Array of product variants
 * @returns {Variant|null} - First available variant or null
 */
export const getFirstAvailableVariant = (variants: Variant[]): Variant | null => {
  if (!variants || variants.length === 0) return null;
  return variants.find((v) => isVariantAvailable(v)) || variants[0] || null;
};

/**
 * Generate a random SKU
 * @returns {string} - Random SKU string
 */
export const generateSKU = (): string => {
  const prefix = "SKU";
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${prefix}-${random}`;
};

/**
 * Check if product has variants
 * @param {Product} product - Product object
 * @returns {boolean} - True if product has variants
 */
export const hasVariants = (product: Product): boolean => {
  return !!(product?.variants && product.variants.length > 0);
};

/**
 * Get variant display name (e.g., "Red / Large")
 * @param {Variant} variant - Product variant
 * @returns {string} - Display name
 */
export const getVariantDisplayName = (variant: Variant): string => {
  if (!variant) return "";

  const parts = [];
  if (variant.color) parts.push(variant.color);
  if (variant.size) parts.push(variant.size);

  return parts.length > 0 ? parts.join(" / ") : "Default";
};

/**
 * Get stock status text
 * @param {Variant} variant - Product variant
 * @returns {string} - Stock status text
 */
export const getStockStatus = (variant: Variant): string => {
  if (!variant) return "Unavailable";

  const stock = variant.stock_qty || 0;

  if (stock === 0) return "Out of Stock";
  if (stock < 5) return `Only ${stock} left`;
  return `In Stock (${stock} available)`;
};

/**
 * Get variants grouped by color
 * @param {Variant[]} variants - Array of product variants
 * @returns {Record<string, Variant[]>} - Object with colors as keys and variants as values
 */
export const groupVariantsByColor = (variants: Variant[]): Record<string, Variant[]> => {
  if (!variants || variants.length === 0) return {};

  return variants.reduce((acc: Record<string, Variant[]>, variant) => {
    const color = variant.color || "Default";
    if (!acc[color]) acc[color] = [];
    acc[color].push(variant);
    return acc;
  }, {});
};

/**
 * Get variants filtered by color
 * @param {Variant[]} variants - Array of product variants
 * @param {string} color - Color to filter by
 * @returns {Variant[]} - Filtered variants
 */
export const getVariantsByColor = (variants: Variant[], color: string): Variant[] => {
  if (!variants || variants.length === 0) return [];
  return variants.filter((v) => v.color === color);
};
