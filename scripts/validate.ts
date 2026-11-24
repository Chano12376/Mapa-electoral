// Comprueba el principio nº1 (todo dato publicado tiene fuente y fecha) e imprime la cobertura por país.
// Sale con código 1 si algún dato publicado no tiene fuente → sirve de check en la GitHub Action.
import { countries, readJson } from "./lib.ts";

let errors = 0;
const rows: Record<string, string>[] = [];
const has = (x: any) => (x ? "✓" : "·");

function checkSourced(iso3: string, path: string, x: any) {
  if (x && (!x.source || !x.sourceUrl || !(x.retrievedAt || x.checkedAt))) {
    console.error(`✗ ${iso3} ${path}: dato sin fuente/fecha`); errors++;
  }
}

for (const c of countries()) {
  const f = readJson<any>(`public/data/countries/${c.iso3}.json`);
  checkSourced(c.iso3, "headOfState", f.headOfState);
  checkSourced(c.iso3, "headOfGovernment", f.headOfGovernment);
  checkSourced(c.iso3, "nextElection", f.nextElection);
  for (const [k, v] of Object.entries(f.indicators)) checkSourced(c.iso3, `indicators.${k}`, v);
  for (const [k, v] of Object.entries(f.ideology)) checkSourced(c.iso3, `ideology.${k}`, v);

  rows.push({
    País: c.iso3,
    "J.Estado": has(f.headOfState), "J.Gob": has(f.headOfGovernment),
    "Partido JG": has(f.headOfGovernment?.party), Ideología: has(f.ideology.headOfGovernment || f.ideology.headOfState),
    Elección: has(f.nextElection),
    PIB: f.indicators.gdpUsd?.lastYear ?? "·", Paro: f.indicators.unemployment?.lastYear ?? "·",
    Revisado: f.headOfGovernment?.reviewed ? "sí" : "no",
  });
}
console.table(rows);
if (errors) { console.error(`\n${errors} datos sin fuente.`); process.exit(1); }
console.log("\nOK: todo dato publicado tiene fuente y fecha.");
