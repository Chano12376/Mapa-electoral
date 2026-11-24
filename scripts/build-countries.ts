// Une todas las fuentes → public/data/countries/{ISO3}.json + public/data/calendar.json
// Regla: un campo sin source+sourceUrl se publica como null (el frontend muestra "Sin datos").
import { countries, readJson, writeJson, today } from "./lib.ts";

const leaders = readJson<any>("data/raw/wikidata/leaders.json", { countries: {} });
const overrides = readJson<Record<string, any>>("data/leaders.overrides.json", {});
const scores = readJson<Record<string, any>>("data/raw/parlgov/scores.json", {});
const { elections } = readJson<{ elections: any[] }>("data/elections.manual.json");

function office(iso3: string, key: "headOfState" | "headOfGovernment") {
  const o = overrides[iso3]?.[key];
  if (o) return { name: o.name, since: o.since, party: o.partyQid ? { qid: o.partyQid, name: o.partyName } : null,
                  source: o.source, sourceUrl: o.sourceUrl, retrievedAt: o.retrievedAt, reviewed: true };
  const cands = leaders.countries?.[iso3]?.[key] ?? [];
  if (cands.length !== 1) return null; // 0 o ambiguo → no se publica hasta que haya override
  const l = cands[0];
  return {
    name: l.name, since: l.since,
    party: l.parties.length === 1 ? l.parties[0] : null, // varios partidos = ambiguo → null
    source: "Wikidata", sourceUrl: `https://www.wikidata.org/wiki/${l.personQid}`,
    retrievedAt: leaders.retrievedAt, reviewed: false,
  };
}

const ideology = (o: any) => {
  const s = o?.party?.qid ? scores[o.party.qid] : null;
  return s && s.score !== null ? s : null;
};

const calendar: any[] = [];
const horizon = new Date(); horizon.setFullYear(horizon.getFullYear() + 1);

for (const c of countries()) {
  const wb = readJson<any>(`data/raw/worldbank/${c.iso3}.json`, {});
  const hos = office(c.iso3, "headOfState");
  const hog = office(c.iso3, "headOfGovernment");
  const e = elections.find((x) => x.iso3 === c.iso3);
  const nextElection = e?.sourceUrl && e.dateStatus !== "pendiente" ? e : null;

  writeJson(`public/data/countries/${c.iso3}.json`, {
    iso3: c.iso3, name: c.name, region: c.region,
    headOfState: hos, headOfGovernment: hog,
    // Ideología del partido de cada cargo, si ParlGov lo cubre. Nunca etiqueta textual.
    ideology: { headOfState: ideology(hos), headOfGovernment: ideology(hog) },
    nextElection,
    indicators: {
      gdpUsd: wb.gdpUsd ?? null, gdpGrowth: wb.gdpGrowth ?? null,
      inflation: wb.inflation ?? null, unemployment: wb.unemployment ?? null,
    },
    builtAt: today(),
  });

  if (nextElection?.date && new Date(nextElection.date) >= new Date(today()) && new Date(nextElection.date) <= horizon)
    calendar.push({ iso3: c.iso3, name: c.name, ...nextElection });
}

calendar.sort((a, b) => a.date.localeCompare(b.date));
writeJson("public/data/calendar.json", { builtAt: today(), elections: calendar });
console.log(`✓ ${countries().length} fichas, ${calendar.length} elecciones en los próximos 12 meses`);
