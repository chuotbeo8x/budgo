const fs = require('fs');
const path = require('path');

// Simple icon generator that creates basic PNG files
// This is a fallback if you don't have sharp installed

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

function createSimpleIcon(size) {
  // Create a simple PNG buffer with a blue circle and "B" text
  // This is a basic implementation - you should replace with your actual logo
  
  const canvas = require('canvas');
  const { createCanvas } = canvas;
  
  const canvasElement = createCanvas(size, size);
  const ctx = canvasElement.getContext('2d');
  
  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  
  // Blue circle
  ctx.fillStyle = '#2563eb';
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2 - 10, 0, 2 * Math.PI);
  ctx.fill();
  
  // White "B" text
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size/3}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('B', size/2, size/2);
  
  return canvasElement.toBuffer('image/png');
}

function generateIcons() {
  const outputDir = path.join(__dirname, '../public/icons');
  
  // Create icons directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    for (const { size, name } of sizes) {
      const outputPath = path.join(outputDir, name);
      const iconBuffer = createSimpleIcon(size);
      fs.writeFileSync(outputPath, iconBuffer);
      console.log(`✅ Generated ${name} (${size}x${size})`);
    }
    
    console.log('🎉 All icons generated successfully!');
    console.log('📁 Icons saved to: public/icons/');
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    console.log('💡 Try running: npm install canvas');
  }
}

generateIcons();
