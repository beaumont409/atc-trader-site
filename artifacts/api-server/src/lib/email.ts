import nodemailer from "nodemailer";
import { logger } from "./logger";

const gmailAddress = process.env.GMAIL_ADDRESS;
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

let transporter: nodemailer.Transporter | null = null;

if (gmailAddress && gmailAppPassword) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailAddress,
      pass: gmailAppPassword,
    },
  });
  logger.info("Gmail transporter initialized");
} else {
  logger.warn("GMAIL_ADDRESS or GMAIL_APP_PASSWORD not set — email notifications disabled");
}

export async function sendLeadEmail(data: {
  name: string;
  phone: string;
  location: string;
  year: string;
  model: string;
  condition: string;
  askingPrice?: string | null;
  notes?: string | null;
}): Promise<boolean> {
  if (!transporter || !gmailAddress) {
    logger.warn("Email not configured — skipping lead email");
    return false;
  }

  const html = `
    <h2 style="color:#c2410c;">🏍️ New ATV Lead!</h2>
    <table style="border-collapse:collapse;font-family:sans-serif;font-size:15px;">
      <tr><td style="padding:6px 16px 6px 0;font-weight:bold;">Name</td><td>${data.name}</td></tr>
      <tr><td style="padding:6px 16px 6px 0;font-weight:bold;">Phone</td><td>${data.phone}</td></tr>
      <tr><td style="padding:6px 16px 6px 0;font-weight:bold;">Location</td><td>${data.location}</td></tr>
      <tr><td style="padding:6px 16px 6px 0;font-weight:bold;">Year</td><td>${data.year}</td></tr>
      <tr><td style="padding:6px 16px 6px 0;font-weight:bold;">Model</td><td>${data.model}</td></tr>
      <tr><td style="padding:6px 16px 6px 0;font-weight:bold;">Condition</td><td>${data.condition}</td></tr>
      <tr><td style="padding:6px 16px 6px 0;font-weight:bold;">Asking Price</td><td>${data.askingPrice || "Not specified"}</td></tr>
      ${data.notes ? `<tr><td style="padding:6px 16px 6px 0;font-weight:bold;">Notes</td><td>${data.notes}</td></tr>` : ""}
    </table>
  `;

  try {
    await transporter.sendMail({
      from: `"ATV Buyer Site" <${gmailAddress}>`,
      to: gmailAddress,
      subject: `New ATV Lead: ${data.year} ${data.model} — ${data.name}`,
      html,
    });
    logger.info("Lead email sent");
    return true;
  } catch (err) {
    logger.error({ err }, "Failed to send lead email");
    return false;
  }
}

export async function sendTelegramMessageEmail(data: {
  from: string;
  username?: string;
  text: string;
  date: number;
}): Promise<boolean> {
  if (!transporter || !gmailAddress) {
    logger.warn("Email not configured — skipping Telegram message email");
    return false;
  }

  const dateStr = new Date(data.date * 1000).toLocaleString("en-US", { timeZone: "America/Chicago" });

  const html = `
    <h2 style="color:#c2410c;">💬 New Telegram Message</h2>
    <table style="border-collapse:collapse;font-family:sans-serif;font-size:15px;">
      <tr><td style="padding:6px 16px 6px 0;font-weight:bold;">From</td><td>${data.from}${data.username ? ` (@${data.username})` : ""}</td></tr>
      <tr><td style="padding:6px 16px 6px 0;font-weight:bold;">Time</td><td>${dateStr} (CT)</td></tr>
      <tr><td style="padding:6px 16px 6px 0;font-weight:bold;">Message</td><td>${data.text}</td></tr>
    </table>
    <p style="font-size:13px;color:#888;margin-top:16px;">Reply directly to this person on Telegram: @Honda250rBot</p>
  `;

  try {
    await transporter.sendMail({
      from: `"ATV Buyer Bot" <${gmailAddress}>`,
      to: gmailAddress,
      subject: `Telegram message from ${data.from}: "${data.text.slice(0, 60)}"`,
      html,
    });
    logger.info({ from: data.from }, "Telegram message email forwarded");
    return true;
  } catch (err) {
    logger.error({ err }, "Failed to send Telegram message email");
    return false;
  }
}
