import { config } from "dotenv";
import express from "express";
import TelegramBot from "node-telegram-bot-api";

config();

const token = process.env.TELEGRAM_API_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const app = express();
let referrer = null;
let userId = null;

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

const sendStartMessage = (chatId) => {
  const resp =
    'Привет! Покажи максимум ловкости в игре от Банка Уралсиб и получи до 1000 бонусных рублей на дебетовую карту "Прибыль"';
  bot.sendMessage(chatId, resp, game);
};

const game = {
  disable_web_page_preview: false,
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [
        {
          text: "Играть",
          web_app: { url: "https://server.bulochkin.site" },
        },
      ],
    ],
  }),
};

const noSubscribe = {
  parse_mode: "markdown",
  disable_web_page_preview: false,
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [
        { text: "Открыть канал", url: "https://t.me/test_pari_chanel" },
        { text: "Проверить подписку", callback_data: "01" },
      ],
    ],
  }),
};

const isSubscribedToTheChannel = async (userId) => {
  try {
    let response = await bot.getChatMember(-1001780461970, userId);
    return response.status !== "left";
  } catch (err) {
    return false;
  }
};

bot.onText(/\/start/, async (msg, match) => {
  const chatId = msg.chat.id;

  const isSubscribe = await isSubscribedToTheChannel(msg.from.id);

  if (isSubscribe) {
    sendStartMessage(chatId);
  } else {
    const resp = "Чтобы начать игру, подпишись на канал ";

    bot.sendMessage(
      chatId,
      resp + "[Банка Уралсиб](https://t.me/test_pari_chanel)" + " в Telegram.",
      noSubscribe
    );
  }
});

bot.on("callback_query", async (msg) => {
  const isSubscribe = await isSubscribedToTheChannel(msg.from.id);

  if (msg.data == "01") {
    if (isSubscribe) {
      sendStartMessage(msg.from.id);
    } else {
      const resp = "Чтобы начать игру, подпишись на канал ";

      bot.sendMessage(
        chatId,
        resp +
          "[Банка Уралсиб](https://t.me/test_pari_chanel)" +
          " в Telegram.",
        noSubscribe
      );
    }
  }
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;

  if (msg.text === "/start") {
    return;
  }

  const isSubscribe = await isSubscribedToTheChannel(msg.from.id);
  if (!isSubscribe) {
    const resp = "Чтобы начать игру, подпишись на канал ";

    bot.sendMessage(
      chatId,
      resp + "[Банка Уралсиб](https://t.me/test_pari_chanel)" + " в Telegram.",
      noSubscribe
    );
  } else {
    const resp = "Чтобы перейти к игре, нажми кнопку «Играть»";
    bot.sendMessage(chatId, resp, game);
  }
});

const PORT = process.env.PORT || 8443;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
