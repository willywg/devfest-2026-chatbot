import type { ChatMessage } from "../shared";

/**
 * Recibe la conversación completa y devuelve la respuesta del asistente.
 *
 * TAREA 1: reemplazar esta respuesta fija por un agente de LangChain
 * (createAgent) con un system prompt para tu caso de uso.
 */
export async function reply(messages: ChatMessage[]): Promise<string> {
  const last = messages.at(-1)?.content ?? "";
  return `Todavía no tengo cerebro. Me dijiste: "${last}"`;
}
