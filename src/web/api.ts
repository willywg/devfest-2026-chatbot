import type { ChatMessage, ChatResponse } from "../shared";

/** Envía la conversación al servidor y devuelve la respuesta del asistente. */
export async function sendMessage(messages: ChatMessage[]): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  const data = (await res.json().catch(() => ({}))) as Partial<ChatResponse> & { error?: string };
  if (!res.ok || !data.reply) {
    throw new Error(data.error ?? `El servidor respondió ${res.status}`);
  }
  return data.reply;
}
