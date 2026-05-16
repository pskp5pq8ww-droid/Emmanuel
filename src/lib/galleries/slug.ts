import slugify from "slugify";

export function createGallerySlug(title: string) {
  return slugify(title, {
    lower: true,
    strict: true,
    trim: true,
  });
}
