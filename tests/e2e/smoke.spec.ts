import { expect, test } from "@playwright/test";

test("landing mostra quick replies após pular a intro", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Assistente do Thiago")).toBeVisible();
  await page.locator(".wa-bg").click(); // pula a animação
  await expect(page.getByRole("button", { name: /Por que contratar/i })).toBeVisible();
});

test("toggle de idioma troca o conteúdo para inglês", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.getByText("Thiago's Assistant")).toBeVisible();
  await page.locator(".wa-bg").click();
  await expect(page.getByRole("button", { name: /Why hire Thiago/i })).toBeVisible();
});

test("chat renderiza resposta e trace chips (api mockada)", async ({ page }) => {
  await page.route("**/api/chat", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        answer: "O Thiago trabalha com Node.js, NestJS e React.",
        trace: {
          safe: true,
          reason: "",
          route: "tech",
          clarify: null,
          verified: true,
          retrievedChunks: 3,
          leadCaptured: false,
          gapCaptured: false,
        },
      }),
    });
  });

  await page.goto("/chat?intent=skills&lang=pt");
  await expect(page.getByText("O Thiago trabalha com Node.js, NestJS e React.")).toBeVisible();
  await expect(page.getByText("RAG (3)")).toBeVisible();
  await expect(page.getByText("✓ verificado")).toBeVisible();
});
