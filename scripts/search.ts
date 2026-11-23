import "dotenv/config";
import { retrieve } from "../src/server/rag/retriever";

// Uso: npm run search -- "tu pregunta"   (prueba el retriever sin el agente)
const query = process.argv.slice(2).join(" ").trim();
const hits = await retrieve(query);
if (hits.length === 0) console.log("Sin resultados relevantes");
for (const h of hits) console.log(`${h.distance.toFixed(2)}  ${h.pregunta}`);
