const sharp = require('sharp');
const fs = require('fs');

const sizes = {
  'favicon-16x16.png': 16,
  'favicon-32x32.png': 32,
  'apple-touch-icon.png': 180,
  'android-chrome-192x192.png': 192,
  'android-chrome-512x512.png': 512
};

async function generateFavicons() {
  const inputSvg = fs.readFileSync('./public/img/Muebox lo Filled 2.svg');
  
  for (const [filename, size] of Object.entries(sizes)) {
    await sharp(inputSvg)
      .resize(size, size)
      .toFile(`./public/${filename}`);
  }

  // Generate ICO file
  await sharp(inputSvg)
    .resize(16, 16)
    .toFile('./public/favicon.ico');
}

generateFavicons();