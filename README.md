# Chatbot con un agente de IA · DevFest Piura 2026

Proyecto base del taller **"Del vibe coding a producción: el arnés de un agente de código serio"** (DevFest Piura 2026, UDEP).

El chat en React ya funciona, pero el asistente todavía no tiene cerebro. En el taller se lo damos con un agente de LangChain sobre Gemini, guiados por PRPs.

**Preparación paso a paso:** https://willywg.com/devfest-2026/preparacion

## Empezar

```bash
# 1. Haz tu propio fork y clónalo (trae todas las ramas)
gh repo fork willywg/devfest-2026-chatbot --clone
cd devfest-2026-chatbot

# 2. Que los PR vayan a TU fork, no al repo original
gh repo set-default "$(gh api user -q .login)/devfest-2026-chatbot"

# 3. Instala y configura
npm install
cp .env.example .env   # pega tu GOOGLE_API_KEY de https://aistudio.google.com/apikey

# 4. Revisa que todo esté listo
npm run doctor
```

## Comandos

| Comando | Para qué |
|---|---|
| `npm run dev` | Chat en http://localhost:5173 y API en http://localhost:8787 |
| `npm run ask -- "pregunta"` | Prueba el agente desde la terminal |
| `npm run typecheck` | Verifica tipos |
| `npm run doctor` | Revisa el entorno |

## Ramas

Si te atrasas, cámbiate a la rama de la tarea anterior y sigue desde ahí.

| Rama | Estado |
|---|---|
| `main` | Punto de partida: chat simulado y agente sin cerebro |
| `tarea-1-agente` | Agente de LangChain con Gemini y un system prompt |
| `tarea-2-chat` | El chat del navegador conectado al agente |
| `tarea-3-faq` | (Opcional) El agente consulta un FAQ con una herramienta |

## Licencia

MIT
