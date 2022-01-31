const {Telegraf} = require('telegraf');
const axios = require('axios').default;
const {getLyrics, getLyricsRows, sanitizeString} = require('./utils.js');

const {
  GOOGLE_CLOUD_PROJECT_ID,
  GOOGLE_CLOUD_REGION,
  TELEGRAM_BOT_TOKEN,
  GENIUS_TOKEN,
} = process.env;

const getGeniusURL = (url) => `https://api.genius.com/${url}`;
const NOT_FOUND_MESSAGE = 'I didn\'t find it 😞';

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

bot.start((ctx) =>
  ctx.reply(
      'Welcome to the Music Singer Bot!\n' +
      'You can send string of your favorite song and i return you next.\n' +
      'I can work with all languages of the world 🌎'),
);
bot.help((ctx) =>
  ctx.reply('Just send me string of favorite song and i return you next.'),
);
bot.on('text', async (ctx) => {
  const message = sanitizeString(ctx.message.text);
  const search = await axios.get(
      getGeniusURL(`search?q=${encodeURI(message)}`),
      {headers: {Authorization: `Bearer ${GENIUS_TOKEN}`}},
  );

  const {url} = search.data.response.hits[0].result;
  const page = await axios.get(url);

  const lyrics = getLyrics(page.data);
  const lyricsRows = getLyricsRows(lyrics);

  const targetRow = lyricsRows
      .find((row) => row.sanitizeRow.indexOf(message) !== -1);

  if (targetRow === undefined) {
    console.log('ctx.message.text: ', ctx.message.text);
    console.log('answer: ', NOT_FOUND_MESSAGE);

    ctx.reply(NOT_FOUND_MESSAGE);
    return;
  }

  const nextRow = lyricsRows[targetRow.index + 1];
  if (nextRow === undefined) {
    console.log('ctx.message.text: ', ctx.message.text);
    console.log('answer: ', NOT_FOUND_MESSAGE);

    ctx.reply(NOT_FOUND_MESSAGE);
    return;
  }

  const answer = nextRow.row;

  console.log('ctx.message.text: ', ctx.message.text);
  console.log('answer: ', answer);

  ctx.reply(answer);
});
bot.on('message', (ctx) => ctx.reply('Command not recognized'));

bot.telegram.setWebhook(
    `https://${GOOGLE_CLOUD_REGION}-${GOOGLE_CLOUD_PROJECT_ID}.cloudfunctions.net/${process.env.FUNCTION_TARGET}`,
);

module.exports = bot;
