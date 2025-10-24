/**
 * Biography data loader for Netlify Functions
 * Loads from pre-compiled JSON file that is guaranteed to exist
 */

const path = require('path');
let biografiasData = {};

try {
  // Load compiled biography data
  const compiledPath = path.join(__dirname, 'biografiasCompiled.json');
  console.log('[LOADER] Loading from:', compiledPath);

  const rawData = require('./biografiasCompiled.json');
  biografiasData = rawData;

  console.log(`[LOADER] ✓ Loaded ${Object.keys(biografiasData).length} biographies from compiled JSON`);
} catch (err) {
  console.error('[LOADER] Error loading biography data:', err.message);
  console.error('[LOADER] Stack:', err.stack);
}

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

  console.log(`[SEARCH] Query: "${query}" -> Cleaned: "${cleanQuery}"`);

  // Direct exact match
  if (biografiasData[cleanQuery]) {
    console.log(`[SEARCH] Found exact match: ${cleanQuery}`);
    return [biografiasData[cleanQuery]];
  }

  // Partial matching with all key terms
  const results = [];
  const searchParts = cleanQuery.split(/\s+/).filter(p => p.length > 0);

  console.log(`[SEARCH] Searching with parts:`, searchParts);

  Object.entries(biografiasData).forEach(([key, value]) => {
    // Check if key contains most of the search parts
    let matchCount = 0;
    searchParts.forEach(part => {
      if (key.includes(part)) matchCount++;
    });

    // At least 50% of search parts must match
    if (matchCount >= searchParts.length * 0.5) {
      console.log(`[SEARCH] Partial match: ${key} (${matchCount}/${searchParts.length} parts)`);
      results.push(value);
    }
  });

  console.log(`[SEARCH] Total results: ${results.length}`);
  return results;
}

module.exports = {
  searchBiografias,
  biografiasData,
  getDataStats: () => ({
    totalBiographies: Object.keys(biografiasData).length,
    sampleKeys: Object.keys(biografiasData).slice(0, 10),
  }),
};
