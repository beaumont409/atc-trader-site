import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

// Mock pino-http before app imports so the middleware doesn't crash in tests
vi.mock("pino-http", () => ({
  default: () => (req: any, _res: any, next: any) => {
    req.log = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    next();
  },
}));

vi.mock("@workspace/db", () => ({
  db: { insert: vi.fn() },
  leadsTable: {},
}));

vi.mock("../lib/email", () => ({
  sendLeadEmail: vi.fn().mockResolvedValue(true),
}));

vi.mock("../lib/telegram", () => ({
  sendLeadToTelegram: vi.fn().mockResolvedValue(true),
}));

import app from "../app";
import { db } from "@workspace/db";
import { sendLeadToTelegram } from "../lib/telegram";

const validLead = {
  name: "John Smith",
  phone: "512-555-0100",
  location: "Dallas, TX",
  year: "1986",
  model: "TRX 250R",
  condition: "Excellent",
  askingPrice: "$6000",
  notes: "Low hours",
};

const savedLead = { id: "lead-abc-123", ...validLead };

function setupDbMock() {
  const returningMock = vi.fn().mockResolvedValue([savedLead]);
  const valuesMock = vi.fn().mockReturnValue({ returning: returningMock });
  (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({ values: valuesMock });
}

describe("POST /api/leads — Telegram integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupDbMock();
  });

  it("calls sendLeadToTelegram with the correct lead fields", async () => {
    const res = await request(app).post("/api/leads").send(validLead);

    expect(res.status).toBe(201);
    expect(sendLeadToTelegram).toHaveBeenCalledOnce();
    expect(sendLeadToTelegram).toHaveBeenCalledWith(
      expect.objectContaining({
        name: validLead.name,
        phone: validLead.phone,
        location: validLead.location,
        year: validLead.year,
        model: validLead.model,
        condition: validLead.condition,
        askingPrice: validLead.askingPrice,
        notes: validLead.notes,
      }),
    );
  });

  it("returns HTTP 201 even when sendLeadToTelegram returns false (soft failure)", async () => {
    (sendLeadToTelegram as ReturnType<typeof vi.fn>).mockResolvedValue(false);

    const res = await request(app).post("/api/leads").send(validLead);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it("returns HTTP 201 even when sendLeadToTelegram throws an unexpected error", async () => {
    (sendLeadToTelegram as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Telegram API unreachable"),
    );

    const res = await request(app).post("/api/leads").send(validLead);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it("returns HTTP 400 for an invalid request body without calling Telegram", async () => {
    const res = await request(app)
      .post("/api/leads")
      .send({ name: "Only Name" });

    expect(res.status).toBe(400);
    expect(sendLeadToTelegram).not.toHaveBeenCalled();
  });
});
