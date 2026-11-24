import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface ElectionEntry {
  iso3: string;
  name: string;
  date: string;
  type: string;
  whatIsElected: string;
  dateStatus: string;
  source: string;
  sourceUrl: string;
}

interface CalendarData {
  builtAt: string;
  elections: ElectionEntry[];
}

function daysUntil(dateStr: string): number {
  return Math.ceil(
    (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
}

function urgencyColor(days: number, status: string) {
  if (status === "limite_legal") return { bar: "border-gray-300", badge: "bg-gray-100 text-gray-600" };
  if (days <= 30)  return { bar: "border-red-500",    badge: "bg-red-50 text-red-700 border border-red-200" };
  if (days <= 90)  return { bar: "border-red-400",    badge: "bg-red-50 text-red-600 border border-red-200" };
  if (days <= 180) return { bar: "border-orange-400", badge: "bg-orange-50 text-orange-700 border border-orange-200" };
  return               { bar: "border-amber-400",   badge: "bg-amber-50 text-amber-700 border border-amber-200" };
}

function formatMonth(dateStr: string): string {
  const [year, month] = dateStr.split("-");
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
}

const FLAG: Record<string, string> = {
  USA:"🇺🇸",CAN:"🇨🇦",MEX:"🇲🇽",BRA:"🇧🇷",ARG:"🇦🇷",COL:"🇨🇴",CHL:"🇨🇱",PER:"🇵🇪",
  VEN:"🇻🇪",ECU:"🇪🇨",BOL:"🇧🇴",URY:"🇺🇾",PRY:"🇵🇾",CRI:"🇨🇷",CUB:"🇨🇺",
  DOM:"🇩🇴",GTM:"🇬🇹",
  ESP:"🇪🇸",PRT:"🇵🇹",FRA:"🇫🇷",DEU:"🇩🇪",ITA:"🇮🇹",GBR:"🇬🇧",NLD:"🇳🇱",POL:"🇵🇱",
  SWE:"🇸🇪",UKR:"🇺🇦",TUR:"🇹🇷",RUS:"🇷🇺",BEL:"🇧🇪",AUT:"🇦🇹",CHE:"🇨🇭",NOR:"🇳🇴",
  DNK:"🇩🇰",GRC:"🇬🇷",HUN:"🇭🇺",ROU:"🇷🇴",
  FIN:"🇫🇮",CZE:"🇨🇿",SVK:"🇸🇰",BGR:"🇧🇬",HRV:"🇭🇷",SRB:"🇷🇸",MDA:"🇲🇩",BLR:"🇧🇾",
  CHN:"🇨🇳",IND:"🇮🇳",JPN:"🇯🇵",KOR:"🇰🇷",IDN:"🇮🇩",AUS:"🇦🇺",PAK:"🇵🇰",THA:"🇹🇭",PHL:"🇵🇭",IRN:"🇮🇷",
  VNM:"🇻🇳",MYS:"🇲🇾",BGD:"🇧🇩",NZL:"🇳🇿",SGP:"🇸🇬",KAZ:"🇰🇿",MMR:"🇲🇲",
  ISR:"🇮🇱",SAU:"🇸🇦",EGY:"🇪🇬",NGA:"🇳🇬",ZAF:"🇿🇦",MAR:"🇲🇦",ETH:"🇪🇹",KEN:"🇰🇪",
  IRQ:"🇮🇶",JOR:"🇯🇴",ARE:"🇦🇪",TUN:"🇹🇳",LBN:"🇱🇧",DZA:"🇩🇿",TZA:"🇹🇿",
  GHA:"🇬🇭",SEN:"🇸🇳",ZWE:"🇿🇼",
};

export default function Calendario() {
  const [data, setData] = useState<CalendarData | null>(null);
  const [view, setView] = useState<"proximas" | "todas">("proximas");

  useEffect(() => {
    fetch("/data/calendar.json").then((r) => r.json()).then(setData);
  }, []);

  if (!data) return (
    <div className="p-12 flex items-center justify-center gap-3 text-gray-400">
      <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      Cargando…
    </div>
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sorted = [...data.elections].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const upcoming = sorted.filter((e) => new Date(e.date) >= today);
  const list = view === "proximas" ? upcoming : sorted;

  // Agrupar por año-mes
  const byMonth = new Map<string, ElectionEntry[]>();
  for (const e of list) {
    const key = e.date.slice(0, 7);
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(e);
  }

  const confirmed = upcoming.filter((e) => e.dateStatus === "confirmada").length;
  const next90 = upcoming.filter((e) => daysUntil(e.date) <= 90).length;

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      {/* Cabecera */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Calendario electoral</h1>
        <p className="text-gray-500 text-sm mt-1">
          Elecciones registradas en {list.length} países
        </p>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-gray-900">{upcoming.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">próximas</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-red-600">{next90}</p>
          <p className="text-xs text-gray-400 mt-0.5">en 90 días</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-emerald-700">{confirmed}</p>
          <p className="text-xs text-gray-400 mt-0.5">confirmadas</p>
        </div>
      </div>

      {/* Toggle */}
      <div className="flex gap-1 mb-6 p-1 bg-gray-100 rounded-xl w-fit">
        {(["proximas", "todas"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              view === v ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {v === "proximas" ? "Próximas" : "Todas"}
          </button>
        ))}
      </div>

      {list.length === 0 && (
        <p className="text-gray-400 italic text-center py-12">No hay elecciones registradas.</p>
      )}

      {/* Lista agrupada por mes */}
      {Array.from(byMonth.entries()).map(([monthKey, elections]) => (
        <div key={monthKey} className="mb-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="capitalize">{formatMonth(monthKey + "-01")}</span>
            <span className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400">{elections.length}</span>
          </h2>
          <ol className="space-y-2.5">
            {elections.map((e) => {
              const days = daysUntil(e.date);
              const { bar, badge } = urgencyColor(days, e.dateStatus);
              const isPast = days < 0;
              return (
                <li
                  key={e.iso3 + e.date}
                  className={`border-l-4 ${bar} bg-white hover:bg-gray-50 rounded-r-2xl px-5 py-4 flex items-center gap-4 transition-colors shadow-sm ${isPast ? "opacity-50" : ""}`}
                >
                  <span className="text-3xl select-none shrink-0">{FLAG[e.iso3] ?? "🌍"}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to={`/pais/${e.iso3}`}
                        className="font-bold text-gray-900 hover:text-gray-600 transition-colors"
                      >
                        {e.name}
                      </Link>
                      {e.dateStatus === "confirmada" && (
                        <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                          ✓ confirmada
                        </span>
                      )}
                      {e.dateStatus === "limite_legal" && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                          límite legal
                        </span>
                      )}
                      {isPast && (
                        <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
                          celebrada
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{e.type}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-mono text-gray-400">{e.date}</span>
                      <a
                        href={e.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        ↗ {e.source}
                      </a>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {!isPast ? (
                      <span className={`text-sm font-bold tabular-nums px-3 py-1.5 rounded-full ${badge}`}>
                        {e.dateStatus === "limite_legal" ? "≤ " : ""}{Math.abs(days)}d
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 tabular-nums">hace {Math.abs(days)}d</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      ))}

      <p className="text-gray-700 text-xs mt-10 text-center">Generado: {data.builtAt}</p>
    </main>
  );
}
