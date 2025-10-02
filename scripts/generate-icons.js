const fs = require('fs');
const path = require('path');

// Simple SVG to PNG converter using canvas (requires sharp package)
const sharp = require('sharp');

const sizes = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' }
];

async function generateIcons() {
  const svgPath = path.join(__dirname, '../public/logo-budgo.svg');
  const outputDir = path.join(__dirname, '../public/icons');
  
  // Create icons directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // Read SVG file
    const svgBuffer = fs.readFileSync(svgPath);
    
    for (const { size, name } of sizes) {
      const outputPath = path.join(outputDir, name);
      
      await sharp(svgBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated ${name} (${size}x${size})`);
    }
    
    console.log('🎉 All icons generated successfully!');
  } catch (error) {
    console.error('❌ Error generating icons:', error);
  }
}

generateIcons();
