const Fuse = require('fuse.js');
const bibleData = require('./bible-data.json');

// Create a list of all valid Bible references
const bibleReferences = [];
for (const book in bibleData) {
  for (const chapter in bibleData[book]) {
    for (const verse in bibleData[book][chapter]) {
      bibleReferences.push({ reference: `${book} ${chapter}:${verse}` });
    }
  }
}

const fuseOptions = {
  keys: ['reference'],
  includeScore: true,
  threshold: 0.1, // Lower threshold for stricter matching
  distance: 10, // Reduce the distance to consider fewer differences
  minMatchCharLength: 3, // Require at least 3 characters to match
  shouldSort: true,
  tokenize: true,
  matchAllTokens: true, // Require all tokens to match
  findAllMatches: false,
  location: 0,
  ignoreLocation: false,
};

const fuse = new Fuse(bibleReferences, fuseOptions);

function nkjv(reference) {
  const normalizedRef = normalizeReference(reference);
  const result = fuse.search(normalizedRef);
  
  if (result.length === 0) {
    throw new Error('Reference not found');
  }

  const bestMatch = result[0].item.reference;
  const [book, chapterVerse] = bestMatch.split(' ');
  const [chapter, verse] = chapterVerse.split(':');

  if (!bibleData[book] || !bibleData[book][chapter] || !bibleData[book][chapter][verse]) {
    throw new Error('Verse not found');
  }

  return {
    reference: bestMatch,
    text: bibleData[book][chapter][verse]
  };
}

function normalizeReference(ref) {
  // Convert common abbreviations and handle formatting
  return ref.replace(/(\d+)(\w+)/, '$1 $2')  // Separate numbers and letters
            .replace(/(\d+):(\d+)/, '$1:$2') // Ensure proper chapter:verse format
            .replace(/\s+/g, ' ')            // Normalize spaces
            .trim();
}

module.exports = nkjv;