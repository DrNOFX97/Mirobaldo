/**
 * Pre-loaded biography data for Netlify Functions
 * This file loads all biography data at build time
 */

const fs = require('fs');
const path = require('path');

function loadBiografiasData() {
  const biografiasData = {};

  try {
    const publicDataDir = path.join(__dirname, '../../public/data/biografias');

    if (!fs.existsSync(publicDataDir)) {
      console.warn('[BIOGRAFIAS] Public data directory not found');
      return biografiasData;
    }

    const subfolders = ['jogadores', 'presidentes', 'treinadores', 'outras_figuras'];

    subfolders.forEach(subfolder => {
      const folderPath = path.join(publicDataDir, subfolder);

      if (fs.existsSync(folderPath)) {
        const files = fs.readdirSync(folderPath);
        const mdFiles = files.filter(f => f.endsWith('.md'));

        mdFiles.forEach(file => {
          try {
            const filePath = path.join(folderPath, file);
            const content = fs.readFileSync(filePath, 'utf-8');

            // Extract name from filename (e.g., historia_hassan_nader.md -> hassan nader)
            const nameFromFile = file
              .replace(/^historia_/, '')
              .replace(/\.md$/, '')
              .replace(/_/g, ' ');

            biografiasData[nameFromFile.toLowerCase()] = {
              file,
              content,
              subfolder,
              name: nameFromFile,
            };
          } catch (err) {
            console.error(`[BIOGRAFIAS] Error loading ${file}:`, err.message);
          }
        });
      }
    });

    console.log(`[BIOGRAFIAS] Loaded ${Object.keys(biografiasData).length} biographies`);
  } catch (error) {
    console.error('[BIOGRAFIAS] Error loading data:', error.message);
  }

  return biografiasData;
}

// Load data once at startup
const biografiasData = loadBiografiasData();

function searchBiografias(query) {
  const searchTerm = query.toLowerCase().trim();

  // Direct exact match
  if (biografiasData[searchTerm]) {
    return [biografiasData[searchTerm]];
  }

  // Partial matching
  const results = [];
  Object.entries(biografiasData).forEach(([key, value]) => {
    if (key.includes(searchTerm) || value.name.includes(query)) {
      results.push(value);
    }
  });

  return results;
}

module.exports = {
  searchBiografias,
  biografiasData,
};
