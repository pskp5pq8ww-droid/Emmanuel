// Combining diacritical marks range U+0300–U+036F
const DIACRITICS = /[̀-ͯ]/g;

export function createGallerySlug(title: string): string {
  const base =
    title
      .toLowerCase()
      .normalize("NFD")
      .replace(DIACRITICS, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "gallery";
  return `${base}-${Date.now().toString(36)}`;
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}
