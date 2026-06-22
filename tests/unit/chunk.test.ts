import { describe, expect, it } from "vitest";
import { chunkMarkdown } from "@/lib/kb/chunk";

describe("chunkMarkdown", () => {
  it("returns empty for blank input", () => {
    expect(chunkMarkdown("")).toEqual([]);
    expect(chunkMarkdown("   \n  ")).toEqual([]);
  });

  it("splits by heading and keeps the heading as prefix", () => {
    const chunks = chunkMarkdown("## Identidade\nlinha um\n\n## Skills\nlinha dois");
    expect(chunks).toHaveLength(2);
    expect(chunks[0]).toContain("## Identidade");
    expect(chunks[0]).toContain("linha um");
    expect(chunks[1]).toContain("## Skills");
    expect(chunks[1]).toContain("linha dois");
  });

  it("respects the max size within a section", () => {
    const long = Array.from({ length: 50 }, (_, i) => `linha ${i} com algum texto`).join("\n");
    const chunks = chunkMarkdown(`## Grande\n${long}`, 200);
    expect(chunks.length).toBeGreaterThan(1);
    for (const c of chunks) expect(c.length).toBeLessThanOrEqual(260);
  });

  it("carries the heading into every chunk of a long section", () => {
    const long = Array.from({ length: 30 }, (_, i) => `fato ${i}`).join("\n");
    const chunks = chunkMarkdown(`# Perfil\n${long}`, 80);
    expect(chunks.every((c) => c.startsWith("# Perfil"))).toBe(true);
  });
});
