import { describe, expect, it } from "vitest";
import { captureLead } from "@/lib/tools/capture-lead";

// O gate por regex evita custo: sem indício de contato, retorna null sem tocar LLM/DB.
describe("captureLead (gate por regex)", () => {
  it("ignora mensagens sem contato", async () => {
    expect(await captureLead("Quais tecnologias o Thiago domina?", "pt")).toBeNull();
    expect(await captureLead("Fale sobre a experiência dele.", "pt")).toBeNull();
  });
});
