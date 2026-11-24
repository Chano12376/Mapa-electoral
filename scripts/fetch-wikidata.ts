// Jefe de Estado (P35) y de Gobierno (P6) vigentes + partido actual (P102) → data/raw/wikidata/leaders.json
// Wikidata va a veces con retraso: los conflictos se resuelven en data/leaders.overrides.json (con fuente).
import { countries, writeJson, today, USER_AGENT } from "./lib.ts";

const list = countries();
const values = list.map((c) => `wd:${c.wikidata}`).join(" ");

const query = `
SELECT ?country ?office ?person ?personLabel ?start ?party ?partyLabel WHERE {
  VALUES ?country { ${values} }
  {
    ?country p:P35 ?st . ?st ps:P35 ?person . BIND("headOfState" AS ?office)
  } UNION {
    ?country p:P6 ?st . ?st ps:P6 ?person . BIND("headOfGovernment" AS ?office)
  }
  ?st wikibase:rank ?rank . FILTER(?rank != wikibase:DeprecatedRank)
  FILTER NOT EXISTS { ?st pq:P582 ?end }
  OPTIONAL { ?st pq:P580 ?start }
  OPTIONAL {
    ?person p:P102 ?ps . ?ps ps:P102 ?party .
    FILTER NOT EXISTS { ?ps pq:P582 ?partyEnd }
  }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "es,en". }
}`;

const res = await fetch("https://query.wikidata.org/sparql", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/sparql-results+json",
    "User-Agent": USER_AGENT,
  },
  body: new URLSearchParams({ query }),
});
if (!res.ok) throw new Error(`Wikidata HTTP ${res.status}`);
const json = (await res.json()) as any;

const qid = (uri?: string) => uri?.split("/").pop() ?? null;
type Leader = { name: string; personQid: string; since: string | null; parties: { qid: string; name: string }[] };
const result: Record<string, { headOfState: Leader[]; headOfGovernment: Leader[] }> = {};
for (const c of list) result[c.iso3] = { headOfState: [], headOfGovernment: [] };

for (const b of json.results.bindings) {
  const iso3 = list.find((c) => c.wikidata === qid(b.country.value))!.iso3;
  const bucket = result[iso3][b.office.value as "headOfState" | "headOfGovernment"];
  const personQid = qid(b.person.value)!;
  let leader = bucket.find((l) => l.personQid === personQid);
  if (!leader) {
    leader = { name: b.personLabel.value, personQid, since: b.start?.value?.slice(0, 10) ?? null, parties: [] };
    bucket.push(leader);
  }
  if (b.party && !leader.parties.some((p) => p.qid === qid(b.party.value)))
    leader.parties.push({ qid: qid(b.party.value)!, name: b.partyLabel.value });
}

// Avisos para revisión manual
for (const [iso3, r] of Object.entries(result)) {
  for (const office of ["headOfState", "headOfGovernment"] as const) {
    const n = r[office].length;
    if (n === 0) console.warn(`⚠ ${iso3} ${office}: sin titular vigente en Wikidata`);
    if (n > 1) console.warn(`⚠ ${iso3} ${office}: ${n} titulares "vigentes" → revisar y fijar en overrides`);
    for (const l of r[office]) if (l.parties.length > 1) console.warn(`⚠ ${iso3} ${l.name}: varios partidos → revisar`);
  }
}

writeJson("data/raw/wikidata/leaders.json", {
  source: "Wikidata",
  sourceUrl: "https://query.wikidata.org/",
  retrievedAt: today(),
  countries: result,
});
console.log("✓ leaders.json");
