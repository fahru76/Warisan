/**
 * Royalty-free placeholder imagery until real assets exist (backend ticket H-9).
 * Unsplash Source (source.unsplash.com) is deprecated, so we use Lorem Picsum with a stable seed per row.
 */
export type ImageKind = "hero" | "portrait" | "product";

const SIZE: Record<ImageKind, [number, number]> = {
  hero: [1600, 900],
  portrait: [600, 800],
  product: [800, 800]
};

export function placeholderImage(seed: string, kind: ImageKind): string {
  const [w, h] = SIZE[kind];
  return `https://picsum.photos/seed/warisan-${encodeURIComponent(seed)}/${w}/${h}`;
}
