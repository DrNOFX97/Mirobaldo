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

  // Extract key terms from query (remove common words)
  const cleanQuery = searchTerm
    .replace(/quem (foi|é|era)/gi, '')
    .replace(/fala(-me| me)? sobre/gi, '')
    .replace(/quero saber sobre/gi, '')
    .replace(/conta(-me| me)? (sobre|de|da)?/gi, '')
    .replace(/biografia de/gi, '')
    .replace(/historia de/gi, '')
    .replace(/história de/gi, '')
    .replace(/informação sobre/gi, '')
    .replace(/info sobre/gi, '')
    .replace(/detalhes sobre/gi, '')
    .replace(/[?!.]/g, '')
    .trim();

  // Direct exact match
  if (biografiasData[cleanQuery]) {
    return [biografiasData[cleanQuery]];
  }

  // Partial matching with all key terms
  const results = [];
  const searchParts = cleanQuery.split(/\s+/).filter(p => p.length > 0);

  Object.entries(biografiasData).forEach(([key, value]) => {
    // Check if key contains most of the search parts
    let matchCount = 0;
    searchParts.forEach(part => {
      if (key.includes(part)) matchCount++;
    });

    // At least 50% of search parts must match
    if (matchCount >= searchParts.length * 0.5) {
      results.push(value);
    }
  });

  return results;
}

module.exports = {
  searchBiografias,
  biografiasData,
};
