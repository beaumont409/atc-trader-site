import { describe, it, expect, vi, beforeEach } from "vitest";

// Shared sendMessage mock, available inside the vi.mock factory via vi.hoisted
const mockSendMessage = vi.hoisted(() => vi.fn().mockResolvedValue({}));

// Mock node-telegram-bot-api with a proper class constructor
vi.mock("node-telegram-bot-api", () => ({
  default: class MockTelegramBot {
    sendMessage = mockSendMessage;
  },
}));

// Mock logger to capture warnings/errors without pino-pretty transport
vi.mock("../lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const sampleLead = {
  name: "Jane Doe",
  phone: "555-1234",
  location: "Austin, TX",
  year: "2022",
  model: "Yamaha Grizzly",
  condition: "Good",
  askingPrice: "$4500",
  notes: "Runs great",
};

describe("sendLeadToTelegram", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("returns false and logs a warning when TELEGRAM_BOT_TOKEN is not set", async () => {
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "");
    vi.stubEnv("TELEGRAM_OWNER_CHAT_ID", "12345");

    const { sendLeadToTelegram } = await import("../lib/telegram");
    const { logger } = await import("../lib/logger");

    const result = await sendLeadToTelegram(sampleLead);

    expect(result).toBe(false);
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining("No Telegram bot configured"),
    );
  });

  it("returns false and logs an error when TELEGRAM_OWNER_CHAT_ID is not set", async () => {
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "fake-token");
    vi.stubEnv("TELEGRAM_OWNER_CHAT_ID", "");

    const { sendLeadToTelegram } = await import("../lib/telegram");
    const { logger } = await import("../lib/logger");

    const result = await sendLeadToTelegram(sampleLead);

    expect(result).toBe(false);
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("TELEGRAM_OWNER_CHAT_ID not set"),
    );
  });

  it("returns true and sends a message with correct content on the happy path", async () => {
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "fake-token");
    vi.stubEnv("TELEGRAM_OWNER_CHAT_ID", "99999");

    mockSendMessage.mockResolvedValue({});

    const { sendLeadToTelegram } = await import("../lib/telegram");

    const result = await sendLeadToTelegram(sampleLead);

    expect(result).toBe(true);
    expect(mockSendMessage).toHaveBeenCalledOnce();
    const [chatId, text] = mockSendMessage.mock.calls[0];
    expect(chatId).toBe(99999);
    expect(text).toContain("Jane Doe");
    expect(text).toContain("555-1234");
    expect(text).toContain("Yamaha Grizzly");
  });

  it("returns false when sendMessage throws, without re-throwing", async () => {
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "fake-token");
    vi.stubEnv("TELEGRAM_OWNER_CHAT_ID", "99999");

    mockSendMessage.mockRejectedValue(new Error("network error"));

    const { sendLeadToTelegram } = await import("../lib/telegram");
    const { logger } = await import("../lib/logger");

    const result = await sendLeadToTelegram(sampleLead);

    expect(result).toBe(false);
    expect(logger.error).toHaveBeenCalled();
  });
});
