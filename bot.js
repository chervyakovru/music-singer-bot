const {Telegraf} = require('telegraf');
const axios = require('axios').default;
const {getLyrics} = require('./utils.js');

const {
  GOOGLE_CLOUD_PROJECT_ID,
  GOOGLE_CLOUD_REGION,
  TELEGRAM_BOT_TOKEN,
  GENIUS_TOKEN,
} = process.env;

const getGeniusURL = (url) => `https://api.genius.com/${url}`;
const STRING_REGEX = new RegExp(/^\p{Letter}+.*$/, 'gmu');
const NOT_FOUND_MESSAGE = 'I didn\'t find it 😞';

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

bot.start((ctx) =>
  ctx.reply(
      'Welcome to the Music Singer Bot!' +
      'you can send string of your favorite song and i return you next'),
);
bot.help((ctx) =>
  ctx.reply('Just send me string of favorite song and i return you next'),
);
bot.on('text', async (ctx) => {
  const message = ctx.message.text.toLocaleLowerCase().trim();
  const search = await axios.get(
      getGeniusURL(`search?q=${encodeURI(message)}`),
      {
        headers: {Authorization: `Bearer ${GENIUS_TOKEN}`},
      },
  );

  const {url} = search.data.response.hits[0].result;
  const page = await axios.get(url);

  const lyrics = getLyrics(page.data);

  const lowerCaseLyrics = lyrics.toLocaleLowerCase();
  const indexOfMessage = lowerCaseLyrics.indexOf(message);
  if (indexOfMessage === -1) {
    ctx.reply(NOT_FOUND_MESSAGE);
    return;
  }

  const matchNextString = lyrics
      .substring(indexOfMessage + message.length)
      .match(STRING_REGEX);
  if (matchNextString === null) {
    ctx.reply(NOT_FOUND_MESSAGE);
    return;
  }

  const answer = matchNextString[0].trim();

  console.log('lyrics: ', lyrics);
  console.log('==========');
  console.log('ctx.message.text: ', ctx.message.text);
  console.log('answer: ', answer);

  ctx.reply(answer);
});
bot.on('message', (ctx) => ctx.reply('Command not recognized'));

bot.telegram.setWebhook(
    `https://${GOOGLE_CLOUD_REGION}-${GOOGLE_CLOUD_PROJECT_ID}.cloudfunctions.net/${process.env.FUNCTION_TARGET}`,
);

module.exports = bot;
