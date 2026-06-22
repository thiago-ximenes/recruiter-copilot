# Base de fatos verificados — Thiago Ximenes Lima

> Fonte de verdade (grounding) do RAG. O agente SÓ pode afirmar o que está aqui ou nos CVs.
> Se algo não está aqui, a resposta correta é "não está no perfil dele" — nunca inventar.
> Idioma canônico: pt-BR. O agente traduz a saída para EN quando necessário.

## Identidade
- Engenheiro de Software Sênior / Principal / Tech Lead. ~5 anos de experiência, sempre em
  aplicações financeiras de alto volume.
- Localização: Santa Quitéria/CE, Brasil. Aberto a remoto, híbrido e presencial (topa relocar).
- Inglês: avançado, proficiência profissional de trabalho (entrevista em inglês: sim).
- Formação: bootcamp Trybe — Desenvolvimento Web Full-Stack (+1.500h, 2022). **Sem bacharelado.**
- Contato direto é via tool `notify_thiago` (não expor dados pessoais no chat).

## Posicionamento (3 focos, mesma pessoa)
- **Fullstack**: equilíbrio real backend + frontend.
- **Frontend**: especialista React/Next.js; dono de todas as decisões de frontend na Fazpay e na
  plataforma de IA; design system em Material UI.
- **Backend**: microsserviços, PostgreSQL, AWS, pagamentos, IA/LLM, observabilidade.

## Experiências (verificado)

### Fazpay — Principal Engineer (abr/2024 – jun/2026, remoto)
Fintech: adquirência de pagamentos + software house.
- Liderou time de 3 engenheiros; responsável por arquitetura, decisões técnicas e entrega de toda
  a plataforma de pagamentos.
- Gateway de pagamentos: **R$ 1M+/dia**, **5M+ transações acumuladas**, **~600 estabelecimentos**.
- **Responsável por todas as decisões de frontend** (React, Next.js, TypeScript): backoffice,
  fluxos de pagamento, dashboards. **Design system em Material UI (MUI)**. Next.js App Router, RSC,
  Server Actions. Forms com React Hook Form + Zod. Cache com TanStack Query. Estado Zustand/Context.
  Testes Vitest, Testing Library, Playwright (E2E).
- Microsserviços: usuários (authn/authz), adquirência (planos, comissões, vendas), banco proxy
  (processamento e liquidação), carteira digital.
- Mensageria AWS SQS, notificações SES, storage S3.
- **Modelou e otimizou** os bancos PostgreSQL; tuning de queries críticas; **migrou relatórios
  pesados para BigQuery**.
- **Observabilidade com CloudWatch** (logs, métricas, alertas).
- Domínios ponta a ponta: adquirência, recebimentos, split de pagamento, marketplace.

### Plataforma de Agentes de IA — projeto independente (2025 – atual, em produção)
- Plataforma multi-tenant de agentes de IA para atendimento via WhatsApp e Instagram (Meta Cloud API).
- LLMs (OpenAI, DeepSeek), **guardrails anti-alucinação**, workflows configuráveis por cliente.
- **Dono de todas as decisões de frontend** (React + Vite): milhares de mensagens/dia em tempo real,
  consistência de estado (merge monotônico de status de entrega), performance de listas.
- **Observabilidade com Grafana, Loki e Prometheus.**
- Backend NestJS; ownership completo: arquitetura, deploy e monitoramento.

### Paylivre — Full-Stack (Júnior → Pleno) (abr/2022 – mar/2024, remoto)
Fintech de pagamentos internacionais.
- Microsserviços de autorização, validação de documentos e contas digitais (PHP, Node.js).
- Serviço PSP full-stack (clientes ofereciam produtos financeiros via API com backoffice).
- **Frontend do backoffice de cripto em React + Material UI**; boilerplate full-stack do admin.
- Estabilizou sistema legado com padrões de design; projeto de taxas dinâmicas por faturamento.
- Promovido de júnior a pleno por desempenho.

### Smartmentor — Tech Lead (freelance) (set/2023 – mar/2024, remoto)
- Liderança técnica; backend completo, modelagem, pagamentos via Stripe.
- Frontend: ranking de empresas em tempo real, CRUD de portfólio, dashboards.
- Infra AWS (EC2, S3, SES, RDS) + CI/CD GitHub Actions.

### Inventorys — Frontend / Infra / Mentor (freelance) (dez/2023 – mai/2024, remoto)
- UI com controle de acesso por perfil (RBAC); modelagem por etapas do inventário.
- Mentoria de backend (Laravel); infra AWS + CI/CD.

## Skills (verificado)
- **Backend**: Node.js, TypeScript, NestJS, AdonisJS, Express, Laravel, Symfony, PostgreSQL, MySQL,
  MongoDB, Redis, filas/mensageria (AWS SQS), REST, BigQuery.
- **Frontend**: React, Next.js (App Router, RSC, Server Actions), TypeScript, Material UI (MUI),
  Tailwind CSS, shadcn/ui, React Hook Form, Zod, TanStack Query, Zustand, Context API, Vite,
  Storybook, WebSockets, HTML5/CSS3, React Native, design responsivo.
- **Testes**: Vitest/Jest, Testing Library, Playwright (E2E).
- **IA/LLM**: OpenAI, DeepSeek, engenharia de prompts, guardrails, agentes em produção, RAG.
- **Integrações**: WhatsApp/Meta Cloud API, adquirentes, provedores bancários (Pix, boleto, TED), Stripe.
- **Infra & DevOps**: AWS (EC2, S3, RDS, SQS, SES), Docker, Kubernetes, CI/CD (GitHub Actions),
  CloudWatch, Grafana, Loki, Prometheus.
- **Arquitetura/práticas**: microsserviços, Clean Architecture, modelagem e otimização de dados,
  design systems, migrations, Kanban/Scrum.

## Gaps honestos (o que NÃO é o perfil — nunca afirmar domínio aqui)
- Backend primário em **Python, Java/Spring, C#/.NET, Go, Ruby/Rails**: NÃO é a stack dele
  (já usou conceitos, mas não vende como especialista).
- Frontend **Angular ou Vue**: não é a stack dele (é React/Next).
- **React Native**: tem exposição, mas NÃO tem 3+ anos / senioridade mobile dedicada.
- **Acessibilidade (a11y) avançada** (ARIA/WCAG na unha): não trabalhou a fundo; usa o que as libs
  (MUI) entregam — não vender como especialidade.
- **Bacharelado**: não tem (bootcamp Trybe). Vagas com diploma obrigatório = knockout honesto.
- Anos de experiência: ~5. Vagas que exigem 8+ anos rígidos podem não casar — ser honesto sobre isso.

## Diferenciais (o que destacar)
- IA/LLM/agentes **em produção** com guardrails anti-alucinação e RAG — raro e atual (2026).
- Pagamentos de alto volume (R$1M/dia) com ownership de arquitetura ponta a ponta.
- Dono de frontend (design system MUI) + backend forte = fullstack de verdade, não raso.
- Observabilidade real (CloudWatch / Grafana-Loki-Prometheus) e otimização de dados (queries, BigQuery).
