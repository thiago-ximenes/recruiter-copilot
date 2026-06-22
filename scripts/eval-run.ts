import "dotenv/config";
import { runEval } from "../lib/eval/runner";

async function main() {
  console.log("Rodando eval harness...\n");
  const r = await runEval();
  for (const c of r.results) {
    console.log(`${c.pass ? "✓" : "✗"} [${c.type}] ${c.id} — score ${c.score} (rota ${c.route}) — ${c.notes}`);
  }
  console.log(`\nPass rate: ${r.passRate}% (${r.passed}/${r.total})`);
  process.exit(0);
}

main().catch((e) => {
  console.error("FALHOU:", e.message);
  process.exit(1);
});
