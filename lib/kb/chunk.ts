// Quebra a base de fatos (markdown) em chunks por seção, com teto de tamanho.
// Mantém o cabeçalho da seção em cada chunk pra preservar contexto na recuperação.

const MAX_CHARS = 800;

export function chunkMarkdown(text: string, maxChars = MAX_CHARS): string[] {
  const lines = text.split("\n");
  const chunks: string[] = [];
  let heading = "";
  let buffer: string[] = [];

  const flush = () => {
    const body = buffer.join("\n").trim();
    if (!body) return;
    const prefix = heading ? `${heading}\n` : "";
    chunks.push((prefix + body).trim());
    buffer = [];
  };

  for (const line of lines) {
    const isHeading = /^#{1,6}\s/.test(line);
    if (isHeading) {
      flush();
      heading = line.trim();
      continue;
    }
    const projected = [...buffer, line].join("\n");
    if (projected.length > maxChars && buffer.length > 0) flush();
    buffer.push(line);
  }
  flush();

  return chunks.filter(Boolean);
}
