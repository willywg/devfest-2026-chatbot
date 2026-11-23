import { embeddings, openDb, toBlob } from "./store";

const db = openDb();
const knn = db.prepare(`
  SELECT f.pregunta, f.respuesta, v.distance
  FROM faq_vec v JOIN faq f ON f.id = v.rowid
  WHERE v.embedding MATCH ? AND k = ?
  ORDER BY v.distance
`);

/** Distancia coseno máxima aceptada: más lejos que esto no es relevante. */
const MAX_DISTANCE = 0.5;

export interface Hit {
  pregunta: string;
  respuesta: string;
  distance: number;
}

/** Retriever: pregunta → vector → las k entradas más cercanas. */
export async function retrieve(query: string, k = 3): Promise<Hit[]> {
  const vector = await embeddings.embedQuery(query);
  const rows = knn.all(toBlob(vector), k) as unknown as Hit[];
  return rows.filter((r) => r.distance <= MAX_DISTANCE);
}
