export type Lang = "pt" | "en";

export type QuickReply = { label: string; intent: string };

export type IntroScript = {
  headerName: string;
  headerStatus: string;
  messages: string[];
  quickReplies: QuickReply[];
  startHint: string;
};

export const INTRO: Record<Lang, IntroScript> = {
  pt: {
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
  },
  en: {
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
  },
};
