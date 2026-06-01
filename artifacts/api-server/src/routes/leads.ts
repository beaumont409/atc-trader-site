import { Router, type IRouter } from "express";
import { db, leadsTable } from "@workspace/db";
import { SubmitLeadBody } from "@workspace/api-zod";
import { sendLeadToTelegram } from "../lib/telegram";

const router: IRouter = Router();

router.post("/leads", async (req, res): Promise<void> => {
  const parsed = SubmitLeadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, phone, location, year, model, condition, askingPrice, notes } = parsed.data;

  const [lead] = await db
    .insert(leadsTable)
    .values({
      name,
      phone,
      location,
      year,
      model,
      condition,
      askingPrice: askingPrice ?? null,
      notes: notes ?? null,
    })
    .returning();

  req.log.info({ leadId: lead.id }, "Lead saved to database");

  const sent = await sendLeadToTelegram({
    name,
    phone,
    location,
    year,
    model,
    condition,
    askingPrice,
    notes,
  });

  if (!sent) {
    req.log.warn({ leadId: lead.id }, "Lead saved but Telegram notification failed");
  }

  res.status(201).json({
    success: true,
    message: "Thanks! We'll be in touch soon.",
  });
});

export default router;
