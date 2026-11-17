import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const outDir = path.join(root, 'public/og');
const outFile = path.join(outDir, 'shitty-tees.png');
const hero = path.join(root, 'public/images/designs/dead-tired-mockup.png');

const card = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#111111"/>
  <g transform="translate(76 248) scale(1.65)">
    <rect x="4" y="4" width="56" height="56" rx="14" fill="none" stroke="#f2ecde" stroke-width="3"/>
    <path d="M16 20h32v8H34v20h-8V28H16z" fill="#5b1216"/>
    <path d="M18 42h28" stroke="#f2ecde" stroke-width="4" stroke-linecap="round"/>
    <path d="M21 15l22 22" stroke="#f2ecde" stroke-width="2.5" stroke-linecap="round" opacity="0.8"/>
  </g>
  <text x="196" y="300" fill="#f2e8d5" font-family="Inter, DejaVu Sans, sans-serif" font-size="46" font-weight="700" letter-spacing="3">SHITTY TEES</text>
  <text x="548" y="286" fill="#a99f8c" font-family="Inter, DejaVu Sans, sans-serif" font-size="26" font-weight="700">/</text>
  <text x="76" y="410" fill="#c9beaa" font-family="Inter, DejaVu Sans, sans-serif" font-size="28">Terrible Ideas. Excellent Shirts.</text>
</svg>`;

const photo = await sharp(hero)
  .resize(460, 630, { fit: 'cover', position: 'centre' })
  .png()
  .toBuffer();

await mkdir(outDir, { recursive: true });
await sharp(Buffer.from(card))
  .composite([{ input: photo, left: 740, top: 0 }])
  .png({ compressionLevel: 9 })
  .toFile(outFile);

const info = await sharp(outFile).metadata();
console.log(`Wrote ${outFile} ${info.width}x${info.height} ${info.format}`);
