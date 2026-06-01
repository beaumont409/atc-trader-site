import TelegramBot from "node-telegram-bot-api";
import { logger } from "./logger";

const token = process.env.TELEGRAM_BOT_TOKEN;
const ownerChatId = process.env.TELEGRAM_OWNER_CHAT_ID
  ? parseInt(process.env.TELEGRAM_OWNER_CHAT_ID, 10)
  : null;

let bot: TelegramBot | null = null;

if (token) {
  bot = new TelegramBot(token);
  logger.info("Telegram bot initialized");
} else {
  logger.warn("TELEGRAM_BOT_TOKEN not set — Telegram notifications disabled");
}

if (!ownerChatId) {
  logger.warn("TELEGRAM_OWNER_CHAT_ID not set — Telegram notifications disabled");
}

export async function sendLeadToTelegram(data: {
  name: string;
  phone: string;
  location: string;
  year: string;
  model: string;
  condition: string;
  askingPrice?: string | null;
  notes?: string | null;
}): Promise<boolean> {
  if (!bot) {
    logger.warn("No Telegram bot configured — skipping notification");
    return false;
  }

  if (!ownerChatId) {
    logger.error("TELEGRAM_OWNER_CHAT_ID not set — cannot send notification");
    return false;
  }

  const lines = [
    `🏍️ *New ATV Lead!*`,
    ``,
    `*Name:* ${data.name}`,
    `*Phone:* ${data.phone}`,
    `*Location:* ${data.location}`,
    `*Year:* ${data.year}`,
    `*Model:* ${data.model}`,
    `*Condition:* ${data.condition}`,
    data.askingPrice ? `*Asking Price:* ${data.askingPrice}` : `*Asking Price:* Not specified`,
    data.notes ? `*Notes:* ${data.notes}` : null,
  ].filter(Boolean).join("\n");

  try {
    await bot.sendMessage(ownerChatId, lines, { parse_mode: "Markdown" });
    logger.info({ chatId: ownerChatId }, "Telegram lead notification sent");
    return true;
  } catch (err) {
    logger.error({ err, chatId: ownerChatId }, "Failed to send Telegram message");
    return false;
  }
}
