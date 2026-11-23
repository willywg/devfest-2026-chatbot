/** Contrato entre el chat (navegador) y el servidor. */
export type Role = "user" | "assistant";

export interface ChatMessage {
  role: Role;
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
}

export interface ChatResponse {
  reply: string;
}
