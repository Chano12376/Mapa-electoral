// Descarga 4 indicadores del Banco Mundial para los 30 países → data/raw/worldbank/{ISO3}.json
import { countries, writeJson, today, sleep, USER_AGENT } from "./lib.ts";

const INDICATORS = {
  gdpUsd: "NY.GDP.MKTP.CD",
  gdpGrowth: "NY.GDP.MKTP.KD.ZG",
  inflation: "FP.CPI.TOTL.ZG",
  unemployment: "SL.UEM.TOTL.ZS",
} as const;

const FROM = 2015;
const TO = new Date().getFullYear();

for (const c of countries()) {
  const out: Record<string, unknown> = {};
  for (const [key, code] of Object.entries(INDICATORS)) {
    const url = `https://api.worldbank.org/v2/country/${c.iso3}/indicator/${code}?format=json&date=${FROM}:${TO}&per_page=100`;
    let series: { year: number; value: number }[] = [];
    let meta: any = {};
    try {
      const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
      if (!res.ok) { console.warn(`⚠ ${c.iso3} ${key}: HTTP ${res.status} — sin datos`); await sleep(300); continue; }
      const json = (await res.json()) as [any, any[] | null];
      [meta] = json;
      series = (json[1] ?? [])
        .filter((r) => r.value !== null)
        .map((r) => ({ year: Number(r.date), value: r.value as number }))
        .sort((a, b) => a.year - b.year);
    } catch (e) {
      console.warn(`⚠ ${c.iso3} ${key}: error de red — sin datos`);
      await sleep(300);
      continue;
    }
    out[key] = {
      indicator: code,
      series,
      lastYear: series.at(-1)?.year ?? null,
      source: "Banco Mundial (World Development Indicators)",
      sourceUrl: `https://data.worldbank.org/indicator/${code}?locations=${c.iso3}`,
      sourceLastUpdated: meta?.lastupdated ?? null,
      retrievedAt: today(),
    };
    if (series.length === 0) console.warn(`⚠ ${c.iso3} ${key}: sin datos`);
    await sleep(150);
  }
  writeJson(`data/raw/worldbank/${c.iso3}.json`, out);
  console.log(`✓ ${c.iso3}`);
}
