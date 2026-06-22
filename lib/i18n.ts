// Dicionário único e tipado de toda a UI pública (intro + chat). Toggle de idioma
// é instantâneo no cliente; o admin é interno (pt) e não passa por aqui.

export type Lang = "pt" | "en";

export type QuickReply = { label: string; intent: string };

export type Dict = {
  intro: {
    headerName: string;
    headerStatus: string;
    messages: string[];
    quickReplies: QuickReply[];
    startHint: string;
    skipHint: string;
    now: string;
  };
  chat: {
    header: string;
    status: string;
    placeholder: string;
    greeting: string;
    stages: string[];
    back: string;
    fitPrefill: string;
    send: string;
    starters: Record<string, string>;
    trace: {
      safe: string;
      blocked: string;
      grounded: string;
      verified: string;
      lead: string;
      gap: string;
      routes: Record<string, string>;
    };
  };
};

export const DICT: Record<Lang, Dict> = {
  pt: {
    intro: {
      headerName: "Assistente do Thiago",
      headerStatus: "online · IA",
      messages: [
        "Oi! 👋 Sou o assistente de IA do *Thiago Ximenes*.",
        "Fui treinado nos fatos reais da carreira dele — e existo pra te ajudar a avaliar se ele encaixa na sua vaga.",
        "📋 Cola a descrição da vaga e eu meço o *fit*, com evidências e *gaps honestos*.",
        "🧠 Pergunta qualquer coisa técnica — respondo de forma direta e fundamentada.",
        "🎯 Me diz o foco (frontend, backend ou fullstack) que eu destaco o que importa pra você.",
        "Uma promessa: eu *não invento*. Se algo não está no perfil dele, eu falo — e aviso o Thiago pra ele te responder direto.",
        "Bora? Escolhe por onde começar 👇",
      ],
      quickReplies: [
        { label: "📋 Colar minha vaga e ver o fit", intent: "fit" },
        { label: "🧰 Quais tecnologias ele domina?", intent: "skills" },
        { label: "✨ Por que contratar o Thiago?", intent: "why" },
        { label: "📞 Falar com o Thiago", intent: "contact" },
      ],
      startHint: "Toque numa opção ou escreva sua pergunta",
      skipHint: "toque para pular ›",
      now: "agora",
    },
    chat: {
      header: "Assistente do Thiago",
      status: "online · IA",
      placeholder: "Escreva sua pergunta…",
      greeting:
        "Oi! 👋 Pergunte o que quiser sobre o Thiago, ou cole a sua vaga que eu meço o fit. Respondo só com base nos fatos reais dele.",
      stages: ["🛡️ verificando entrada", "🧭 roteando", "📚 consultando a base", "✓ verificando"],
      back: "‹ Voltar",
      fitPrefill: "Minha vaga: ",
      send: "enviar",
      starters: {
        skills: "Quais tecnologias o Thiago domina?",
        why: "Por que contratar o Thiago?",
        contact: "Quero falar com o Thiago.",
      },
      trace: {
        safe: "🛡️ seguro",
        blocked: "🛡️ bloqueado",
        grounded: "📚 grounded",
        verified: "✓ verificado",
        lead: "🤝 lead",
        gap: "📝 gap",
        routes: { fit: "fit", tech: "técnico", factual: "factual", contact: "contato" },
      },
    },
  },
  en: {
    intro: {
      headerName: "Thiago's Assistant",
      headerStatus: "online · AI",
      messages: [
        "Hi! 👋 I'm *Thiago Ximenes'* AI assistant.",
        "I was trained on the real facts of his career — and I'm here to help you assess whether he fits your role.",
        "📋 Paste the job description and I'll measure the *fit*, with evidence and *honest gaps*.",
        "🧠 Ask me anything technical — I answer directly and grounded in facts.",
        "🎯 Tell me the focus (frontend, backend or fullstack) and I'll highlight what matters to you.",
        "One promise: I *don't make things up*. If something isn't in his background, I'll say so — and ping Thiago so he can reply to you directly.",
        "Ready? Pick where to start 👇",
      ],
      quickReplies: [
        { label: "📋 Paste my role & see the fit", intent: "fit" },
        { label: "🧰 What tech does he know?", intent: "skills" },
        { label: "✨ Why hire Thiago?", intent: "why" },
        { label: "📞 Talk to Thiago", intent: "contact" },
      ],
      startHint: "Tap an option or type your question",
      skipHint: "tap to skip ›",
      now: "now",
    },
    chat: {
      header: "Thiago's Assistant",
      status: "online · AI",
      placeholder: "Type your question…",
      greeting:
        "Hi! 👋 Ask anything about Thiago, or paste your role and I'll measure the fit. I only answer grounded in his real facts.",
      stages: ["🛡️ checking input", "🧭 routing", "📚 consulting the KB", "✓ verifying"],
      back: "‹ Back",
      fitPrefill: "My role: ",
      send: "send",
      starters: {
        skills: "What technologies does Thiago know?",
        why: "Why should we hire Thiago?",
        contact: "I'd like to talk to Thiago.",
      },
      trace: {
        safe: "🛡️ safe",
        blocked: "🛡️ blocked",
        grounded: "📚 grounded",
        verified: "✓ verified",
        lead: "🤝 lead",
        gap: "📝 gap",
        routes: { fit: "fit", tech: "technical", factual: "factual", contact: "contact" },
      },
    },
  },
};
