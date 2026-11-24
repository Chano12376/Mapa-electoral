import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CountryData, Leader, Indicator, ElectionResult, PartyResult, DemocracyIndices, CountryPolls } from "../types.ts";

const FLAG: Record<string, string> = {
  USA:"🇺🇸",CAN:"🇨🇦",MEX:"🇲🇽",BRA:"🇧🇷",ARG:"🇦🇷",COL:"🇨🇴",CHL:"🇨🇱",PER:"🇵🇪",
  VEN:"🇻🇪",ECU:"🇪🇨",BOL:"🇧🇴",URY:"🇺🇾",PRY:"🇵🇾",CRI:"🇨🇷",CUB:"🇨🇺",DOM:"🇩🇴",GTM:"🇬🇹",
  ESP:"🇪🇸",PRT:"🇵🇹",FRA:"🇫🇷",DEU:"🇩🇪",ITA:"🇮🇹",GBR:"🇬🇧",NLD:"🇳🇱",POL:"🇵🇱",
  SWE:"🇸🇪",UKR:"🇺🇦",TUR:"🇹🇷",RUS:"🇷🇺",BEL:"🇧🇪",AUT:"🇦🇹",CHE:"🇨🇭",NOR:"🇳🇴",
  DNK:"🇩🇰",GRC:"🇬🇷",HUN:"🇭🇺",ROU:"🇷🇴",FIN:"🇫🇮",CZE:"🇨🇿",SVK:"🇸🇰",BGR:"🇧🇬",
  HRV:"🇭🇷",SRB:"🇷🇸",MDA:"🇲🇩",BLR:"🇧🇾",
  CHN:"🇨🇳",IND:"🇮🇳",JPN:"🇯🇵",KOR:"🇰🇷",IDN:"🇮🇩",AUS:"🇦🇺",PAK:"🇵🇰",THA:"🇹🇭",PHL:"🇵🇭",IRN:"🇮🇷",
  VNM:"🇻🇳",MYS:"🇲🇾",BGD:"🇧🇩",NZL:"🇳🇿",SGP:"🇸🇬",KAZ:"🇰🇿",MMR:"🇲🇲",
  ISR:"🇮🇱",SAU:"🇸🇦",EGY:"🇪🇬",NGA:"🇳🇬",ZAF:"🇿🇦",MAR:"🇲🇦",ETH:"🇪🇹",KEN:"🇰🇪",
  IRQ:"🇮🇶",JOR:"🇯🇴",ARE:"🇦🇪",TUN:"🇹🇳",LBN:"🇱🇧",DZA:"🇩🇿",TZA:"🇹🇿",GHA:"🇬🇭",SEN:"🇸🇳",ZWE:"🇿🇼",
};

// Colores conocidos de partidos por nombre/sigla
const PARTY_COLORS: Record<string, string> = {
  // España
  "PSOE": "#E4000F", "PP": "#1B4BA0", "VOX": "#63BE21", "Sumar": "#C94082",
  // Alemania
  "SPD": "#E3000F", "CDU": "#000000", "CSU": "#0570C9", "CDU/CSU": "#0570C9",
  "AfD": "#009EE0", "Grüne": "#64A12D", "FDP": "#FFED00", "BSW": "#7B2D8B",
  // Francia
  "RN": "#071461", "Renaissance": "#FFEB00", "LFI": "#CC2443",
  // UK
  "Labour": "#E4003B", "Conservative": "#0087DC", "Reform UK": "#12B6CF", "Lib Dems": "#FAA61A",
  "Liberal Democrats": "#FAA61A",
  // Polonia
  "PiS": "#003E8C", "KO": "#F05A23", "TD": "#9E5FA5",
  // Partidos comunistas/únicos
  "PCVn": "#DA251D", "PCCh": "#DE2910", "ZANU-PF": "#006400",
  // Otros
  "AKP": "#FFA500", "Fidesz": "#FF6600", "PSD": "#E42B1E", "PNL": "#FFDD00",
};

function partyColor(partyName: string | null | undefined): string {
  if (!partyName) return "#6366f1";
  for (const [key, color] of Object.entries(PARTY_COLORS)) {
    if (partyName.includes(key)) return color;
  }
  return "#6366f1";
}

