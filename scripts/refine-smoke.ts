import "dotenv/config";
import { refineKb } from "../lib/llm/refine";

// Material cru e bagunçado de propósito (com repetição e ruído).
const RAW = `
CURRICULO - Thiago. Thiago Ximenes. Engenheiro.
Trabalhou na Fazpay como Principal Engineer. Gateway de pagamentos R$ 1 milhão por dia.
Front: React, Next.js. Back: Node, NestJS. Banco Postgres.
Fazpay Fazpay gateway pagamentos 600 clientes 5 milhoes de transacoes.
Sabe IA, fez agentes com guardrails. Material UI no front da fazpay.
nao tem faculdade, fez bootcamp Trybe. Ingles avancado.
React React React Node Node Postgres AWS observabilidade CloudWatch.
`;

async function main() {
  console.log("Refinando material cru...\n");
  const out = await refineKb(RAW);
  console.log(out);
  process.exit(0);
}

main().catch((e) => {
  console.error("FALHOU:", e.message);
  process.exit(1);
});
