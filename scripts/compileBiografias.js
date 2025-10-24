/**
 * Script para compilar todas as biografias num único arquivo JSON
 * Este arquivo é incluído no bundle Netlify e está garantido estar disponível
 * Converts Markdown to HTML to ensure instant rendering without progressive display
 */

const fs = require('fs');
const path = require('path');
const marked = require('marked');

const biografiasRootDir = path.join(__dirname, '../dados/biografias');
const outputFile = path.join(__dirname, '../netlify/functions/biografiasCompiled.json');

const biografiasData = {};
const subfolders = ['jogadores', 'presidentes', 'treinadores', 'outras_figuras'];

console.log('[COMPILE] Starting biography compilation...');

subfolders.forEach(subfolder => {
  const folderPath = path.join(biografiasRootDir, subfolder);

  if (fs.existsSync(folderPath)) {
    const files = fs.readdirSync(folderPath);
    const mdFiles = files.filter(f => f.endsWith('.md'));

    mdFiles.forEach(file => {
      try {
        const filePath = path.join(folderPath, file);
        let content = fs.readFileSync(filePath, 'utf-8');

        // Convert relative image paths to absolute URLs for production
        // Use environment variable if available, otherwise default to mirobaldo.pt
        const imageBaseUrl = process.env.IMAGE_BASE_URL || 'https://mirobaldo.pt';

        // Replace relative paths with absolute URLs and convert .png to .webp for smaller file sizes
        content = content.replace(
          /src="\/fotografias\/([^"]*\.png)"/g,
          (match, filepath) => `src="${imageBaseUrl}/fotografias/${filepath.replace(/\.png$/, '.webp')}"`
        );

        // Also handle absolute URLs that still have .png
        content = content.replace(
          /src="https?:\/\/[^"]*\/fotografias\/([^"]*\.png)"/g,
          (match, filepath) => `src="${imageBaseUrl}/fotografias/${filepath.replace(/\.png$/, '.webp')}"`
        );

        // Convert Markdown to HTML for instant rendering without progressive display
        // This ensures the entire response appears at once, not in blocks
        try {
          content = marked.parse(content);
        } catch (parseErr) {
          console.error(`[COMPILE] Warning: Could not parse markdown for ${file}:`, parseErr.message);
          // Fall back to original content if parsing fails
        }

        const nameFromFile = file
          .replace(/^historia_/, '')
          .replace(/^bio_/, '')
          .replace(/_formatado/, '')
          .replace(/\.md$/, '')
          .replace(/_/g, ' ');

        biografiasData[nameFromFile.toLowerCase()] = {
          name: nameFromFile,
          subfolder,
          file,
          content,
        };
      } catch (err) {
        console.error(`[COMPILE] Error loading ${file}:`, err.message);
      }
    });
  }
});

// Write to file
try {
  fs.writeFileSync(outputFile, JSON.stringify(biografiasData, null, 0));
  console.log(`[COMPILE] ✓ Compiled ${Object.keys(biografiasData).length} biographies`);
  console.log(`[COMPILE] ✓ Output file: ${outputFile}`);
  console.log(`[COMPILE] ✓ File size: ${(fs.statSync(outputFile).size / 1024 / 1024).toFixed(2)} MB`);
} catch (err) {
  console.error('[COMPILE] Error writing output file:', err.message);
  process.exit(1);
}
