import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname } from "node:path";

export type Country = { iso3: string; name: string; wikidata: string; region: string; parlgov: boolean };

/** Todo dato publicado lleva fuente y fecha de consulta. Sin fuente → no se publica. */
export type Sourced<T> = { value: T; source: string; sourceUrl: string; retrievedAt: string };

export const today = () => new Date().toISOString().slice(0, 10);

export function readJson<T>(path: string, fallback?: T): T {
  if (!existsSync(path)) {
    if (fallback !== undefined) return fallback;
    throw new Error(`Falta ${path}`);
  }
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

export function writeJson(path: string, data: unknown) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
}

export const countries = () => readJson<Country[]>("data/countries.json");

export const USER_AGENT = "mapa-electoral/0.1 (proyecto personal; contacto: CAMBIAR@ejemplo.com)";

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
