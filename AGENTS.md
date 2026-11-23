# AGENTS.md

Proyecto del taller "Del vibe coding a producción" (DevFest Piura 2026): un chatbot web cuyo asistente es un agente de LangChain sobre Gemini.

## Stack

- Node.js 24, TypeScript, ESM (`"type": "module"`).
- Navegador: React 19 + Vite (`src/web/`). Servidor: Hono en Node (`src/server/`). Contrato compartido en `src/shared.ts`.
- IA: LangChain JS v1 con Gemini vía `@langchain/google-genai`.

## Comandos

| Comando | Para qué |
|---|---|
| `npm run dev` | Levanta la API (http://localhost:8787) y el chat (http://localhost:5173) |
| `npm run ask -- "pregunta"` | Prueba el agente desde la terminal, sin navegador |
| `npm run typecheck` | Verifica tipos. Debe pasar antes de cada commit |
| `npm run doctor` | Revisa el entorno y hace 1 llamada real al modelo |

## Cómo está armado

- `src/server/agent.ts` expone `reply(messages)`: recibe la conversación y devuelve el texto de respuesta. Es el único punto donde vive la lógica del agente.
- `src/server/index.ts` expone `POST /api/chat` con `{ messages }` y responde `{ reply }`.
- `src/web/api.ts` es el único lugar del navegador que habla con el servidor.
- `data/` guarda contenido que el agente puede consultar (por ejemplo, `faq.md`).

## Reglas no negociables

1. **No instales dependencias nuevas.** Todo lo necesario ya está en `package.json`; el wifi del evento no da para más.
2. **API de LangChain v1.** Crea el agente con `import { createAgent, tool } from "langchain"` y el modelo con `import { ChatGoogleGenerativeAI } from "@langchain/google-genai"`. No uses `initializeAgentExecutor`, `AgentExecutor`, `createReactAgent` ni otras APIs antiguas. Los esquemas de herramientas van con `import * as z from "zod"`.
3. **El modelo se lee de `.env`:** `MODEL` (por defecto `gemini-3.5-flash-lite`) y `FALLBACK_MODEL`. Nunca escribas la API key en el código ni la imprimas en logs.
4. **Cuota escasa:** el plan gratuito permite 15 peticiones por minuto y 500 por día. Las validaciones deben hacer pocas llamadas reales (1 o 2 con `npm run ask`).
5. **Errores 503 (modelo saturado):** reintentar con `maxRetries` y, si sigue fallando, pasar a `FALLBACK_MODEL`.
6. **El navegador nunca llama a Gemini directo.** Siempre pasa por `/api/chat`.
7. Textos para el usuario final en español.

## Validación antes de dar una tarea por terminada

1. `npm run typecheck` sin errores.
2. Si tocaste el agente: `npm run ask -- "pregunta de prueba"` responde algo coherente.
3. Si tocaste el chat: `npm run dev` y una conversación de al menos dos mensajes en el navegador.
4. Un commit por tarea, con mensaje claro.

## PRPs

Las especificaciones viven en `PRPs/` y se generan con el skill PRP Manager. Ejecuta un PRP a la vez y valida con los pasos de arriba.
