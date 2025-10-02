const fs = require('fs');
const path = require('path');

// Copy favicon.png to all required icon sizes
// This is the simplest approach - just copy the same file with different names

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

function copyIcons() {
  const sourcePath = path.join(__dirname, '../public/favicon.png');
  const outputDir = path.join(__dirname, '../public/icons');
  
  // Check if source file exists
  if (!fs.existsSync(sourcePath)) {
    console.error('❌ Source file not found: public/favicon.png');
    console.log('💡 Please make sure favicon.png exists in public/ directory');
    return;
  }
  
  // Create icons directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log('📁 Created icons directory');
  }

  try {
    // Read source file
    const sourceBuffer = fs.readFileSync(sourcePath);
    
    for (const { size, name } of sizes) {
      const outputPath = path.join(outputDir, name);
      fs.writeFileSync(outputPath, sourceBuffer);
      console.log(`✅ Created ${name} (${size}x${size})`);
    }
    
    console.log('🎉 All icons created successfully!');
    console.log('📁 Icons saved to: public/icons/');
    console.log('💡 Note: All icons are the same size as favicon.png');
    console.log('💡 For proper PWA icons, you should create different sizes');
  } catch (error) {
    console.error('❌ Error creating icons:', error);
  }
}

copyIcons();
