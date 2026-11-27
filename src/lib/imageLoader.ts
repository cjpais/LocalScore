import presized from "./presized-images.json";

/**
 * next/image loader that serves copies resized ahead of time
 * (scripts/presize-images.mjs) instead of resizing on each request, so images
 * come straight from the static host's cache on Vercel and Cloudflare alike.
 *
 * Next asks for the smallest of its standard widths that covers each pixel
 * density (a 250px image asks for 256 at 1x and 640 at 2x); list those widths
 * in presized-images.json and rerun the script. Anything not listed, such as
 * SVGs, is served as is.
 */
const sizes: Record<string, number[]> = presized;

export default function imageLoader({
  src,
  width,
}: {
  src: string;
  width: number;
}): string {
  const widths = sizes[src];
  if (!widths) return src;
  const w = widths.find((s) => s >= width) ?? widths[widths.length - 1];
  return `/img${src.replace(/\.[^.]+$/, "")}-${w}.webp`;
}
