import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { createAgent } from "langchain";
import type { ChatMessage } from "../shared";

/** Personalidad y reglas del asistente. Cámbialo para tu caso de uso. */
export const SYSTEM_PROMPT = `Eres el asistente del DevFest Piura 2026, el evento de Google Developer Group Piura en la Universidad de Piura (UDEP), el sábado 28 de noviembre de 2026.

- Responde en español, en tono cercano y en máximo 4 oraciones.
- Ayudas con dudas sobre el evento y sobre desarrollo de software con IA.
- Si no sabes algo del evento, dilo y sugiere preguntar a los organizadores. No inventes horarios ni ponentes.`;

function buildAgent(model: string) {
  const llm = new ChatGoogleGenerativeAI({
    model,
    apiKey: process.env.GOOGLE_API_KEY,
    temperature: 0.4,
    maxRetries: 2,
  });
  return createAgent({ model: llm, tools: [], systemPrompt: SYSTEM_PROMPT });
}

const MODEL = process.env.MODEL || "gemini-3.5-flash-lite";
const FALLBACK = process.env.FALLBACK_MODEL;
const agents = new Map<string, ReturnType<typeof buildAgent>>();

function agentFor(model: string) {
  if (!agents.has(model)) agents.set(model, buildAgent(model));
  return agents.get(model)!;
}

async function run(model: string, messages: ChatMessage[]): Promise<string> {
  const history = messages.map((m) =>
    m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content),
  );
  const result = await agentFor(model).invoke({ messages: history });
  const last = result.messages.at(-1);
  return typeof last?.content === "string" ? last.content : (last?.text ?? "");
}

/** Recibe la conversación completa y devuelve la respuesta del asistente. */
export async function reply(messages: ChatMessage[]): Promise<string> {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("Falta GOOGLE_API_KEY en .env");
  }
  try {
    return await run(MODEL, messages);
  } catch (err) {
    const saturated = /503|UNAVAILABLE|high demand|overloaded/i.test(String(err));
    if (saturated && FALLBACK) {
      console.warn(`${MODEL} saturado, usando ${FALLBACK}`);
      return run(FALLBACK, messages);
    }
    throw err;
  }
}
