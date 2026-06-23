import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

// Gera um PDF bem formatado a partir de data/profile/facts.md, pra subir como fonte da KB.
function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inline(s: string): string {
  return escapeHtml(s)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function mdToHtml(md: string): string {
  const out: string[] = [];
  let listOpen = false;
  let li: string | null = null;
  let para: string[] = [];
  let quote: string[] = [];

  const flushLi = () => {
    if (li !== null) {
      out.push(`<li>${inline(li)}</li>`);
      li = null;
    }
  };
  const closeList = () => {
    flushLi();
    if (listOpen) {
      out.push("</ul>");
      listOpen = false;
    }
  };
  const flushPara = () => {
    if (para.length) {
      out.push(`<p>${inline(para.join(" "))}</p>`);
      para = [];
    }
  };
  const flushQuote = () => {
    if (quote.length) {
      out.push(`<blockquote>${inline(quote.join(" "))}</blockquote>`);
      quote = [];
    }
  };

  for (const raw of md.split("\n")) {
    const line = raw.replace(/\s+$/, "");
    if (line.trim() === "") {
      closeList();
      flushPara();
      flushQuote();
      continue;
    }
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      closeList();
      flushPara();
      flushQuote();
      out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`);
      continue;
    }
    if (line.startsWith("> ")) {
      closeList();
      flushPara();
      quote.push(line.slice(2));
      continue;
    }
    const b = line.match(/^[-*]\s+(.*)$/);
    if (b) {
      flushPara();
      flushQuote();
      flushLi();
      if (!listOpen) {
        out.push("<ul>");
        listOpen = true;
      }
      li = b[1];
      continue;
    }
    if (li !== null) {
      li += " " + line.trim();
      continue;
    }
    if (quote.length) {
      quote.push(line.trim());
      continue;
    }
    flushQuote();
    para.push(line.trim());
  }
  closeList();
  flushPara();
  flushQuote();
  return out.join("\n");
}

const STYLE = `
  * { box-sizing: border-box; }
  body { font-family: -apple-system, system-ui, "Segoe UI", Roboto, sans-serif; color: #1a2227;
    font-size: 11.5px; line-height: 1.5; margin: 0; }
  h1 { font-size: 21px; color: #00674f; margin: 0 0 4px; }
  h2 { font-size: 15px; color: #008069; border-bottom: 1.5px solid #008069; padding-bottom: 3px;
    margin: 18px 0 8px; }
  h3 { font-size: 12.5px; color: #1a2227; margin: 12px 0 4px; }
  p { margin: 4px 0; }
  ul { margin: 4px 0; padding-left: 18px; }
  li { margin: 2px 0; }
  strong { color: #0b3d33; }
  code { background: #eef2f1; border-radius: 3px; padding: 0 3px; font-family: ui-monospace, monospace; font-size: 10.5px; }
  blockquote { margin: 6px 0; padding: 6px 10px; background: #f1f7f5; border-left: 3px solid #008069;
    color: #4a5a55; font-size: 10.5px; }
`;

async function main() {
  const md = fs.readFileSync(path.join(process.cwd(), "data/profile/facts.md"), "utf8");
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${STYLE}</style></head><body>${mdToHtml(md)}</body></html>`;

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle" });
  const outPath = path.join(process.cwd(), "facts-thiago-ximenes.pdf");
  await page.pdf({
    path: outPath,
    format: "A4",
    printBackground: true,
    margin: { top: "18mm", bottom: "18mm", left: "16mm", right: "16mm" },
  });
  await browser.close();
  console.log(`✓ PDF gerado: ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
