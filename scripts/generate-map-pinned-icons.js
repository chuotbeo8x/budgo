const fs = require('fs');
const path = require('path');

// Map-pinned icon SVG
const mapPinnedSVG = `
<svg width="512" height="512" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#2563eb"/>
  <circle cx="12" cy="9" r="3" fill="white"/>
</svg>
`;

// Icon sizes for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG for each size
iconSizes.forEach(size => {
  const svgContent = mapPinnedSVG.replace('width="512"', `width="${size}"`).replace('height="512"', `height="${size}"`);
  const svgPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(svgPath, svgContent);
  console.log(`✅ Generated icon-${size}x${size}.svg`);
});

// Update manifest.json to use SVG icons
const manifestPath = path.join(__dirname, '..', 'public', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// Update icons in manifest
manifest.icons = iconSizes.map(size => ({
  src: `/icons/icon-${size}x${size}.svg`,
  sizes: `${size}x${size}`,
  type: "image/svg+xml",
  purpose: "maskable any"
}));

// Update shortcuts icons
manifest.shortcuts.forEach(shortcut => {
  shortcut.icons = [{
    src: "/icons/icon-192x192.svg",
    sizes: "192x192",
    type: "image/svg+xml"
  }];
});

// Write updated manifest
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log('✅ Updated manifest.json with map-pinned icons');

console.log('\n🎯 Map-pinned PWA icons generated successfully!');
console.log('📱 Icons will be displayed as map-pinned symbols in PWA');
