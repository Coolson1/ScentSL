import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

async function main() {
  console.log("Generating 1200x630 static OpenGraph image...");

  const width = 1200;
  const height = 630;

  // Read logo buffer
  const logoPath = path.join(process.cwd(), "public", "scentsl.jpeg");
  let logoBuffer: Buffer;
  if (fs.existsSync(logoPath)) {
    logoBuffer = fs.readFileSync(logoPath);
  } else {
    logoBuffer = fs.readFileSync(path.join(process.cwd(), "public", "icon-512.png"));
  }

  // Circular logo composite
  const resizedLogo = await sharp(logoBuffer)
    .resize(150, 150, { fit: "cover" })
    .composite([
      {
        input: Buffer.from(
          `<svg width="150" height="150"><circle cx="75" cy="75" r="75" fill="#fff"/></svg>`
        ),
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();

  // Create Gold Ring Frame around logo
  const ringBuffer = await sharp({
    create: {
      width: 160,
      height: 160,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: Buffer.from(
          `<svg width="160" height="160">
            <circle cx="80" cy="80" r="78" fill="none" stroke="#C5A059" stroke-width="3" />
          </svg>`
        ),
      },
      {
        input: resizedLogo,
        top: 5,
        left: 5,
      },
    ])
    .png()
    .toBuffer();

  // Create SVG overlay for typography & borders
  const svgOverlay = Buffer.from(`
    <svg width="${width}" height="${height}">
      <style>
        .title { font-family: serif; font-size: 58px; font-weight: 300; fill: #C5A059; letter-spacing: 18px; text-anchor: middle; }
        .subtitle { font-family: sans-serif; font-size: 20px; font-weight: 400; fill: rgba(246, 244, 238, 0.85); letter-spacing: 9px; text-anchor: middle; }
        .tagline { font-family: serif; font-size: 18px; font-style: italic; fill: rgba(246, 244, 238, 0.6); letter-spacing: 1px; text-anchor: middle; }
      </style>

      <!-- Outer Gold Border -->
      <rect x="24" y="24" width="${width - 48}" height="${height - 48}" fill="none" stroke="rgba(197, 160, 89, 0.35)" stroke-width="1.5" />

      <!-- Inner Subtle Border -->
      <rect x="32" y="32" width="${width - 64}" height="${height - 64}" fill="none" stroke="rgba(246, 244, 238, 0.08)" stroke-width="1" />

      <!-- Gold Separator Line -->
      <line x1="${width / 2 - 70}" y1="460" x2="${width / 2 + 70}" y2="460" stroke="rgba(197, 160, 89, 0.5)" stroke-width="1" />

      <!-- Text -->
      <text x="${width / 2}" y="430" class="title">SCENTSL</text>
      <text x="${width / 2}" y="500" class="subtitle">LUXURY FRAGRANCE · FREETOWN</text>
      <text x="${width / 2}" y="540" class="tagline">An archive of scent for the discerning</text>
    </svg>
  `);

  // Render final 1200x630 image
  const finalImage = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 17, g: 16, b: 13, alpha: 1 }, // #11100D
    },
  })
    .composite([
      {
        input: ringBuffer,
        top: 150,
        left: Math.round(width / 2 - 80),
      },
      {
        input: svgOverlay,
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toBuffer();

  const outPath1 = path.join(process.cwd(), "public", "og-image.png");
  const outPath2 = path.join(process.cwd(), "public", "opengraph-image.png");

  fs.writeFileSync(outPath1, finalImage);
  fs.writeFileSync(outPath2, finalImage);

  console.log("Static OpenGraph image generated successfully at:");
  console.log(" - public/og-image.png (1200x630)");
  console.log(" - public/opengraph-image.png (1200x630)");
}

main().catch(console.error);
