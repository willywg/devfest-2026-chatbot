import { type FormEvent, useEffect, useRef, useState } from "react";
import type { ChatMessage } from "../shared";
import { sendMessage } from "./api";

const WELCOME: ChatMessage = {
  role: "assistant",
  content: "Hola, soy el asistente del taller. ¿En qué te ayudo?",
};

export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    // El saludo es solo de la interfaz: no se envía al modelo.
    const history = [...messages, { role: "user", content: text } satisfies ChatMessage];
    setMessages(history);
    setInput("");
    setError(null);
    setLoading(true);
    try {
      const answer = await sendMessage(history.slice(1));
      setMessages([...history, { role: "assistant", content: answer }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="chat">
      <header className="chat-header">
        <span className="dot" aria-hidden="true" />
        <h1>Asistente</h1>
        <span className="badge">DevFest Piura 2026</span>
      </header>

      <ol className="messages" aria-live="polite">
        {messages.map((m, i) => (
          <li key={i} className={`bubble ${m.role}`}>
            {m.content}
          </li>
        ))}
        {loading && <li className="bubble assistant typing">Pensando…</li>}
        <div ref={endRef} />
      </ol>

      {error && <p className="error">{error}</p>}

      <form className="composer" onSubmit={onSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe un mensaje…"
          aria-label="Mensaje"
          autoFocus
        />
        <button type="submit" disabled={loading || !input.trim()}>
          Enviar
        </button>
      </form>
    </main>
  );
}
