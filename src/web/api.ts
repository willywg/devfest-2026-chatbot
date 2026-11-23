import type { ChatMessage } from "../shared";

/**
 * Envía la conversación y devuelve la respuesta del asistente.
 *
 * TAREA 2: hoy es una respuesta simulada en el navegador. Hay que conectarla
 * al servidor (POST /api/chat) y manejar los errores.
 */
export async function sendMessage(messages: ChatMessage[]): Promise<string> {
  await new Promise((r) => setTimeout(r, 600));
  return `(simulado) Recibí: "${messages.at(-1)?.content ?? ""}"`;
}
