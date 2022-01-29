const bot = require('./bot.js');

exports.telegramBotWebhook = (req, res) => {
  bot.handleUpdate(req.body, res);
};
