import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

// Generate SVG with green gradient background and white Zap icon
function generateIconSvg(size) {
    const strokeWidth = size <= 16 ? 2.5 : size <= 32 ? 2.2 : size <= 48 ? 2 : 1.8;
    const padding = size * 0.2;
    const iconSize = size - padding * 2;

    // Zap path from Lucide (scaled to fit)
    const scale = iconSize / 24;
    const offset = padding;

    return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#34d399"/>
      <stop offset="100%" style="stop-color:#10b981"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#bg)"/>
  <g transform="translate(${offset}, ${offset}) scale(${scale})">
    <path
      d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
      fill="none"
      stroke="white"
      stroke-width="${strokeWidth}"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </g>
</svg>`.trim();
}

async function generateIcons() {
    await mkdir(publicDir, { recursive: true });

    const sizes = [16, 32, 48, 128];

    for (const size of sizes) {
        const svg = generateIconSvg(size);
        const outputPath = join(publicDir, `icon${size}.png`);

        await sharp(Buffer.from(svg))
            .png()
            .toFile(outputPath);

        console.log(`Generated: icon${size}.png`);
    }

    console.log('\nDone! Icons generated in public/ folder.');
}

generateIcons().catch(console.error);
