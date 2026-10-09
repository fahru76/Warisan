import { cn } from "../lib/cn";

/**
 * Ratio-locked image. Ratios are fixed per content type:
 *   hero → 16:9, heroWide → 2:1, portrait → 3:4, portraitTall → 4:5, product → 1:1.
 * The <img> always carries object-cover + object-center so nothing stretches.
 */
const RATIO = {
  hero: "aspect-video",
  heroWide: "aspect-[2/1]",
  portrait: "aspect-[3/4]",
  portraitTall: "aspect-[4/5]",
  product: "aspect-square"
} as const;

export type ImageRatio = keyof typeof RATIO;

export function SmartImage({ src, alt, ratio, className, imgClassName, priority = false }: { src: string; alt: string; ratio: ImageRatio; className?: string; imgClassName?: string; priority?: boolean }) {
  return (
    <div className={cn("relative overflow-hidden bg-line/40", RATIO[ratio], className)}>
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={cn("h-full w-full object-cover object-center", imgClassName)}
      />
    </div>
  );
}
