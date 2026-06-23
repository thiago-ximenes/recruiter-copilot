"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Renderiza a resposta do agente (markdown) dentro do balão estilo WhatsApp.
// Estilos compactos próprios — não depende do plugin typography.
export function ChatMarkdown({ children }: { children: string }) {
  return (
    <div className="space-y-1.5 break-words [&_a]:text-[#027eb5] [&_a]:underline">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="leading-snug">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => <ul className="list-disc space-y-0.5 pl-4">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-0.5 pl-4">{children}</ol>,
          li: ({ children }) => <li className="leading-snug">{children}</li>,
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-[12.5px]">{children}</code>
          ),
          h1: ({ children }) => <p className="font-semibold">{children}</p>,
          h2: ({ children }) => <p className="font-semibold">{children}</p>,
          h3: ({ children }) => <p className="font-semibold">{children}</p>,
          hr: () => <hr className="my-1 border-black/10" />,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-black/10 pl-2 text-[#54656f]">{children}</blockquote>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
