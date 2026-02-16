/**
 * Utility functions for handling product variants
 */

/**
 * Get the lowest price from an array of variants
 * @param {Array} variants - Array of product variants
 * @returns {number} - Lowest price or 0 if no variants
 */
export const getLowestPrice = (variants) => {
  if (!variants || variants.length === 0) return 0;
  const prices = variants.map((v) => v.sale_price || v.price).filter((p) => p != null && p > 0);
  if (prices.length === 0) return 0;
  return Math.min(...prices);
};

/**
 * Get the highest price from an array of variants
 * @param {Array} variants - Array of product variants
 * @returns {number} - Highest price or 0 if no variants
 */
export const getHighestPrice = (variants) => {
  if (!variants || variants.length === 0) return 0;
  const prices = variants.map((v) => v.sale_price || v.price).filter((p) => p != null && p > 0);
  if (prices.length === 0) return 0;
  return Math.max(...prices);
};

/**
 * Get formatted price range string
 * @param {Array} variants - Array of product variants
 * @returns {string} - Formatted price range (e.g., "₹1,000 - ₹2,000" or "₹1,000")
 */
export const getPriceRange = (variants) => {
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
 * @param {Array} variants - Array of product variants
 * @returns {Array} - Array of unique color strings
 */
export const getAvailableColors = (variants) => {
  if (!variants || variants.length === 0) return [];

  const colors = variants.map((v) => v.color).filter((color) => color && color.trim() !== "");

  return [...new Set(colors)];
};

/**
 * Get unique sizes from variants
 * @param {Array} variants - Array of product variants
 * @returns {Array} - Array of unique size strings
 */
export const getAvailableSizes = (variants) => {
  if (!variants || variants.length === 0) return [];

  const sizes = variants.map((v) => v.size).filter((size) => size && size.trim() !== "");

  return [...new Set(sizes)];
};

/**
 * Get total stock across all variants
 * @param {Array} variants - Array of product variants
 * @returns {number} - Total stock quantity
 */
export const getTotalStock = (variants) => {
  if (!variants || variants.length === 0) return 0;
  return variants.reduce((total, v) => total + (v.stock_qty || 0), 0);
};

/**
 * Find a specific variant by color and/or size
 * @param {Array} variants - Array of product variants
 * @param {string} color - Color to match (optional)
 * @param {string} size - Size to match (optional)
 * @returns {Object|null} - Matching variant or null
 */
export const findVariant = (variants, color = null, size = null) => {
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
 * @param {Object} variant - Product variant
 * @returns {boolean} - True if variant has stock
 */
export const isVariantAvailable = (variant) => {
  if (!variant) return false;
  return variant.stock_qty > 0;
};

/**
 * Get the first available variant (with stock)
 * @param {Array} variants - Array of product variants
 * @returns {Object|null} - First available variant or null
 */
export const getFirstAvailableVariant = (variants) => {
  if (!variants || variants.length === 0) return null;
  return variants.find((v) => isVariantAvailable(v)) || variants[0] || null;
};

/**
 * Generate a random SKU
 * @returns {string} - Random SKU string
 */
export const generateSKU = () => {
  const prefix = "SKU";
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${prefix}-${random}`;
};

/**
 * Check if product has variants
 * @param {Object} product - Product object
 * @returns {boolean} - True if product has variants
 */
export const hasVariants = (product) => {
  return product?.variants && product.variants.length > 0;
};

/**
 * Get variant display name (e.g., "Red / Large")
 * @param {Object} variant - Product variant
 * @returns {string} - Display name
 */
export const getVariantDisplayName = (variant) => {
  if (!variant) return "";

  const parts = [];
  if (variant.color) parts.push(variant.color);
  if (variant.size) parts.push(variant.size);

  return parts.length > 0 ? parts.join(" / ") : "Default";
};

/**
 * Get stock status text
 * @param {Object} variant - Product variant
 * @returns {string} - Stock status text
 */
export const getStockStatus = (variant) => {
  if (!variant) return "Unavailable";

  const stock = variant.stock_qty || 0;

  if (stock === 0) return "Out of Stock";
  if (stock < 5) return `Only ${stock} left`;
  return `In Stock (${stock} available)`;
};

/**
 * Get variants grouped by color
 * @param {Array} variants - Array of product variants
 * @returns {Object} - Object with colors as keys and variants as values
 */
export const groupVariantsByColor = (variants) => {
  if (!variants || variants.length === 0) return {};

  return variants.reduce((acc, variant) => {
    const color = variant.color || "Default";
    if (!acc[color]) acc[color] = [];
    acc[color].push(variant);
    return acc;
  }, {});
};

/**
 * Get variants filtered by color
 * @param {Array} variants - Array of product variants
 * @param {string} color - Color to filter by
 * @returns {Array} - Filtered variants
 */
export const getVariantsByColor = (variants, color) => {
  if (!variants || variants.length === 0) return [];
  return variants.filter((v) => v.color === color);
};
