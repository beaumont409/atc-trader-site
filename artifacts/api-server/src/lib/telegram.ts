import TelegramBot from "node-telegram-bot-api";
import { logger } from "./logger";

const token = process.env.TELEGRAM_BOT_TOKEN;

let bot: TelegramBot | null = null;

if (token) {
  bot = new TelegramBot(token);
} else {
  logger.warn("TELEGRAM_BOT_TOKEN not set — Telegram notifications disabled");
}

const OWNER_USERNAME = "@Texasmade48";

export async function resolveOwnerchatId(): Promise<number | null> {
  if (!bot) return null;
  try {
    const updates = await bot.getUpdates({ limit: 100, timeout: 0 });
    for (const update of updates) {
      const msg = update.message;
      if (msg?.from?.username?.toLowerCase() === "texasmade48") {
        return msg.from.id;
      }
    }
    logger.warn({ username: OWNER_USERNAME }, "Could not find chat ID for owner from recent updates");
    return null;
  } catch (err) {
    logger.error({ err }, "Failed to fetch Telegram updates");
    return null;
  }
}

let cachedChatId: number | null = null;

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

  if (!cachedChatId) {
    cachedChatId = await resolveOwnerchatId();
  }

  if (!cachedChatId) {
    logger.error("Cannot send Telegram message — owner chat ID unknown. Make sure @Texasmade48 has sent the bot a message first.");
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
    await bot.sendMessage(cachedChatId, lines, { parse_mode: "Markdown" });
    logger.info({ chatId: cachedChatId }, "Telegram lead notification sent");
    return true;
  } catch (err) {
    logger.error({ err, chatId: cachedChatId }, "Failed to send Telegram message");
    return false;
  }
}
