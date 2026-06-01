import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // Register Telegram webhook so direct bot messages get forwarded to Gmail
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const domains = process.env.REPLIT_DOMAINS;
  if (token && domains) {
    const primaryDomain = domains.split(",")[0].trim();
    const webhookUrl = `https://${primaryDomain}/api/telegram-webhook`;
    fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: webhookUrl }),
    })
      .then((r) => r.json())
      .then((data) => logger.info({ webhookUrl, data }, "Telegram webhook registered"))
      .catch((err) => logger.error({ err }, "Failed to register Telegram webhook"));
  }
});
