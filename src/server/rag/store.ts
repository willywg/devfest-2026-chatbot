import { DatabaseSync } from "node:sqlite";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import * as sqliteVec from "sqlite-vec";

export const DB_PATH = "data/faq.db";
/** gemini-embedding-001 devuelve 3072 dimensiones; pedimos 768 para ahorrar espacio. */
export const DIMENSIONS = 768;

export const embeddings = new GoogleGenerativeAIEmbeddings({
  model: process.env.EMBEDDING_MODEL || "gemini-embedding-001",
  apiKey: process.env.GOOGLE_API_KEY,
  outputDimensionality: DIMENSIONS,
});

/** Abre la base SQLite con la extensión sqlite-vec cargada. */
export function openDb(path = DB_PATH) {
  const db = new DatabaseSync(path, { allowExtension: true });
  db.loadExtension(sqliteVec.getLoadablePath());
  return db;
}

/** Normaliza el vector (longitud 1) para que la distancia coseno sea comparable. */
export function toBlob(vector: number[]): Uint8Array {
  const norm = Math.hypot(...vector) || 1;
  return new Uint8Array(new Float32Array(vector.map((x) => x / norm)).buffer);
}
