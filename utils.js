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
