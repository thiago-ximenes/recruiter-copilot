import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { authConfigured, isValidToken, sessionToken } from "@/lib/auth";

const ORIG = { ...process.env };

afterEach(() => {
  process.env = { ...ORIG };
});

describe("auth", () => {
  beforeEach(() => {
    delete process.env.ADMIN_PASSWORD;
    delete process.env.ADMIN_SESSION_SECRET;
  });

  it("is unconfigured without env, and treats any request as valid (dev)", async () => {
    expect(authConfigured()).toBe(false);
    expect(await isValidToken(undefined)).toBe(true);
  });

  it("is configured when both vars are set", () => {
    process.env.ADMIN_PASSWORD = "x";
    process.env.ADMIN_SESSION_SECRET = "s3cr3t";
    expect(authConfigured()).toBe(true);
  });

  it("accepts a correctly signed token and rejects others", async () => {
    process.env.ADMIN_PASSWORD = "x";
    process.env.ADMIN_SESSION_SECRET = "s3cr3t";
    const token = await sessionToken();
    expect(await isValidToken(token)).toBe(true);
    expect(await isValidToken("forged")).toBe(false);
    expect(await isValidToken(undefined)).toBe(false);
  });

  it("changes the token when the secret changes", async () => {
    process.env.ADMIN_PASSWORD = "x";
    process.env.ADMIN_SESSION_SECRET = "secret-a";
    const a = await sessionToken();
    process.env.ADMIN_SESSION_SECRET = "secret-b";
    const b = await sessionToken();
    expect(a).not.toBe(b);
  });
});
