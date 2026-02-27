export const getImageUrl = (item: any): string => {
  const PLACEHOLDER = "https://placehold.jp/400x400.png?text=No%20Image";

  if (!item) return PLACEHOLDER;

  // 1. Identify the raw path or URL
  let target: string | null = null;

  if (typeof item === "string") {
    target = item;
  } else if (item.images && Array.isArray(item.images) && item.images.length > 0) {
    // Prioritize the images array if it's a product object
    const first = item.images[0];
    if (first) {
      target = typeof first === "string" ? first : first.url || first.image || first.path;
    }
  } else if (item.image) {
    target = typeof item.image === "string" ? item.image : item.image.url || item.image.path;
  } else if (item.url) {
    target = item.url;
  } else if (item.path) {
    target = item.path;
  }

  if (!target || typeof target !== "string") return PLACEHOLDER;

  // 2. Clear known dead placeholders or empty values
  const cleanTarget = target.trim();
  if (!cleanTarget || cleanTarget.includes("via.placeholder.com")) return PLACEHOLDER;

  // 3. Resolve path
  if (cleanTarget.startsWith("http")) return cleanTarget;

  const baseUrl = (import.meta as any).env.VITE_API_URL || "http://localhost:3000";

  // Normalize slashes (especially for Windows paths from backend)
  const normalizedPath = cleanTarget.replace(/\\/g, "/");
  const pathWithSlash = normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;

  return `${baseUrl}${pathWithSlash}`;
};
