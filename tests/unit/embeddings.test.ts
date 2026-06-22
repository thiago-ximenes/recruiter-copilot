import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { EMBEDDING_DIMENSIONS, embeddingsEnabled } from "@/lib/llm/embeddings";

const ORIG = { ...process.env };

afterEach(() => {
  process.env = { ...ORIG };
});

describe("embeddings", () => {
  beforeEach(() => {
    delete process.env.EMBEDDING_PROVIDER;
    delete process.env.GEMINI_API_KEY;
  });

  it("exposes the expected dimensionality", () => {
    expect(EMBEDDING_DIMENSIONS).toBe(768);
  });

  it("is disabled without a key", () => {
    expect(embeddingsEnabled()).toBe(false);
  });

  it("is enabled with the gemini key (default provider)", () => {
    process.env.GEMINI_API_KEY = "k";
    expect(embeddingsEnabled()).toBe(true);
  });

  it("is disabled for an unknown provider", () => {
    process.env.EMBEDDING_PROVIDER = "acme";
    process.env.GEMINI_API_KEY = "k";
    expect(embeddingsEnabled()).toBe(false);
  });
});
