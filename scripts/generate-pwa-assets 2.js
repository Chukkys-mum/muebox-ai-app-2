// scripts/generate-pwa-assets.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Define the input and output paths
const INPUT_SVG_PATH = path.join(__dirname, '../public/img/Muebox lo Filled 2.svg');
const OUTPUT_DIR = path.join(__dirname, '../public');

// Muebox brand colors
const BRAND_COLORS = {
  primary: '#d11038',
  background: '#ffffff',
};

// Define all the icons we need to generate
const ICONS = [
  // PWA and general icons (excluding favicon.ico)
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  
  // Microsoft specific icons
  { name: 'ms-icon-70x70.png', size: 70 },
  { name: 'ms-icon-150x150.png', size: 150 },
  { name: 'ms-icon-310x310.png', size: 310 },
  
  // Social media preview images
  { 
    name: 'muebox-og.png', 
    size: 1200, 
    height: 630,
    optimize: true 
  },
  { 
    name: 'muebox-twitter.png', 
    size: 1200, 
    height: 630,
    optimize: true 
  }
];

// Icon generation options
const ICON_OPTIONS = {
  background: { r: 255, g: 255, b: 255, alpha: 0 },
  fit: 'contain',
};

// Image optimization options
const OPTIMIZATION_OPTIONS = {
  png: {
    quality: 90,
    compressionLevel: 9,
    palette: true
  }
};

async function processImage(inputBuffer, icon, progressCallback) {
  try {
    const sharpInstance = sharp(inputBuffer);
    
    // Configure resize options
    const resizeOptions = {
      width: icon.size,
      height: icon.height || icon.size,
      fit: ICON_OPTIONS.fit,
      background: ICON_OPTIONS.background
    };

    // Process the image
    let pipeline = sharpInstance.resize(resizeOptions);

    // Apply optimization if specified
    if (icon.optimize) {
      pipeline = pipeline.png(OPTIMIZATION_OPTIONS.png);
    } else {
      pipeline = pipeline.png();
    }

    // Save the file
    await pipeline.toFile(path.join(OUTPUT_DIR, icon.name));
    
    if (progressCallback) {
      progressCallback(icon.name);
    }
  } catch (error) {
    throw new Error(`Error processing ${icon.name}: ${error.message}`);
  }
}

async function generateFavicon(inputBuffer) {
  try {
    // Generate 16x16 PNG for favicon
    const faviconBuffer = await sharp(inputBuffer)
      .resize(16, 16, {
        fit: ICON_OPTIONS.fit,
        background: ICON_OPTIONS.background
      })
      .png()
      .toBuffer();

    // Copy the 16x16 PNG to favicon.ico
    fs.writeFileSync(path.join(OUTPUT_DIR, 'favicon.ico'), faviconBuffer);
    return true;
  } catch (error) {
    throw new Error(`Error generating favicon.ico: ${error.message}`);
  }
}

async function generateIcons(progressCallback) {
  try {
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Read the SVG file
    const inputSvg = fs.readFileSync(INPUT_SVG_PATH);

    // Process icons in parallel with a limit of 3 concurrent operations
    const chunks = Array(Math.ceil(ICONS.length / 3)).fill().map((_, i) =>
      ICONS.slice(i * 3, (i + 1) * 3)
    );

    for (const chunk of chunks) {
      await Promise.all(
        chunk.map(icon => processImage(inputSvg, icon, progressCallback))
      );
    }

    // Generate favicon.ico
    await generateFavicon(inputSvg);
    progressCallback('favicon.ico');

    // Generate safari-pinned-tab.svg
    await sharp(inputSvg)
      .toFile(path.join(OUTPUT_DIR, 'safari-pinned-tab.svg'));
    progressCallback('safari-pinned-tab.svg');

    return true;
  } catch (error) {
    throw new Error(`Icon generation failed: ${error.message}`);
  }
}

function validateEnvironment() {
  // Check Node.js version
  const nodeVersion = process.version.match(/^v(\d+)/)[1];
  if (parseInt(nodeVersion) < 14) {
    throw new Error('Node.js version 14 or higher is required');
  }

  // Check if sharp is installed
  try {
    require('sharp');
  } catch {
    throw new Error('sharp package is not installed. Run: npm install sharp --save-dev');
  }
}

async function main() {
  try {
    console.log('\n🎨 Starting icon generation...');
    console.log(`📁 Input SVG: ${INPUT_SVG_PATH}`);
    console.log(`📁 Output directory: ${OUTPUT_DIR}\n`);

    // Validate environment and input
    validateEnvironment();
    
    if (!fs.existsSync(INPUT_SVG_PATH)) {
      throw new Error(`Input SVG file not found at: ${INPUT_SVG_PATH}`);
    }

    // Track progress
    let completed = 0;
    const total = ICONS.length + 2; // +2 for favicon.ico and safari-pinned-tab.svg

    // Generate icons with progress callback
    await generateIcons((iconName) => {
      completed++;
      const progress = Math.round((completed / total) * 100);
      console.log(`[${progress}%] Generated ${iconName}`);
    });

    console.log('\n✅ All icons generated successfully!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n❌ Unexpected error:', error);
  process.exit(1);
});