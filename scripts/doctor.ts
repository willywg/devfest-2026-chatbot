import "dotenv/config";
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

type Result = { ok: boolean; label: string; hint?: string };
const results: Result[] = [];

function run(cmd: string): string | null {
  try {
    return execSync(cmd, { stdio: ["ignore", "pipe", "pipe"] }).toString().trim();
  } catch {
    return null;
  }
}

function check(label: string, ok: boolean, hint?: string) {
  results.push({ ok, label, hint: ok ? undefined : hint });
}

// 1. Node 24 o superior
const major = Number(process.versions.node.split(".")[0]);
check(`Node ${process.versions.node}`, major >= 24, "Instala Node 24 LTS: https://nodejs.org/en/download");

// 2. Dependencias instaladas
check("Dependencias instaladas", existsSync("node_modules/langchain"), "Corre: npm install");

// 3. Git con tu identidad (la necesitas para los commits y el PR)
const gitName = run("git config user.name");
const gitEmail = run("git config user.email");
check(
  `Git con identidad${gitName ? ` (${gitName})` : ""}`,
  Boolean(gitName && gitEmail),
  'Corre: git config --global user.name "Tu Nombre" && git config --global user.email "tu@correo.com"',
);

// 4. GitHub CLI con sesión iniciada
const gh = run("gh --version");
const ghAuth = gh ? run("gh auth status") !== null : false;
check(
  "GitHub CLI con sesión iniciada",
  Boolean(gh) && ghAuth,
  gh ? "Corre: gh auth login" : "Instala GitHub CLI: https://cli.github.com",
);

// 5. API key en .env
const key = process.env.GOOGLE_API_KEY?.trim();
check(
  "GOOGLE_API_KEY en .env",
  Boolean(key),
  "Copia .env.example a .env y pega tu key de https://aistudio.google.com/apikey",
);

// 6. Una llamada real al modelo (gasta 1 petición de tu cuota diaria)
async function ping(model: string): Promise<Result> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key ?? "" },
      body: JSON.stringify({ contents: [{ parts: [{ text: "Responde solo: ok" }] }] }),
    });
    if (res.ok) return { ok: true, label: `Modelo ${model} responde` };
    const hints: Record<number, string> = {
      400: "La key no es válida. Crea otra en https://aistudio.google.com/apikey",
      401: "La key no es válida. Crea otra en https://aistudio.google.com/apikey",
      403: "La key no tiene permiso para este modelo o el proyecto está bloqueado.",
      404: "Ese modelo no existe o no está disponible para tu cuenta. Revisa MODEL en .env",
      429: "Agotaste tu cuota (por minuto o por día). Espera o usa FALLBACK_MODEL.",
      503: "El modelo está saturado en este momento. No es tu culpa: reintenta en unos minutos.",
    };
    return {
      ok: false,
      label: `Modelo ${model} (HTTP ${res.status})`,
      hint: hints[res.status] ?? (await res.text()).slice(0, 200),
    };
  } catch (err) {
    return { ok: false, label: `Modelo ${model}`, hint: `Sin conexión: ${String(err)}` };
  }
}

if (key) {
  const model = process.env.MODEL || "gemini-3.5-flash-lite";
  const main = await ping(model);
  results.push(main);
  if (!main.ok && process.env.FALLBACK_MODEL) {
    const fallback = await ping(process.env.FALLBACK_MODEL);
    if (fallback.ok) fallback.label += " (respaldo)";
    results.push(fallback);
  }
}

console.log("\nRevisión del entorno del taller\n");
for (const r of results) {
  console.log(`${r.ok ? "  ✔" : "  ✘"} ${r.label}`);
  if (r.hint) console.log(`      → ${r.hint}`);
}
const modelOk = results.some((r) => r.label.startsWith("Modelo") && r.ok);
const failed = results.filter((r) => !r.ok && !(r.label.startsWith("Modelo") && modelOk));
console.log(failed.length === 0 ? "\nTodo listo para el taller.\n" : `\nFaltan ${failed.length} cosas.\n`);
process.exit(failed.length === 0 ? 0 : 1);
