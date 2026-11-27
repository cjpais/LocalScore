// Writes the resized copies listed in src/lib/presized-images.json to
// public/img/<name>-<width>.webp, for src/lib/imageLoader.ts.
// Run after adding or changing an image: node scripts/presize-images.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const list = JSON.parse(
  fs.readFileSync(path.join(root, "src/lib/presized-images.json"), "utf8"),
);
const outDir = path.join(root, "public/img");
fs.mkdirSync(outDir, { recursive: true });

for (const [src, widths] of Object.entries(list)) {
  const input = path.join(root, "public", src);
  for (const width of widths) {
    const name = `${src.replace(/^\//, "").replace(/\.[^.]+$/, "")}-${width}.webp`;
    // Same settings as Next's optimizer: never upscale, WebP at quality 75.
    await sharp(input)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(path.join(outDir, name));
    console.log(`public/img/${name}`);
  }
}
