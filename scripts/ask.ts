import "dotenv/config";
import type { ChatMessage } from "../src/shared";
import { reply } from "../src/server/agent";

// Uso: npm run ask -- "tu pregunta"
const question = process.argv.slice(2).join(" ").trim();
if (!question) {
  console.error('Uso: npm run ask -- "tu pregunta"');
  process.exit(1);
}

const messages: ChatMessage[] = [{ role: "user", content: question }];
const t0 = Date.now();
const answer = await reply(messages);
console.log(`\n${answer}\n\n(${Date.now() - t0} ms)`);
