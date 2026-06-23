import {
  bigserial,
  bigint,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  vector,
} from "drizzle-orm/pg-core";

// Um prompt nomeado (guard, router, subagent.fit, ...). A versão ativa aponta
// para prompt_versions; o histórico é append-only -> permite rollback e auditoria.
export const prompts = pgTable("prompts", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  activeVersionId: bigint("active_version_id", { mode: "number" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// Histórico de versões de cada prompt (nunca deletado).
export const promptVersions = pgTable(
  "prompt_versions",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    promptId: bigint("prompt_id", { mode: "number" })
      .notNull()
      .references(() => prompts.id),
    version: integer("version").notNull(),
    content: text("content").notNull(),
    changeNote: text("change_note"),
    author: text("author").notNull().default("admin"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique("prompt_version_unique").on(t.promptId, t.version)],
);

// Estado/config genérico chave-valor (ex.: throttle de alertas operacionais).
export const appState = pgTable("app_state", {
  key: text("key").primaryKey(),
  value: text("value"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Conversa do recrutador (transcript persistido). Stateless no agente, mas logado.
export const conversations = pgTable("conversations", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  lang: text("lang"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// Lookup de papel da mensagem (user | assistant) — FK int, padrão do projeto.
export const messageRoles = pgTable("message_roles", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  code: text("code").notNull().unique(),
});

// Mensagens da conversa (transcript). trace = JSON do raciocínio do agente.
export const conversationMessages = pgTable("conversation_messages", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  conversationId: bigint("conversation_id", { mode: "number" })
    .notNull()
    .references(() => conversations.id),
  roleId: bigint("role_id", { mode: "number" })
    .notNull()
    .references(() => messageRoles.id),
  content: text("content").notNull(),
  trace: jsonb("trace"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Captura oportunista de quem engajou (lead gen p/ o Thiago buscar de volta).
export const leads = pgTable("leads", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  name: text("name"),
  company: text("company"),
  role: text("role"),
  contact: text("contact"),
  jdText: text("jd_text"),
  lang: text("lang"),
  conversationId: bigint("conversation_id", { mode: "number" }).references(
    () => conversations.id,
    { onDelete: "set null" },
  ),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ===== KB (funil de ingestão) =====

// Lookup do tipo de fonte (pdf | text | snippet) — FK int, padrão do projeto.
export const kbSourceTypes = pgTable("kb_source_types", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  code: text("code").notNull().unique(),
});

// Material cru que entra no funil (o "lado de entrada").
export const kbSources = pgTable("kb_sources", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  typeId: bigint("type_id", { mode: "number" })
    .notNull()
    .references(() => kbSourceTypes.id),
  filename: text("filename"),
  rawText: text("raw_text").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// Documento canônico da KB (ex.: 'profile-facts') — a versão ativa é o grounding.
export const kbDocuments = pgTable("kb_documents", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  key: text("key").notNull().unique(),
  title: text("title").notNull(),
  activeVersionId: bigint("active_version_id", { mode: "number" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// Versões do documento (append-only) — o "lado de saída" refinado, com rollback.
export const kbDocumentVersions = pgTable(
  "kb_document_versions",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    documentId: bigint("document_id", { mode: "number" })
      .notNull()
      .references(() => kbDocuments.id),
    version: integer("version").notNull(),
    content: text("content").notNull(),
    changeNote: text("change_note"),
    refinedFromSourceId: bigint("refined_from_source_id", { mode: "number" }).references(
      () => kbSources.id,
    ),
    author: text("author").notNull().default("admin"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique("kb_document_version_unique").on(t.documentId, t.version)],
);

// Chunks vetorizados da versão ativa da KB — RAG real (pgvector).
// Recriados a cada versão ativada; recuperação por similaridade de cosseno.
export const kbChunks = pgTable("kb_chunks", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  documentVersionId: bigint("document_version_id", { mode: "number" })
    .notNull()
    .references(() => kbDocumentVersions.id),
  chunkIndex: integer("chunk_index").notNull(),
  content: text("content").notNull(),
  embedding: vector("embedding", { dimensions: 768 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Perguntas que o agente não soube / respondeu fraco -> o Thiago se prepara.
export const gaps = pgTable("gaps", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  question: text("question").notNull(),
  reason: text("reason"),
  roleContext: text("role_context"),
  lang: text("lang"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
