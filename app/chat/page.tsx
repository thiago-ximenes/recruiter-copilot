import { ChatRoom } from "@/components/chat-room";

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string; lang?: string }>;
}) {
  const { intent, lang } = await searchParams;
  return <ChatRoom initialIntent={intent ?? null} initialLang={lang === "en" ? "en" : "pt"} />;
}
