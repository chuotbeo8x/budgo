const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Icon sizes for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create a simple icon programmatically
async function generateIcons() {
  const iconsDir = path.join(__dirname, '../public/icons');
  
  // Ensure icons directory exists
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Create a simple blue icon with a map pin
  const svgIcon = `
    <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="80" fill="url(#gradient)"/>
      <circle cx="256" cy="180" r="60" fill="white" opacity="0.9"/>
      <path d="M256 120c-33.137 0-60 26.863-60 60 0 33.137 26.863 60 60 60s60-26.863 60-60c0-33.137-26.863-60-60-60zm0 80c-11.046 0-20-8.954-20-20s8.954-20 20-20 20 8.954 20 20-8.954 20-20 20z" fill="white"/>
      <rect x="246" y="240" width="20" height="120" rx="10" fill="white" opacity="0.9"/>
      <rect x="236" y="350" width="40" height="30" rx="15" fill="white" opacity="0.9"/>
    </svg>
  `;

  // Generate icons for each size
  for (const size of sizes) {
    try {
      const buffer = await sharp(Buffer.from(svgIcon))
        .resize(size, size)
        .png()
        .toBuffer();
      
      const filename = `icon-${size}x${size}.png`;
      const filepath = path.join(iconsDir, filename);
      
      fs.writeFileSync(filepath, buffer);
      console.log(`✅ Generated ${filename}`);
    } catch (error) {
      console.error(`❌ Error generating icon-${size}x${size}.png:`, error);
    }
  }

  // Also create a favicon
  const faviconBuffer = await sharp(Buffer.from(svgIcon))
    .resize(32, 32)
    .png()
    .toBuffer();
  
  fs.writeFileSync(path.join(__dirname, '../public/favicon.ico'), faviconBuffer);
  console.log('✅ Generated favicon.ico');
  
  console.log('\n🎉 All icons generated successfully!');
}

generateIcons().catch(console.error);
