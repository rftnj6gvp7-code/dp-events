const sharp = require('sharp');
const fs = require('fs');
const svg = fs.readFileSync('public/icons/icon.svg');
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
sizes.forEach(size => {
  sharp(svg).resize(size, size).png().toFile(`public/icons/icon-${size}x${size}.png`)
    .then(() => console.log(`✓ ${size}x${size}`))
    .catch(err => console.error(err));
});
