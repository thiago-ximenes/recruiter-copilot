import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { notifyEnabled, notifyThiago } from "@/lib/tools/notify";

const ORIG = { ...process.env };

afterEach(() => {
  process.env = { ...ORIG };
  vi.restoreAllMocks();
});

describe("notify", () => {
  beforeEach(() => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_CHAT_ID;
  });

  it("is disabled and no-ops without credentials", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    expect(notifyEnabled()).toBe(false);
    expect(await notifyThiago("oi")).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("posts to the Telegram API when configured", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "tok";
    process.env.TELEGRAM_CHAT_ID = "42";
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("{}", { status: 200 }));
    expect(await notifyThiago("novo lead")).toBe(true);
    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0];
    expect(String(url)).toContain("/bottok/sendMessage");
    expect(JSON.parse((init as RequestInit).body as string)).toMatchObject({
      chat_id: "42",
      text: "novo lead",
    });
  });

  it("returns false on a Telegram error response", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "tok";
    process.env.TELEGRAM_CHAT_ID = "42";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("nope", { status: 400 }));
    expect(await notifyThiago("x")).toBe(false);
  });
});
