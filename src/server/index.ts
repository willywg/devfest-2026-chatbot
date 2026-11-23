import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import type { ChatRequest, ChatResponse } from "../shared";
import { reply } from "./agent";

const app = new Hono();

app.get("/api/health", (c) => c.json({ ok: true }));

app.post("/api/chat", async (c) => {
  const body = await c.req.json<ChatRequest>();
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return c.json({ error: "Envía al menos un mensaje" }, 400);
  }
  try {
    const answer: ChatResponse = { reply: await reply(body.messages) };
    return c.json(answer);
  } catch (err) {
    console.error(err);
    return c.json({ error: "El agente falló. Revisa la terminal del servidor." }, 500);
  }
});

const port = Number(process.env.PORT ?? 8787);
serve({ fetch: app.fetch, port }, () => {
  console.log(`API lista en http://localhost:${port}`);
});
