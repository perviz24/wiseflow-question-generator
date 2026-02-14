import sharp from 'sharp';
import { mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const sourceIcon = join(publicDir, 'tentagen-icon-512.png');

// Ensure public directory exists
if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });

const sizes = [
  // Favicons
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-48x48.png', size: 48 },

  // Apple Touch Icon
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'apple-touch-icon-152x152.png', size: 152 },
  { name: 'apple-touch-icon-120x120.png', size: 120 },

  // Android Chrome / PWA
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },

  // Microsoft Tile
  { name: 'mstile-150x150.png', size: 150 },

  // Generic social/platform sizes
  { name: 'icon-64x64.png', size: 64 },
  { name: 'icon-96x96.png', size: 96 },
  { name: 'icon-128x128.png', size: 128 },
  { name: 'icon-256x256.png', size: 256 },
  { name: 'icon-384x384.png', size: 384 },
];

async function generateIcons() {
  console.log('Generating icons from:', sourceIcon);

  for (const { name, size } of sizes) {
    const outputPath = join(publicDir, name);
    await sharp(sourceIcon)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(outputPath);
    console.log(`✅ Generated: ${name} (${size}x${size})`);
  }

  // Generate favicon.ico (multi-size ICO-like PNG - browsers accept PNG as favicon)
  await sharp(sourceIcon)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(join(publicDir, 'favicon.png'));
  console.log('✅ Generated: favicon.png (32x32)');

  console.log('\n🎉 All icons generated successfully!');
  console.log(`Total: ${sizes.length + 1} icon files in public/`);
}

generateIcons().catch(console.error);
