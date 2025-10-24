const fs = require('fs');
const path = require('path');

/**
 * Build script to prepare assets for Netlify deployment
 * Copies biography data to a location accessible by Netlify Functions
 */

const dataDir = path.join(__dirname, '../dados/biografias');
const publicDataDir = path.join(__dirname, '../public/data/biografias');

console.log('[BUILD] Starting build process...');

// Ensure public/data/biografias directory exists
if (!fs.existsSync(publicDataDir)) {
  console.log('[BUILD] Creating directory:', publicDataDir);
  fs.mkdirSync(publicDataDir, { recursive: true });
}

// Copy biography files to public directory
const subfolders = ['jogadores', 'presidentes', 'treinadores', 'outras_figuras'];

try {
  subfolders.forEach(subfolder => {
    const sourcePath = path.join(dataDir, subfolder);
    const destPath = path.join(publicDataDir, subfolder);

    if (fs.existsSync(sourcePath)) {
      console.log(`[BUILD] Copying ${subfolder}...`);

      // Create destination folder
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }

      // Copy all files
      const files = fs.readdirSync(sourcePath);
      files.forEach(file => {
        const sourceFile = path.join(sourcePath, file);
        const destFile = path.join(destPath, file);

        if (fs.statSync(sourceFile).isFile()) {
          fs.copyFileSync(sourceFile, destFile);
        }
      });

      console.log(`[BUILD] ✓ Copied ${files.length} files from ${subfolder}`);
    }
  });

  console.log('[BUILD] ✓ Build complete!');
} catch (error) {
  console.error('[BUILD] Error:', error.message);
  process.exit(1);
}
