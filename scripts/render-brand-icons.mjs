// Renders the app's favicon.ico and apple-icon.png from the brand SVGs.
// Usage: node scripts/render-brand-icons.mjs .  (spec 10; sharp comes with next)
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const root = path.resolve(process.argv[2]);
const nextRequire = createRequire(
  path.join(
    fs.realpathSync(path.join(root, "node_modules/next")),
    "package.json",
  ),
);
const sharp = nextRequire("sharp");
const logo = path.join(root, "docs/design/brand/logo");
const app = path.join(root, "src/app");

async function png(svgFile, size) {
  return sharp(fs.readFileSync(path.join(logo, svgFile)), {
    density: 72 * (size / 96) * 2,
  })
    .resize(size, size)
    .png()
    .toBuffer();
}

// An ICO file holding PNG images: 6-byte header, 16-byte entry per image, then the PNGs.
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + 16 * images.length;
  const entries = images.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

(async () => {
  const sizes = [16, 32, 48];
  const images = [];
  for (const size of sizes)
    images.push({ size, data: await png("jubilee-favicon.svg", size) });
  fs.writeFileSync(path.join(app, "favicon.ico"), ico(images));
  fs.writeFileSync(
    path.join(app, "apple-icon.png"),
    await png("jubilee-app-icon-square.svg", 180),
  );
  fs.copyFileSync(
    path.join(logo, "jubilee-favicon.svg"),
    path.join(app, "icon.svg"),
  );
  console.log(
    "favicon.ico (16, 32, 48), apple-icon.png (180), icon.svg written",
  );
})();
