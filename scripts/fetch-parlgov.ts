// Ideología (left_right 0–10) de ParlGov para los partidos de los gobernantes.
// Entrada 1: data/raw/parlgov/view_party.csv  (descarga manual desde https://www.parlgov.org/data/ — ver README)
// Entrada 2: data/parlgov-party-map.json      (Wikidata QID del partido → party_id de ParlGov, curado a mano)
// Salida:    data/raw/parlgov/scores.json
import { readFileSync, existsSync } from "node:fs";
import { parse } from "csv-parse/sync";
import { readJson, writeJson, today } from "./lib.ts";

const CSV = "data/raw/parlgov/view_party.csv";
if (!existsSync(CSV)) {
  console.warn(`⚠ Falta ${CSV}. Descárgalo de parlgov.org/data (tabla view_party, CSV UTF-8). Se omite la ideología.`);
  writeJson("data/raw/parlgov/scores.json", {});
  process.exit(0);
}

const rows: any[] = parse(readFileSync(CSV, "utf8"), { columns: true, skip_empty_lines: true });
const byId = new Map(rows.map((r) => [String(r.party_id), r]));

type MapEntry = { wikidataParty: string; parlgovPartyId: number; note?: string; mappingSourceUrl: string };
const map = readJson<MapEntry[]>("data/parlgov-party-map.json", []);

const out: Record<string, unknown> = {};
for (const m of map) {
  const row = byId.get(String(m.parlgovPartyId));
  if (!row) { console.warn(`⚠ party_id ${m.parlgovPartyId} no está en el CSV`); continue; }
  const score = row.left_right === "" || row.left_right == null ? null : Number(row.left_right);
  if (score === null) console.warn(`⚠ ${row.party_name_short} (${row.country_name_short}): sin left_right en ParlGov`);
  out[m.wikidataParty] = {
    parlgovPartyId: m.parlgovPartyId,
    partyName: row.party_name_english ?? row.party_name,
    country: row.country_name_short,
    score,
    scale: "0 izquierda – 10 derecha",
    source: "ParlGov (Döring, Huber y Manow)",
    sourceUrl: `https://www.parlgov.org/`,
    retrievedAt: today(),
  };
}
writeJson("data/raw/parlgov/scores.json", out);
console.log(`✓ scores.json (${Object.keys(out).length} partidos)`);
