const cheerio = require('cheerio');

/**
 * Convert html page with lyrics to plain format
 * @param {string} content
 * @return {string}
 */
module.exports.getLyrics = function(content) {
  const $ = cheerio.load(content);
  let lyrics = '';
  $('div[class^="Lyrics__Container"]').each((i, elem) => {
    if ($(elem).text().length !== 0) {
      const snippet = $(elem)
          .html()
          .replace(/<br>/g, '\n')
          .replace(/<(?!\s*br\s*\/?)[^>]+>/gi, '');

      lyrics += $('<textarea/>').html(snippet).text().trim() + '\n\n';
    }
  });
  return lyrics;
};

const PUNCTUATION_REGEX = new RegExp(/[\p{P}$+<=>^`|~—]+/, 'gu');
const SPACE_REGEX = new RegExp(/\s+/, 'g');

/**
 * Replace all punctuation symbols and converted to lower case.
 * @param {string} str
 * @return {string}
 */
function sanitizeString(str) {
  return str
      .replace(PUNCTUATION_REGEX, '')
      .replace(SPACE_REGEX, ' ')
      .toLocaleLowerCase().trim();
}
module.exports.sanitizeString = sanitizeString;

/**
 * Convert plain lyrics to rows
 * @param {string} lyrics
 * @return {Array<{row: string, sanitizeRow: string, index: number}>}
 */
module.exports.getLyricsRows = function(lyrics) {
  return lyrics.split('\n').filter((row) => {
    const isEmpty = row.length === 0;
    const isTitle = row.startsWith('[');
    return !isEmpty && !isTitle;
  }).reduce((acc, row, index) => {
    const sanitizeRow = sanitizeString(row);
    acc.push({row, sanitizeRow, index});
    return acc;
  }, []);
};
