import "dotenv/config";
import { readFileSync, rmSync } from "node:fs";
import { DB_PATH, DIMENSIONS, embeddings, openDb, toBlob } from "../src/server/rag/store";

interface Faq {
  id: string;
  pregunta: string;
  respuesta: string;
}

// 1. Leer el FAQ del negocio
const faqs: Faq[] = JSON.parse(readFileSync("data/faq.json", "utf8"));

// 2. Convertir cada pregunta + respuesta en un vector (1 sola llamada en lote)
const texts = faqs.map((f) => `${f.pregunta}\n${f.respuesta}`);
const vectors = await embeddings.embedDocuments(texts);

// 3. Guardar en SQLite: una tabla normal y una tabla vectorial con el mismo rowid
rmSync(DB_PATH, { force: true });
const db = openDb();
db.exec(`
  CREATE TABLE faq (id INTEGER PRIMARY KEY, slug TEXT, pregunta TEXT, respuesta TEXT);
  CREATE VIRTUAL TABLE faq_vec USING vec0(embedding float[${DIMENSIONS}] distance_metric=cosine);
`);
const insertFaq = db.prepare("INSERT INTO faq (id, slug, pregunta, respuesta) VALUES (?, ?, ?, ?)");
const insertVec = db.prepare("INSERT INTO faq_vec (rowid, embedding) VALUES (?, ?)");
faqs.forEach((f, i) => {
  const rowid = BigInt(i + 1);
  insertFaq.run(rowid, f.id, f.pregunta, f.respuesta);
  insertVec.run(rowid, toBlob(vectors[i]));
});
console.log(`Ingestadas ${faqs.length} preguntas en ${DB_PATH} (vectores de ${vectors[0].length} dimensiones)`);
