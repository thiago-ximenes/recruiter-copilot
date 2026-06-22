import { describe, expect, it } from "vitest";
import { parseJson } from "@/lib/agents/json";

describe("parseJson", () => {
  it("parses plain JSON", () => {
    expect(parseJson('{"a":1}')).toEqual({ a: 1 });
  });

  it("strips code fences", () => {
    expect(parseJson('```json\n{"safe":true}\n```')).toEqual({ safe: true });
  });

  it("extracts JSON from surrounding prose", () => {
    expect(parseJson('Claro! Aqui:\n{"route":"fit"}\nfim')).toEqual({ route: "fit" });
  });

  it("handles nested objects", () => {
    expect(parseJson('{"a":{"b":2}}')).toEqual({ a: { b: 2 } });
  });

  it("throws on garbage", () => {
    expect(() => parseJson("sem json aqui")).toThrow();
  });
});
