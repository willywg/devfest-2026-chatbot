import { tool } from "langchain";
import * as z from "zod";
import { retrieve } from "./retriever";

/**
 * Una tool tiene tres partes y el modelo solo ve dos:
 * - name y description: el modelo las lee para decidir SI y CUÁNDO llamarla.
 * - schema: define los argumentos que el modelo debe generar (aquí, `query`).
 * - la función: la ejecuta tu código, no el modelo. Su resultado vuelve al
 *   modelo como un ToolMessage y con eso redacta la respuesta final.
 */
export const faqTool = tool(
  async ({ query }) => {
    const hits = await retrieve(query);
    if (hits.length === 0) return "No hay nada en el FAQ sobre eso.";
    return hits.map((h) => `P: ${h.pregunta}\nR: ${h.respuesta}`).join("\n\n");
  },
  {
    name: "buscar_faq",
    description:
      "Busca por significado en las preguntas frecuentes del DevFest Piura 2026 (fecha, lugar, organizadores, taller, requisitos, PRP, Piura AI). Úsala antes de responder cualquier dato del evento.",
    schema: z.object({ query: z.string().describe("La pregunta del usuario, con sus propias palabras") }),
  },
);
