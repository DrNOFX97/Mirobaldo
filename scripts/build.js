const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Build script to prepare assets for Netlify deployment
 * - Compiles biography data into JSON
 * - Copies biography data to public directory
 */

const dataDir = path.join(__dirname, '../dados/biografias');
const publicDataDir = path.join(__dirname, '../public/data/biografias');

console.log('[BUILD] Starting build process...');

// Step 1: Compile biographies
console.log('[BUILD] Step 1: Compiling biographies...');
try {
  execSync(`node ${path.join(__dirname, 'compileBiografias.js')}`, { stdio: 'inherit' });
} catch (err) {
  console.error('[BUILD] Error during biography compilation:', err.message);
  process.exit(1);
}

// Step 2: Copy biography files to public directory for static serving
console.log('[BUILD] Step 2: Copying biography files to public directory...');

const subfolders = ['jogadores', 'presidentes', 'treinadores', 'outras_figuras'];

// Ensure public/data/biografias directory exists
if (!fs.existsSync(publicDataDir)) {
  console.log('[BUILD] Creating directory:', publicDataDir);
  fs.mkdirSync(publicDataDir, { recursive: true });
}

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