function useLeaderPhoto(name: string | null) {
  const [photo, setPhoto] = useState<string | null>(null);
  useEffect(() => {
    if (!name) return;
    const encoded = encodeURIComponent(name.trim());
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const url = d?.thumbnail?.source ?? null;
        setPhoto(url);
      })
      .catch(() => {});
  }, [name]);
  return photo;
}

type Tab = "politica" | "resultados" | "sondeos" | "economia";

const TABS: { key: Tab; label: string }[] = [
  { key: "politica", label: "Política" },
  { key: "resultados", label: "Resultados" },
  { key: "sondeos", label: "Sondeos" },
  { key: "economia", label: "Economía" },
];

function latestValue(ind: Indicator | null) {
  if (!ind?.series?.length) return null;
  return ind.series.reduce((a, b) => (a.year > b.year ? a : b));
}

function daysUntil(dateStr: string): number {
  return Math.ceil(
    (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
}

function ElectionBadge({ status, days }: { status: string; days: number }) {
  if (status === "limite_legal") return <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">a más tardar</span>;
  if (days <= 30)  return <span className="text-xs bg-red-900 text-red-300 px-2 py-0.5 rounded-full font-semibold">¡{days} días!</span>;
  if (days <= 90)  return <span className="text-xs bg-red-900/60 text-red-300 px-2 py-0.5 rounded-full">{days} días</span>;
  if (days <= 180) return <span className="text-xs bg-orange-900/60 text-orange-300 px-2 py-0.5 rounded-full">{days} días</span>;
  return <span className="text-xs bg-yellow-900/40 text-yellow-300 px-2 py-0.5 rounded-full">{days} días</span>;
}

function LeaderCard({ title, leader }: { title: string; leader: Leader | null }) {
  const photo = useLeaderPhoto(leader?.name ?? null);
  if (!leader) return (
    <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-5">
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">{title}</p>
      <p className="text-gray-500 italic text-sm">Sin datos</p>
    </div>
  );
  const color = partyColor(leader.party?.name);
  return (
    <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-5 hover:border-gray-500 transition-colors">
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">{title}</p>
      <div className="flex items-center gap-3 mb-3">
        {photo ? (
          <img
            src={photo}
            alt={leader.name}
            className="w-14 h-14 rounded-full object-cover object-top border-2 border-gray-600 shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center shrink-0 text-2xl select-none">
            👤
          </div>
        )}
        <div className="min-w-0">
          <p className="font-bold text-lg text-white leading-tight">{leader.name}</p>
          {leader.since && <p className="text-gray-400 text-xs mt-0.5">Desde <strong className="text-gray-300">{leader.since}</strong></p>}
        </div>
      </div>
      {leader.party && (
        <span
          className="inline-block mt-1 text-white text-xs px-2.5 py-1 rounded-full font-medium"
          style={{ backgroundColor: color + "cc", border: `1px solid ${color}` }}
        >
          {leader.party.name}
        </span>
      )}
      <a
        href={leader.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-600 text-xs hover:text-indigo-400 mt-3 inline-flex items-center gap-1 transition-colors"
      >
        ↗ {leader.source} · {leader.retrievedAt}
      </a>
    </div>
  );
}

function IdeologyBar({ score, source, sourceUrl }: { score: number; source: string; sourceUrl: string }) {
  const pct = (score / 10) * 100;
  const color = score <= 3.5 ? "bg-blue-500" : score <= 6.5 ? "bg-purple-500" : "bg-red-500";
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-gray-400">Izquierda</span>
        <span className="font-bold text-lg tabular-nums">{score.toFixed(1)}<span className="text-gray-500 text-sm font-normal"> / 10</span></span>
        <span className="text-xs text-gray-400">Derecha</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-3 relative">
        <div className={`h-3 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
        <div className="absolute top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gray-500" style={{ left: "50%" }} />
      </div>
      <a href={sourceUrl} target="_blank" rel="noopener noreferrer"
        className="text-gray-600 text-xs hover:text-indigo-400 mt-1.5 inline-block transition-colors">
        ↗ {source}
      </a>
    </div>
  );
}

function StatCard({ label, value, year, source }: { label: string; value: string | null; year?: number; source?: string }) {
  return (
    <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-5">
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">{label}</p>
      {value ? (
        <>
          <p className="font-bold text-2xl text-white">{value}</p>
          {year && <p className="text-gray-500 text-xs mt-1">{year} · {source}</p>}
        </>
      ) : (
        <p className="text-gray-500 italic text-sm">Sin datos</p>
      )}
    </div>
  );
}

function MiniChart({ ind, color = "#6366f1" }: { ind: Indicator | null; color?: string }) {
  if (!ind?.series?.length || ind.series.length < 2) return null;
  const sorted = [...ind.series].sort((a, b) => a.year - b.year).slice(-10);
  const vals = sorted.map((s) => s.value);
  const minVal = Math.min(...vals);
  const maxVal = Math.max(...vals);
  const hasNegative = minVal < 0;
  const pad = (maxVal - minVal) * 0.15 || 0.5;
  const lo = minVal - pad, hi = maxVal + pad;
  const range = hi - lo;
  const W = 300, H = 60, LBL = 32;
  const chartW = W - LBL;

  function px(i: number) { return LBL + (i / (sorted.length - 1)) * chartW; }
  function py(v: number) { return H - ((v - lo) / range) * H; }

  const linePts = sorted.map((s, i) => `${px(i)},${py(s.value)}`).join(" ");
  const areaPts = `${px(0)},${H} ${linePts} ${px(sorted.length - 1)},${H}`;
  const zeroY = hasNegative ? py(0) : null;

  const last = sorted[sorted.length - 1];
  const trend = sorted.length >= 2 ? sorted[sorted.length - 1].value - sorted[sorted.length - 2].value : 0;
  const trendArrow = trend > 0.05 ? "▲" : trend < -0.05 ? "▼" : "▬";
  const trendColor = trend > 0.05 ? "#34d399" : trend < -0.05 ? "#f87171" : "#9ca3af";

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-2xl font-black text-white">{last.value.toFixed(1)}<span className="text-sm font-normal text-gray-400 ml-1">%</span></span>
        <span className="text-sm font-semibold" style={{ color: trendColor }}>{trendArrow} {Math.abs(trend).toFixed(1)} pp</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 72 }}>
        {/* Zero line */}
        {zeroY !== null && (
          <line x1={LBL} y1={zeroY} x2={W} y2={zeroY} stroke="#4b5563" strokeWidth="1" strokeDasharray="4,3" />
        )}
        {/* Area fill */}
        <polygon points={areaPts} fill={color} fillOpacity="0.12" />
        {/* Line */}
        <polyline points={linePts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {/* Year labels (first & last) */}
        <text x={LBL} y={H} dy="14" fontSize="9" fill="#6b7280" textAnchor="middle">{sorted[0].year}</text>
        <text x={W} y={H} dy="14" fontSize="9" fill="#6b7280" textAnchor="end">{last.year}</text>
        {/* Dot on last point */}
        <circle cx={px(sorted.length - 1)} cy={py(last.value)} r="3.5" fill={color} />
        {/* Y-axis labels */}
        <text x={LBL - 4} y={py(maxVal)} dy="4" fontSize="9" fill="#6b7280" textAnchor="end">{maxVal.toFixed(1)}</text>
        <text x={LBL - 4} y={py(minVal)} dy="4" fontSize="9" fill="#6b7280" textAnchor="end">{minVal.toFixed(1)}</text>
      </svg>
    </div>
  );
}

export default function FichaPais() {
  const { iso3 } = useParams<{ iso3: string }>();
  const [data, setData] = useState<CountryData | null>(null);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<Tab>("politica");
  const [electionResult, setElectionResult] = useState<ElectionResult | null>(null);
  const [democracyIndices, setDemocracyIndices] = useState<DemocracyIndices | null>(null);
  const [polls, setPolls] = useState<CountryPolls | null>(null);

  useEffect(() => {
    if (!iso3) return;
    setData(null); setError(false);
    fetch(`/data/countries/${iso3.toUpperCase()}.json`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setData)
      .catch(() => setError(true));
  }, [iso3]);

  useEffect(() => {
    if (!iso3) return;
    fetch("/data/election-results.json")
      .then((r) => r.json())
      .then((all: Record<string, ElectionResult>) => {
        setElectionResult(all[iso3.toUpperCase()] ?? null);
      })
      .catch(() => {});
  }, [iso3]);

  useEffect(() => {
    if (!iso3) return;
    fetch("/data/democracy-indices.json")
      .then((r) => r.json())
      .then((all: Record<string, DemocracyIndices>) => {
        setDemocracyIndices(all[iso3.toUpperCase()] ?? null);
      })
      .catch(() => {});
  }, [iso3]);

  useEffect(() => {
    if (!iso3) return;
    fetch("/data/polls.json")
      .then((r) => r.json())
      .then((all: Record<string, CountryPolls>) => {
        setPolls(all[iso3.toUpperCase()] ?? null);
      })
      .catch(() => {});
  }, [iso3]);

  if (error) return (
    <div className="p-12 text-center">
      <p className="text-4xl mb-4">🌍</p>
      <p className="text-gray-400 text-lg">País no encontrado.</p>
      <Link to="/" className="text-indigo-400 hover:underline mt-3 inline-block">← Volver al mapa</Link>
    </div>
  );
  if (!data) return (
    <div className="p-12 flex items-center justify-center gap-3 text-gray-500">
      <div className="w-5 h-5 border-2 border-gray-600 border-t-indigo-500 rounded-full animate-spin" />
      Cargando…
    </div>
  );

  const fmtGdp = (v: number) => v >= 1e12 ? `$${(v / 1e12).toFixed(2)} B` : `$${(v / 1e9).toFixed(1)} MM`;
  const fmtPct = (v: number) => `${v.toFixed(1)} %`;

  const gdp  = latestValue(data.indicators.gdpUsd);
  const grow = latestValue(data.indicators.gdpGrowth);
  const inf  = latestValue(data.indicators.inflation);
  const une  = latestValue(data.indicators.unemployment);

  const election = data.nextElection;
  const days = election ? daysUntil(election.date) : null;

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      {/* Back */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-sm mb-6 transition-colors">
        ← Volver al mapa
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-5">
          <div className="shrink-0"><FlagImg iso3={data.iso3} size={80} /></div>
          <div className="min-w-0">
            <h1 className="text-4xl font-black text-white tracking-tight leading-tight">{data.name}</h1>
            <p className="text-indigo-400 text-sm mt-1 font-medium">{data.region}</p>
            {data.regime && (
              <span className="inline-block mt-2 text-xs bg-gray-800 border border-gray-700 text-gray-400 px-2.5 py-1 rounded-full">
                {data.regime}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Próxima elección */}
      {election && days !== null && days >= 0 ? (
        <div className={`rounded-2xl p-5 mb-6 border ${
          days <= 90  ? "bg-red-950/40 border-red-800" :
          days <= 180 ? "bg-orange-950/40 border-orange-800" :
                        "bg-indigo-950/40 border-indigo-800"
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Próxima elección</p>
              <p className="font-bold text-lg text-white">{election.type}</p>
              <p className="text-gray-300 text-sm">{election.whatIsElected}</p>
              <p className="text-gray-400 text-sm mt-1 font-mono">{election.date}</p>
              <a href={election.sourceUrl} target="_blank" rel="noopener noreferrer"
                className="text-gray-600 text-xs hover:text-indigo-400 mt-2 inline-block transition-colors">
                ↗ {election.source}
              </a>
            </div>
            <div className="shrink-0 text-right">
              <ElectionBadge status={election.dateStatus} days={days} />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800/40 border border-gray-700 rounded-2xl p-5 mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Próxima elección</p>
          <p className="text-gray-500 italic text-sm">
            {election?.dateStatus === "sin_eleccion_nacional_directa"
              ? "Sin elección nacional directa"
              : election?.dateStatus === "pendiente"
              ? "Pendiente (situación especial)"
              : "Sin datos registrados"}
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-800 pb-0">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${
              tab === key
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "sondeos" && (
        <div>
          {polls ? (
            <PollsTab polls={polls} />
          ) : (
            <div className="bg-gray-800/40 border border-gray-700 rounded-2xl p-8 text-center">
              <p className="text-3xl mb-3">📊</p>
              <p className="text-gray-400">Sin sondeos registrados para este país.</p>
            </div>
          )}
        </div>
      )}

      {tab === "resultados" && (
        <div>
          {electionResult ? (
            <ResultsTab result={electionResult} />
          ) : (
            <div className="bg-gray-800/40 border border-gray-700 rounded-2xl p-8 text-center">
              <p className="text-3xl mb-3">🗳️</p>
              <p className="text-gray-400">Sin resultados electorales registrados para este país.</p>
            </div>
          )}
        </div>
      )}

      {tab === "politica" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LeaderCard title="Jefe de Estado" leader={data.headOfState} />
            <LeaderCard title="Jefe de Gobierno" leader={data.headOfGovernment} />
          </div>

          {(data.ideology.headOfState || data.ideology.headOfGovernment) && (
            <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-5">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Posición ideológica</p>
              <p className="text-xs text-gray-600 mb-4">Escala 0–10 · Fuente académica ParlGov · Sin etiqueta editorial</p>
              {data.ideology.headOfState && (
                <div className="mb-4">
                  <p className="text-sm text-gray-300 mb-2 font-medium">Partido del Jefe de Estado</p>
                  <IdeologyBar {...data.ideology.headOfState} />
                </div>
              )}
              {data.ideology.headOfGovernment && (
                <div>
                  <p className="text-sm text-gray-300 mb-2 font-medium">Partido del Jefe de Gobierno</p>
                  <IdeologyBar {...data.ideology.headOfGovernment} />
                </div>
              )}
            </div>
          )}

          {democracyIndices && <DemocracyCard indices={democracyIndices} />}
        </div>
      )}

      {tab === "economia" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard label="PIB" value={gdp ? fmtGdp(gdp.value) : null} year={gdp?.year} source={data.indicators.gdpUsd?.source} />
            <StatCard label="Crecimiento PIB" value={grow ? fmtPct(grow.value) : null} year={grow?.year} source={data.indicators.gdpGrowth?.source} />
            <StatCard label="Inflación" value={inf ? fmtPct(inf.value) : null} year={inf?.year} source={data.indicators.inflation?.source} />
            <StatCard label="Desempleo" value={une ? fmtPct(une.value) : null} year={une?.year} source={data.indicators.unemployment?.source} />
          </div>

          {/* Mini gráficos de tendencia */}
          {[
            { label: "Crecimiento PIB", ind: data.indicators.gdpGrowth, color: "#34d399" },
            { label: "Inflación", ind: data.indicators.inflation, color: "#f87171" },
            { label: "Desempleo", ind: data.indicators.unemployment, color: "#fb923c" },
          ].map(({ label, ind, color }) => ind?.series?.length && ind.series.length >= 2 ? (
            <div key={label} className="bg-gray-800/60 border border-gray-700 rounded-2xl p-5">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">{label} · últimos años</p>
              <MiniChart ind={ind} color={color} />
              <p className="text-xs text-gray-600 mt-3">Fuente: {ind.source}</p>
            </div>
          ) : null)}
        </div>
      )}

      <p className="text-gray-700 text-xs mt-10">Datos generados: {data.builtAt}</p>
    </main>
  );
}

function PartyBar({ p, seatsLabel }: { p: PartyResult; seatsLabel?: string }) {
  return (
    <div className="mb-3">
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
          <span
            className="w-3 h-3 rounded-sm shrink-0 mt-0.5"
            style={{ background: p.color }}
          />
          <span
            className="text-sm text-gray-200 font-medium leading-tight"
            title={p.fullName}
          >
            {p.fullName ?? p.name}
          </span>
          {p.candidate && (
            <span className="text-xs text-gray-500">({p.candidate})</span>
          )}
          {p.inGovt && (
            <span className="text-xs bg-indigo-900/50 text-indigo-400 border border-indigo-800 px-1.5 py-0.5 rounded-full shrink-0">
              ● Gobierno
            </span>
          )}
        </div>
        <div className="text-right shrink-0 ml-2">
          <span className="font-bold text-sm tabular-nums">{p.votePct.toFixed(1)}%</span>
          {p.seats != null && (
            <span className="text-xs text-gray-500 ml-1.5 tabular-nums">
              {p.seats} {seatsLabel ?? "esc."}
            </span>
          )}
        </div>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2.5">
        <div
          className="h-2.5 rounded-full transition-all"
          style={{ width: `${p.votePct}%`, background: p.color, opacity: 0.85 }}
        />
      </div>
    </div>
  );
}

function ResultsTab({ result }: { result: ElectionResult }) {
  return (
    <div className="bg-gray-800/40 border border-gray-700 rounded-2xl p-6">
      {/* Header */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-sm text-gray-400">
        <span className="font-medium text-white">{result.electionType}</span>
        <span>📅 {result.electionDate}</span>
        {result.turnoutPct != null && (
          <span>Participación: <strong className="text-gray-200">{result.turnoutPct}%</strong></span>
        )}
        {result.totalSeats != null && (
          <span>Total {result.seatsLabel ?? "escaños"}: <strong className="text-gray-200">{result.totalSeats}</strong></span>
        )}
      </div>

      {result.note && (
        <p className="text-xs text-amber-500/80 bg-amber-950/30 border border-amber-900/40 rounded-xl px-3 py-2 mb-5 leading-relaxed">
          ⚠ {result.note}
        </p>
      )}

      {/* Bars */}
      <div className="space-y-1">
        {result.parties.map((p) => (
          <PartyBar key={p.name} p={p} seatsLabel={result.seatsLabel} />
        ))}
      </div>

      {/* Source */}
      <a
        href={result.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-gray-600 hover:text-indigo-400 mt-5 inline-flex items-center gap-1 transition-colors"
      >
        ↗ {result.source} · {result.retrievedAt}
      </a>
    </div>
  );
}

const FH_STATUS_STYLES: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  "Free":        { bg: "bg-emerald-900/30", border: "border-emerald-700", text: "text-emerald-300", dot: "bg-emerald-400" },
  "Partly Free": { bg: "bg-yellow-900/30",  border: "border-yellow-700",  text: "text-yellow-300",  dot: "bg-yellow-400" },
  "Not Free":    { bg: "bg-red-900/30",     border: "border-red-800",     text: "text-red-400",     dot: "bg-red-500" },
};

const FH_STATUS_ES: Record<string, string> = {
  "Free": "Libre", "Partly Free": "Parcialmente Libre", "Not Free": "No Libre",
};

const EIU_CAT_ES: Record<string, string> = {
  "Full democracy": "Democracia plena",
  "Flawed democracy": "Democracia defectuosa",
  "Hybrid regime": "Régimen híbrido",
  "Authoritarian": "Autoritario",
};

function DemocracyCard({ indices }: { indices: DemocracyIndices }) {
  const fh = indices.freedomHouse;
  const eiu = indices.eiu;
  const fhStyle = fh ? (FH_STATUS_STYLES[fh.status] ?? FH_STATUS_STYLES["Not Free"]) : null;

  return (
    <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-5">
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Índices de democracia</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fh && fhStyle && (
          <div className={`border rounded-xl p-4 ${fhStyle.bg} ${fhStyle.border}`}>
            <p className="text-xs text-gray-500 mb-1">Freedom House {fh.year}</p>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${fhStyle.dot}`} />
              <span className={`font-semibold text-sm ${fhStyle.text}`}>{FH_STATUS_ES[fh.status]}</span>
            </div>
            <p className="text-2xl font-bold text-white">{fh.score}<span className="text-sm font-normal text-gray-500">/100</span></p>
            <div className="mt-2 text-xs text-gray-500 flex gap-3">
              <span>Der. políticos: <strong className="text-gray-300">{fh.politicalRights}/40</strong></span>
              <span>Lib. civiles: <strong className="text-gray-300">{fh.civilLiberties}/60</strong></span>
            </div>
            <div className="mt-2 w-full bg-gray-900/60 rounded-full h-1.5">
              <div className={`h-1.5 rounded-full ${fhStyle.dot}`} style={{ width: `${fh.score}%` }} />
            </div>
            <a href={fh.sourceUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-gray-600 hover:text-indigo-400 mt-3 inline-flex items-center gap-1 transition-colors">
              ↗ freedomhouse.org · {fh.retrievedAt}
            </a>
          </div>
        )}

        {eiu && (
          <div className="border border-gray-700 bg-gray-900/40 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">EIU Democracy Index {eiu.year}</p>
            <p className="text-sm text-gray-400 mb-2">{EIU_CAT_ES[eiu.category] ?? eiu.category}</p>
            <p className="text-2xl font-bold text-white">{eiu.score.toFixed(2)}<span className="text-sm font-normal text-gray-500">/10</span></p>
            <p className="text-xs text-gray-500 mt-1">Puesto {eiu.rank} de 167</p>
            <div className="mt-2 w-full bg-gray-900/60 rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-indigo-500" style={{ width: `${(eiu.score / 10) * 100}%` }} />
            </div>
            <a href={eiu.sourceUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-gray-600 hover:text-indigo-400 mt-3 inline-flex items-center gap-1 transition-colors">
              ↗ eiu.com · {eiu.retrievedAt}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function PollsTab({ polls }: { polls: CountryPolls }) {
  return (
    <div className="space-y-5">
      {polls.note && (
        <p className="text-xs text-gray-500 leading-relaxed px-1">{polls.note}</p>
      )}
      {polls.polls.map((poll, i) => (
        <div key={i} className="bg-gray-800/40 border border-gray-700 rounded-2xl p-6">
          <div className="flex flex-wrap gap-x-4 gap-y-1 mb-5 text-sm text-gray-400">
            <span className="font-medium text-white">{poll.pollster}</span>
            <span>📅 {poll.fieldwork}</span>
            {poll.sampleSize && <span>n={poll.sampleSize.toLocaleString()}</span>}
          </div>

          {poll.votingIntention && poll.votingIntention.length > 0 && (
            <div className="mb-5">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Intención de voto</p>
              {poll.votingIntention
                .slice()
                .sort((a, b) => b.pct - a.pct)
                .map((p) => (
                  <div key={p.name} className="mb-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                        <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: p.color }} />
                        <span className="text-sm text-gray-200 font-medium leading-tight" title={p.fullName}>
                          {p.fullName ?? p.name}
                        </span>
                        {p.inGovt && (
                          <span className="text-xs bg-indigo-900/50 text-indigo-400 border border-indigo-800 px-1.5 py-0.5 rounded-full shrink-0">
                            ● Gobierno
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-sm tabular-nums shrink-0">{p.pct.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full transition-all"
                        style={{ width: `${p.pct}%`, background: p.color, opacity: 0.85 }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}

          {poll.govtApproval && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Aprobación del gobierno</p>
              <div className="flex gap-3 text-sm mb-2 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500 shrink-0" />
                  <span className="text-gray-300">Aprueba <strong className="text-white">{poll.govtApproval.approve}%</strong></span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-red-500 shrink-0" />
                  <span className="text-gray-300">Desaprueba <strong className="text-white">{poll.govtApproval.disapprove}%</strong></span>
                </span>
                {poll.govtApproval.neutral != null && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-gray-600 shrink-0" />
                    <span className="text-gray-300">NS/NC <strong className="text-white">{poll.govtApproval.neutral}%</strong></span>
                  </span>
                )}
              </div>
              <div className="flex w-full h-3 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: `${poll.govtApproval.approve}%` }} />
                {poll.govtApproval.neutral != null && (
                  <div className="bg-gray-600 h-full" style={{ width: `${poll.govtApproval.neutral}%` }} />
                )}
                <div className="bg-red-500 h-full flex-1" />
              </div>
            </div>
          )}

          <a
            href={poll.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-600 hover:text-indigo-400 mt-4 inline-flex items-center gap-1 transition-colors"
          >
            ↗ {poll.source} · {poll.retrievedAt}
          </a>
        </div>
      ))}
    </div>
  );
}

// ISO3 → ISO2 para flagcdn.com
const ISO3_TO_ISO2: Record<string, string> = {
  USA:"us",CAN:"ca",MEX:"mx",BRA:"br",ARG:"ar",COL:"co",CHL:"cl",PER:"pe",
  VEN:"ve",ECU:"ec",BOL:"bo",URY:"uy",PRY:"py",CRI:"cr",CUB:"cu",DOM:"do",GTM:"gt",
  ESP:"es",PRT:"pt",FRA:"fr",DEU:"de",ITA:"it",GBR:"gb",NLD:"nl",POL:"pl",
  SWE:"se",UKR:"ua",TUR:"tr",RUS:"ru",BEL:"be",AUT:"at",CHE:"ch",NOR:"no",
  DNK:"dk",GRC:"gr",HUN:"hu",ROU:"ro",FIN:"fi",CZE:"cz",SVK:"sk",BGR:"bg",
  HRV:"hr",SRB:"rs",MDA:"md",BLR:"by",
  CHN:"cn",IND:"in",JPN:"jp",KOR:"kr",IDN:"id",AUS:"au",PAK:"pk",THA:"th",PHL:"ph",IRN:"ir",
  VNM:"vn",MYS:"my",BGD:"bd",NZL:"nz",SGP:"sg",KAZ:"kz",MMR:"mm",
  ISR:"il",SAU:"sa",EGY:"eg",NGA:"ng",ZAF:"za",MAR:"ma",ETH:"et",KEN:"ke",
  IRQ:"iq",JOR:"jo",ARE:"ae",TUN:"tn",LBN:"lb",DZA:"dz",TZA:"tz",GHA:"gh",SEN:"sn",ZWE:"zw",
};

function FlagImg({ iso3, size = 64 }: { iso3: string; size?: number }) {
  const iso2 = ISO3_TO_ISO2[iso3];
  if (!iso2) return <span className="text-5xl">🌍</span>;
  return (
    <img
      src={`https://flagcdn.com/w${size}/${iso2}.png`}
      alt={iso3}
      width={size}
      height={size * 0.67}
      className="rounded shadow-sm object-cover"
      style={{ maxHeight: size * 0.67 }}
    />
  );
}

// Emoji de bandera por ISO3
function countryFlag(iso3: string): string {
  const map: Record<string, string> = {
    USA:"🇺🇸",CAN:"🇨🇦",MEX:"🇲🇽",BRA:"🇧🇷",ARG:"🇦🇷",COL:"🇨🇴",CHL:"🇨🇱",PER:"🇵🇪",
    VEN:"🇻🇪",ECU:"🇪🇨",BOL:"🇧🇴",URY:"🇺🇾",PRY:"🇵🇾",CRI:"🇨🇷",CUB:"🇨🇺",
    ESP:"🇪🇸",PRT:"🇵🇹",FRA:"🇫🇷",DEU:"🇩🇪",ITA:"🇮🇹",GBR:"🇬🇧",NLD:"🇳🇱",POL:"🇵🇱",
    SWE:"🇸🇪",UKR:"🇺🇦",TUR:"🇹🇷",RUS:"🇷🇺",BEL:"🇧🇪",AUT:"🇦🇹",CHE:"🇨🇭",NOR:"🇳🇴",
    DNK:"🇩🇰",GRC:"🇬🇷",HUN:"🇭🇺",ROU:"🇷🇴",
    CHN:"🇨🇳",IND:"🇮🇳",JPN:"🇯🇵",KOR:"🇰🇷",IDN:"🇮🇩",AUS:"🇦🇺",PAK:"🇵🇰",THA:"🇹🇭",PHL:"🇵🇭",IRN:"🇮🇷",
    ISR:"🇮🇱",SAU:"🇸🇦",EGY:"🇪🇬",NGA:"🇳🇬",ZAF:"🇿🇦",MAR:"🇲🇦",ETH:"🇪🇹",KEN:"🇰🇪",
  };
  return map[iso3] ?? "🌍";
}
