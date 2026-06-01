import { Router, type IRouter } from "express";
import { sendTelegramMessageEmail } from "../lib/email";
import { sendLeadToTelegram } from "../lib/telegram";

const router: IRouter = Router();

router.post("/telegram-webhook", async (req, res): Promise<void> => {
  const update = req.body;

  const message = update?.message;
  if (!message || !message.text) {
    res.sendStatus(200);
    return;
  }

  const from = message.from?.first_name
    ? `${message.from.first_name}${message.from.last_name ? " " + message.from.last_name : ""}`
    : "Unknown";
  const username = message.from?.username;
  const text: string = message.text;
  const date: number = message.date;
  const chatId: number = message.chat?.id;

  req.log.info({ from, chatId }, "Telegram webhook message received");

  // Forward the message to Gmail
  await sendTelegramMessageEmail({ from, username, text, date });

  // Auto-reply to the sender so they know you got it
  const ownerChatId = process.env.TELEGRAM_OWNER_CHAT_ID
    ? parseInt(process.env.TELEGRAM_OWNER_CHAT_ID, 10)
    : null;

  if (ownerChatId && chatId !== ownerChatId) {
    try {
      const token = process.env.TELEGRAM_BOT_TOKEN;
      if (token) {
        const replyText = "Thanks for reaching out! I'll get back to you shortly about your Honda 250R.";
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text: replyText }),
        });
      }
    } catch (err) {
      req.log.warn({ err }, "Failed to send auto-reply");
    }
  }

  res.sendStatus(200);
});

export default router;
