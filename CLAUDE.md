# Proyecto: Mapa electoral mundial (nombre provisional)

## Qué es
Web visual para ver de un vistazo, país por país:
- Cuándo son las próximas elecciones (calendario + cuenta atrás)
- Quién gobierna (jefe de Estado, jefe de Gobierno, partido, desde cuándo)
- Posición ideológica del partido en el poder (solo con fuente académica)
- Indicadores básicos (PIB, crecimiento, inflación, paro) con tendencia

Versión 1: 30 países. Se amplía después.

## Principios (no negociables)
1. **Cada dato lleva su fuente y fecha de actualización visibles.** Si no hay fuente, el dato no se muestra.
2. **Neutralidad.** Nunca etiquetar "izquierda/derecha" a mano. Solo una escala numérica de una fuente académica (ParlGov), citada. Si no hay dato: "Sin datos".
3. **Los datos van separados del código.** Los scripts generan JSON estáticos; el frontend solo lee esos JSON.
4. **Primero funcional, después bonito.** Nada de animaciones hasta que los 30 países tengan datos correctos.

## Stack
- Vite + React + TypeScript
- Mapa: `react-simple-maps` + TopoJSON de `world-atlas` (sin claves de API)
- Estilos: Tailwind
- Sin backend: JSON estáticos en `/public/data/`
- Despliegue: Vercel o Netlify (gratis)

## Estructura
```
/scripts
  fetch-worldbank.ts     # indicadores económicos
  fetch-wikidata.ts      # jefe de Estado/Gobierno y partido
  fetch-parlgov.ts       # ideología (escala 0-10), solo países cubiertos
  build-countries.ts     # une todo en /public/data/countries/{ISO3}.json
/data
  elections.manual.json  # calendario electoral curado a mano, con URL de fuente por entrada
  countries.json         # lista de los 30 países (ISO3, nombre ES)
/public/data
  countries/{ISO3}.json
  calendar.json
/src
  pages: Mapa (home), Calendario, FichaPais
```

## Esquema de cada país (`{ISO3}.json`)
```json
{
  "iso3": "ESP",
  "name": "España",
  "regime": "Democracia parlamentaria",
  "headOfState": { "name": "", "party": null, "since": "", "source": "" },
  "headOfGovernment": { "name": "", "party": "", "since": "", "source": "" },
  "ideology": { "score": 3.5, "scale": "0 izquierda – 10 derecha", "source": "ParlGov", "sourceUrl": "" },
  "nextElection": { "date": "2026-11-29", "type": "Generales", "whatIsElected": "Congreso y Senado", "source": "" },
  "indicators": {
    "gdpUsd": { "series": [{ "year": 2020, "value": 0 }], "source": "World Bank" },
    "gdpGrowth": {}, "inflation": {}, "unemployment": {}
  },
  "updatedAt": "2026-11-20"
}
```

## Fuentes de datos
- **Banco Mundial API** (gratis, sin clave): `https://api.worldbank.org/v2/country/{ISO3}/indicator/{CODE}?format=json`
  - PIB: `NY.GDP.MKTP.CD` · Crecimiento: `NY.GDP.MKTP.KD.ZG` · Inflación: `FP.CPI.TOTL.ZG` · Paro: `SL.UEM.TOTL.ZS`
- **Wikidata SPARQL** (`https://query.wikidata.org/sparql`): jefe de Estado (P35), jefe de Gobierno (P6), partido de la persona (P102). Revisar a mano: Wikidata a veces va con retraso.
- **ParlGov** (descarga CSV): escala `left_right` 0–10. Cubre UE/OCDE; resto = sin datos.
- **Calendario electoral**: a mano en `elections.manual.json` para la v1 (30 países es manejable), cada entrada con URL de fuente oficial o ElectionGuide (IFES).

## Los 30 países de la v1
América: EE. UU., Canadá, México, Brasil, Argentina, Colombia, Chile, Perú
Europa: España, Portugal, Francia, Alemania, Italia, Reino Unido, Países Bajos, Polonia, Suecia, Ucrania, Turquía, Rusia
Asia-Pacífico: China, India, Japón, Corea del Sur, Indonesia, Australia
Oriente Medio y África: Arabia Saudí, Egipto, Nigeria, Sudáfrica

Países sin elecciones competitivas (China, Arabia Saudí…): mostrarlo explícitamente en la ficha en lugar de inventar un calendario.

## Fases
1. **Datos**: scripts + `elections.manual.json` para los 30 países. Validar a mano 5 países al azar.
2. **Mapa**: home con mapa mundial, países coloreados según días hasta la próxima elección; clic → ficha.
3. **Ficha de país**: una pantalla, con fuentes visibles.
4. **Calendario**: lista cronológica de los próximos 12 meses con cuenta atrás.
5. **Deploy** + script de actualización diaria (GitHub Action).
6. Solo después: diseño, más países, encuestas.
## Fase 1 — estado y reglas de implementación (añadido 2026-11-20)
Comandos: `npm install` → `npm run data` (fetch Banco Mundial + Wikidata + ParlGov → build → validate).

Reglas adicionales:
- **Cada campo publicado lleva `source`, `sourceUrl` y `retrievedAt`/`checkedAt`** (no basta un `updatedAt` global). `npm run validate` falla si alguno falta.
- **Ambigüedad = no publicar.** Si Wikidata devuelve 0 o >1 titulares vigentes, o varios partidos, el campo sale `null` hasta que se fije en `data/leaders.overrides.json` (con fuente).
- **Ideología:** se calcula para el partido de cada cargo (jefe de Estado y de Gobierno) por separado; no se elige "el ejecutivo principal" a mano. ParlGov cubre solo 13 de los 30 (CAN, ESP, PRT, FRA, DEU, ITA, GBR, NLD, POL, SWE, TUR, JPN, AUS). El cruce partido Wikidata → `party_id` de ParlGov va a mano en `data/parlgov-party-map.json` con URL de la ficha ParlGov.
- **ParlGov CSV:** descarga manual de `view_party` desde parlgov.org/data a `data/raw/parlgov/view_party.csv`.
- **Calendario:** `dateStatus` ∈ confirmada | prevista | limite_legal | sin_eleccion_nacional_directa | pendiente. La cuenta atrás solo se muestra para `confirmada`/`prevista`; `limite_legal` se muestra como "a más tardar".
- **No etiquetar a mano "elecciones no competitivas".** Se registra el hecho (próxima elección o "sin elección nacional directa") con fuente. Si se quiere calificar el régimen, solo con fuente académica (p. ej. V-Dem, Regimes of the World), igual que la ideología.
- Validación manual: 5 países al azar + todos los que tengan aviso ⚠ en la salida de los scripts.
