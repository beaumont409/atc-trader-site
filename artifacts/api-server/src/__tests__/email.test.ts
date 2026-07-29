import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Smoke tests for sendLeadEmail.
 *
 * Key invariant: when nodemailer.sendMail succeeds, the function MUST log
 * "Lead email sent" — that string is the signal used by post-deploy health
 * checks and dashboards to confirm email delivery is alive.
 */

// Hoist the sendMail stub so the vi.mock factory can close over it.
const mockSendMail = vi.hoisted(() => vi.fn().mockResolvedValue({}));

vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({ sendMail: mockSendMail })),
  },
}));

vi.mock("../lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const sampleLead = {
  name: "Test Lead",
  phone: "512-555-0199",
  location: "Austin, TX",
  year: "2003",
  model: "Honda TRX 450R",
  condition: "Good",
  askingPrice: "$2500",
  notes: "Smoke-test submission — not a real lead",
};

describe("sendLeadEmail", () => {
  beforeEach(() => {
    // Reset module registry so each test re-evaluates the top-level
    // transporter initialization with fresh env stubs.
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("returns false and logs a warning when GMAIL_ADDRESS is not set", async () => {
    vi.stubEnv("GMAIL_ADDRESS", "");
    vi.stubEnv("GMAIL_APP_PASSWORD", "some-password");

    const { sendLeadEmail } = await import("../lib/email");
    const { logger } = await import("../lib/logger");

    const result = await sendLeadEmail(sampleLead);

    expect(result).toBe(false);
    expect(logger.warn).toHaveBeenCalled();
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it("returns false and logs a warning when GMAIL_APP_PASSWORD is not set", async () => {
    vi.stubEnv("GMAIL_ADDRESS", "owner@gmail.com");
    vi.stubEnv("GMAIL_APP_PASSWORD", "");

    const { sendLeadEmail } = await import("../lib/email");
    const { logger } = await import("../lib/logger");

    const result = await sendLeadEmail(sampleLead);

    expect(result).toBe(false);
    expect(logger.warn).toHaveBeenCalled();
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it('logs "Lead email sent" and returns true when sendMail succeeds', async () => {
    vi.stubEnv("GMAIL_ADDRESS", "owner@gmail.com");
    vi.stubEnv("GMAIL_APP_PASSWORD", "app-password-abc");

    mockSendMail.mockResolvedValueOnce({});

    const { sendLeadEmail } = await import("../lib/email");
    const { logger } = await import("../lib/logger");

    const result = await sendLeadEmail(sampleLead);

    expect(result).toBe(true);
    // This specific log message is the signal used by post-deploy smoke tests
    // and dashboards. If this assertion fails, the observable contract has changed.
    expect(logger.info).toHaveBeenCalledWith("Lead email sent");
  });

  it("sends to the configured GMAIL_ADDRESS with the correct subject format", async () => {
    vi.stubEnv("GMAIL_ADDRESS", "owner@gmail.com");
    vi.stubEnv("GMAIL_APP_PASSWORD", "app-password-abc");

    mockSendMail.mockResolvedValueOnce({});

    const { sendLeadEmail } = await import("../lib/email");
    await sendLeadEmail(sampleLead);

    expect(mockSendMail).toHaveBeenCalledOnce();
    const [mailOptions] = mockSendMail.mock.calls[0];
    expect(mailOptions.to).toBe("owner@gmail.com");
    expect(mailOptions.subject).toContain(sampleLead.year);
    expect(mailOptions.subject).toContain(sampleLead.model);
    expect(mailOptions.subject).toContain(sampleLead.name);
  });

  it("returns false and logs an error when sendMail throws, without re-throwing", async () => {
    vi.stubEnv("GMAIL_ADDRESS", "owner@gmail.com");
    vi.stubEnv("GMAIL_APP_PASSWORD", "app-password-abc");

    mockSendMail.mockRejectedValueOnce(new Error("SMTP connection refused"));

    const { sendLeadEmail } = await import("../lib/email");
    const { logger } = await import("../lib/logger");

    const result = await sendLeadEmail(sampleLead);

    expect(result).toBe(false);
    expect(logger.error).toHaveBeenCalled();
    // Must NOT re-throw — a broken SMTP server should not crash the API
    // (the leads route handles `emailed === false` gracefully)
  });
});
