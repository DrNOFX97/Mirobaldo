const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Build script to prepare assets for Netlify deployment
 * - Compiles biography data into JSON
 * - Copies biography data to public directory
 * - Copies photographs to public directory
 */

const dataDir = path.join(__dirname, '../dados/biografias');
const publicDataDir = path.join(__dirname, '../public/data/biografias');
const fotografiasDir = path.join(__dirname, '../dados/fotografias');
const publicFotografiasDir = path.join(__dirname, '../public/fotografias');
const classificacoesDir = path.join(__dirname, '../dados/classificacoes');
const resultadosDir = path.join(__dirname, '../dados/resultados');
const netlifyDataDir = path.join(__dirname, '../netlify/data');

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

  console.log('[BUILD] Step 3: Copying photographs to public directory...');

  // Copy fotografias directory to public
  if (fs.existsSync(fotografiasDir)) {
    if (!fs.existsSync(publicFotografiasDir)) {
      fs.mkdirSync(publicFotografiasDir, { recursive: true });
    }

    const fotoSubfolders = fs.readdirSync(fotografiasDir).filter(item => {
      const itemPath = path.join(fotografiasDir, item);
      return fs.statSync(itemPath).isDirectory();
    });

    fotoSubfolders.forEach(subfolder => {
      const sourceDir = path.join(fotografiasDir, subfolder);
      const destDir = path.join(publicFotografiasDir, subfolder);

      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      const files = fs.readdirSync(sourceDir);
      let copiedCount = 0;

      files.forEach(file => {
        const sourceFile = path.join(sourceDir, file);
        const destFile = path.join(destDir, file);

        if (fs.statSync(sourceFile).isFile()) {
          fs.copyFileSync(sourceFile, destFile);
          copiedCount++;
        }
      });

      console.log(`[BUILD] ✓ Copied ${copiedCount} images from ${subfolder}`);
    });
  } else {
    console.warn('[BUILD] ⚠️  Fotografias directory not found');
  }
} catch (error) {
  console.error('[BUILD] Error:', error.message);
  process.exit(1);
}

// Step 4: Copy data directories to netlify/data for function access
console.log('[BUILD] Step 4: Copying data directories for Netlify functions...');
try {
  // Create netlify/data directory if it doesn't exist
  if (!fs.existsSync(netlifyDataDir)) {
    fs.mkdirSync(netlifyDataDir, { recursive: true });
  }

  // Copy classificacoes
  if (fs.existsSync(classificacoesDir)) {
    const destClassificacoesDir = path.join(netlifyDataDir, 'classificacoes');
    if (!fs.existsSync(destClassificacoesDir)) {
      fs.mkdirSync(destClassificacoesDir, { recursive: true });
    }
    const classificacoesFiles = fs.readdirSync(classificacoesDir);
    classificacoesFiles.forEach(file => {
      const sourceFile = path.join(classificacoesDir, file);
      const destFile = path.join(destClassificacoesDir, file);
      if (fs.statSync(sourceFile).isFile()) {
        fs.copyFileSync(sourceFile, destFile);
      }
    });
    console.log(`[BUILD] ✓ Copied ${classificacoesFiles.length} classificações files`);
  }

  // Copy resultados
  if (fs.existsSync(resultadosDir)) {
    const destResultadosDir = path.join(netlifyDataDir, 'resultados');
    if (!fs.existsSync(destResultadosDir)) {
      fs.mkdirSync(destResultadosDir, { recursive: true });
    }
    const resultadosFiles = fs.readdirSync(resultadosDir);
    resultadosFiles.forEach(file => {
      const sourceFile = path.join(resultadosDir, file);
      const destFile = path.join(destResultadosDir, file);
      if (fs.statSync(sourceFile).isFile()) {
        fs.copyFileSync(sourceFile, destFile);
      }
    });
    console.log(`[BUILD] ✓ Copied ${resultadosFiles.length} resultados files`);
  }

  console.log('[BUILD] ✓ Build complete!');
} catch (error) {
  console.error('[BUILD] Error:', error.message);
  process.exit(1);
}
