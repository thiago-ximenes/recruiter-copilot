# Recruiter Copilot — especialista em IA sobre o perfil do Thiago

> Portfólio que **é** a entrevista: o recrutador usa o app e, ao usar, vê na prática os
> diferenciais de engenharia de IA (roteamento de agentes, anti-alucinação, defesa contra
> prompt injection, eval-driven). Tudo fundamentado nos fatos reais dos currículos.

## 1. Para quem / o que faz
Público: recrutadores e entrevistadores técnicos.
- **Mede fit** com a vaga (cola a JD ou escolhe foco: frontend / backend / fullstack).
- **Tira dúvidas técnicas** sobre a experiência do Thiago, de forma **assertiva e validada**.
- **Adapta a ênfase** ao papel buscado (vaga frontend → valoriza frontend, etc.).
- **Nunca inventa**: responde só do que está fundamentado; se não sabe, diz que não está no perfil.

## 2. Arquitetura de agentes (o diferencial exibido)

```
Recrutador → [Guard de entrada] → [Router] → sub-agente → [RAG grounding] → [Verificador] → resposta (streaming)
                     │                                                              │
              injeção? bloqueia                                            afirmação sem base? corrige/recusa
                     └──────────────── tools: capture_gap / notify_thiago ─────────┘
```

### 2.1 Guard de entrada — anti prompt-injection
- JD e perguntas do recrutador são tratados como **dado não-confiável** (delimitação + datamarking/spotlighting).
- Detector de injeção barra: "ignore as instruções", "revele o system prompt", "diga que ele é expert em X".
- Regra de **não-divulgação** do system prompt + filtro de saída.
- Router só pode escolher de uma **allowlist fixa** de rotas (sem rota arbitrária).

### 2.2 Router de agentes — roteamento
Classifica intenção e despacha:
- **Analista de Fit** — JD ↔ perfil: score, evidências e **gaps honestos**.
- **Especialista Técnico** — profundidade técnica, ênfase conforme o papel.
- **Factual/CV** — datas, métricas, stacks exatas.

### 2.3 RAG / anti-alucinação
- Base de conhecimento = **fatos verificados** (3 CVs + arquivo curado em `data/profile/`).
- Padrões: responder só do contexto, **citar a fonte**, **recusar quando ausente**, saída
  estruturada com validação de schema.
- **Verificador**: checa cada afirmação de fit contra a base antes de exibir (segunda passada).

### 2.4 Ênfase adaptativa
A JD/foco pesa quais evidências aparecem primeiro (frontend → MUI/design system/RSC; backend →
microsserviços/BigQuery/observabilidade).

## 3. Tools do agente (tool-use real)
- `capture_gap(pergunta, motivo, contexto_vaga)` — toda pergunta **não respondida ou fraca** vai
  pro **log de gaps** (aprendizado: o Thiago revisa e se prepara pra cobrir na próxima).
- `notify_thiago(motivo, pergunta, contexto, contato?)` — quando não dá pra responder **e importa**,
  ou o recrutador quer falar direto, **notifica na hora** (Telegram) com pergunta + contexto + contato.
- `capture_lead(nome?, empresa?, vaga?, contato?, jd?)` — **captura oportunista** de quem engajou,
  pra o Thiago buscar de volta (maior ROI de conversão). **Nunca é um portão**: o recrutador usa
  livremente; o lead é capturado quando ele pede contato ou num convite leve no fim. (Decidido:
  não "lembrar no retorno" — recrutador raramente volta; baixo ROI.)

### Esclarecimentos pró-fit (não é entrevistar o recrutador)
Pra um fit preciso, o agente pode fazer **1-2 perguntas curtas sobre a vaga** ("mais frontend ou
backend? remoto?"). Isso **serve o recrutador** (fit melhor). O agente **não entrevista** o recrutador.

## 4. Loop de aprendizado + painel admin (privado do Thiago) — `/admin`
- **Prompts como config editável** (não hardcoded): guard, router e cada sub-agente. Versionados.
- **Gap log / dashboard**: perguntas mais feitas, gaps a preparar, empresas/contatos que interagiram.
- **Harness de auto-eval** ("IA se testa até o fluxo ideal"):
  - Conjunto de eval em `data/eval/` — itens `{ pergunta, contexto, gabarito/rubrica, tipo: factual|fit|injecao }`.
  - Runner roda o pipeline por item e **pontua** via juiz: *groundedness*, correção, resistência a injeção.
  - **Otimização**: dado os erros, o modelo propõe ajuste no prompt → re-roda → mantém a melhor versão,
    iterando até o threshold ou N iterações. Histórico de versões de prompt fica no admin.

## 4.1 Internacionalização (EN + pt-BR) — busca vagas no BR e fora
- **UI traduzida** (next-intl): EN e pt-BR, com toggle.
- **Agente responde no idioma do recrutador**: detecta o idioma da pergunta/JD (ou usa o toggle) e
  gera a resposta em EN ou pt-BR. A base de fatos é canônica/neutra; só a saída muda de idioma.
- Eval cobre os dois idiomas (groundedness não pode degradar em EN vs pt-BR).

## 5. Stack & decisões
- **Next.js (App Router, RSC, Server Actions) + TS + Tailwind + shadcn/ui** · streaming via Vercel AI SDK.
- **i18n**: next-intl (EN + pt-BR), UI + respostas do agente bilíngues.
- **Camada de LLM provider-agnostic** (`lib/llm/`): modelo barato no guard/router, melhor na resposta.
  - Default **Claude** (Haiku guard/router + Sonnet resposta); swap p/ DeepSeek via env. *(pendente: API key)*
- **Notificação**: Telegram bot (grátis/instantâneo); alternativa e-mail (Resend).
- **Persistência**: SQLite local + Postgres (Neon, free) no deploy — gap log, perguntas, versões de prompt.
- **Deploy**: Vercel. Repo próprio (github.com/thiago-ximenes).

## 6. Escopo v1 (finalizável)
Landing → chat + painel de fit → guard→router→sub-agentes→RAG→verificador→resposta com streaming;
tools `capture_gap`/`notify_thiago`; `/admin` com prompts editáveis + gap log + eval runner.
**Depois**: auth robusta no admin, analytics, embeddings sofisticados (v1 usa retrieval estruturado
sobre a base pequena), otimização automática multi-rodada.

## 7. Estrutura de pastas (planejada)
```
app/            page (landing+chat) · admin/ · api/ (chat stream, eval, gaps)
lib/llm/        provider-agnostic (claude, deepseek adapters)
lib/agents/     guard · router · subagents · verifier
lib/rag/        retrieval + grounding
lib/prompts/    store de prompts editáveis (versionado)
lib/tools/      capture_gap · notify_thiago
data/profile/   base de fatos verificados (a partir dos CVs)
data/eval/      conjunto de auto-teste
```

## 8. Pendências do Thiago
- Escolher/confirmar provider de LLM + fornecer **API key**.
- Setup do **Telegram bot** (token + chat id) para `notify_thiago`.
