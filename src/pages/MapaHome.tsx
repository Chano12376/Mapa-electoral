import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { CountryData } from "../types.ts";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const NUMERIC_TO_ISO3: Record<string, string> = {
  "840": "USA", "124": "CAN", "484": "MEX", "076": "BRA", "032": "ARG",
  "170": "COL", "152": "CHL", "604": "PER", "862": "VEN", "218": "ECU",
  "068": "BOL", "858": "URY", "600": "PRY", "188": "CRI", "192": "CUB",
  "214": "DOM", "320": "GTM",
  "724": "ESP", "620": "PRT", "250": "FRA", "276": "DEU", "380": "ITA",
  "826": "GBR", "528": "NLD", "616": "POL", "752": "SWE", "804": "UKR",
  "792": "TUR", "643": "RUS", "056": "BEL", "040": "AUT", "756": "CHE",
  "578": "NOR", "208": "DNK", "300": "GRC", "348": "HUN", "642": "ROU",
  "246": "FIN", "203": "CZE", "703": "SVK", "100": "BGR", "191": "HRV",
  "688": "SRB", "498": "MDA", "112": "BLR",
  "156": "CHN", "356": "IND", "392": "JPN", "410": "KOR", "360": "IDN",
  "036": "AUS", "586": "PAK", "764": "THA", "608": "PHL", "364": "IRN",
  "704": "VNM", "458": "MYS", "050": "BGD", "554": "NZL", "702": "SGP",
  "398": "KAZ", "104": "MMR",
  "376": "ISR", "682": "SAU", "818": "EGY", "566": "NGA", "710": "ZAF",
  "504": "MAR", "231": "ETH", "404": "KEN",
  "368": "IRQ", "400": "JOR", "784": "ARE", "788": "TUN", "422": "LBN",
  "012": "DZA", "834": "TZA", "288": "GHA", "686": "SEN", "716": "ZWE",
  "591": "PAN", "222": "SLV", "340": "HND",
  "372": "IRL", "705": "SVN", "233": "EST", "440": "LTU", "428": "LVA",
  "008": "ALB", "268": "GEO",
  "496": "MNG", "144": "LKA", "860": "UZB", "408": "PRK", "524": "NPL",
  "634": "QAT", "760": "SYR", "180": "COD", "120": "CMR", "024": "AGO",
  "352": "ISL", "070": "BIH", "499": "MNE", "807": "MKD", "051": "ARM", "031": "AZE",
  "558": "NIC", "388": "JAM",
  "508": "MOZ", "800": "UGA", "384": "CIV", "434": "LBY", "706": "SOM", "894": "ZMB",
  "512": "OMN", "887": "YEM", "414": "KWT",
  "004": "AFG", "116": "KHM", "762": "TJK",
  "196": "CYP", "417": "KGZ", "795": "TKM",
  "516": "NAM", "072": "BWA", "646": "RWA", "466": "MLI", "562": "NER",
  "148": "TCD", "729": "SDN", "178": "COG", "728": "SSD", "266": "GAB",
  "450": "MDG", "454": "MWI", "478": "MRT", "204": "BEN",
  "332": "HTI", "328": "GUY", "740": "SUR",
  "442": "LUX", "470": "MLT", "020": "AND",
  "048": "BHR", "780": "TTO", "084": "BLZ",
  "096": "BRN", "418": "LAO", "064": "BTN", "626": "TLS",
  "598": "PNG", "242": "FJI",
  "324": "GIN", "854": "BFA", "768": "TGO", "694": "SLE", "430": "LBR",
  "232": "ERI", "262": "DJI", "132": "CPV",
};

const ISO3_CONTINENT: Record<string, string> = {
  USA:"america",CAN:"america",MEX:"america",BRA:"america",ARG:"america",COL:"america",CHL:"america",PER:"america",
  VEN:"america",ECU:"america",BOL:"america",URY:"america",PRY:"america",CRI:"america",CUB:"america",
  DOM:"america",GTM:"america",
  ESP:"europa",PRT:"europa",FRA:"europa",DEU:"europa",ITA:"europa",GBR:"europa",NLD:"europa",POL:"europa",
  SWE:"europa",UKR:"europa",TUR:"europa",RUS:"europa",BEL:"europa",AUT:"europa",CHE:"europa",NOR:"europa",
  DNK:"europa",GRC:"europa",HUN:"europa",ROU:"europa",
  FIN:"europa",CZE:"europa",SVK:"europa",BGR:"europa",HRV:"europa",SRB:"europa",MDA:"europa",BLR:"europa",
  CHN:"asia",IND:"asia",JPN:"asia",KOR:"asia",IDN:"asia",AUS:"asia",PAK:"asia",THA:"asia",PHL:"asia",IRN:"asia",
  VNM:"asia",MYS:"asia",BGD:"asia",NZL:"asia",SGP:"asia",KAZ:"asia",MMR:"asia",
  ISR:"africa",SAU:"africa",EGY:"africa",NGA:"africa",ZAF:"africa",MAR:"africa",ETH:"africa",KEN:"africa",
  IRQ:"africa",JOR:"africa",ARE:"africa",TUN:"africa",LBN:"africa",DZA:"africa",TZA:"africa",
  GHA:"africa",SEN:"africa",ZWE:"africa",
  PAN:"america",SLV:"america",HND:"america",NIC:"america",JAM:"america",
  IRL:"europa",SVN:"europa",EST:"europa",LTU:"europa",LVA:"europa",ALB:"europa",GEO:"europa",
  ISL:"europa",BIH:"europa",MNE:"europa",MKD:"europa",ARM:"europa",AZE:"europa",CYP:"europa",
  MNG:"asia",LKA:"asia",UZB:"asia",PRK:"asia",NPL:"asia",AFG:"asia",KHM:"asia",TJK:"asia",KGZ:"asia",TKM:"asia",
  QAT:"africa",SYR:"africa",COD:"africa",CMR:"africa",AGO:"africa",
  MOZ:"africa",UGA:"africa",CIV:"africa",LBY:"africa",SOM:"africa",ZMB:"africa",
  OMN:"africa",YEM:"africa",KWT:"africa",
  NAM:"africa",BWA:"africa",RWA:"africa",MLI:"africa",NER:"africa",
  TCD:"africa",SDN:"africa",COG:"africa",SSD:"africa",GAB:"africa",
  MDG:"africa",MWI:"africa",MRT:"africa",BEN:"africa",
  HTI:"america",GUY:"america",SUR:"america",
  LUX:"europa",MLT:"europa",AND:"europa",
  BHR:"africa",TTO:"america",BLZ:"america",
  BRN:"asia",LAO:"asia",BTN:"asia",TLS:"asia",
  PNG:"asia",FJI:"asia",
  GIN:"africa",BFA:"africa",TGO:"africa",SLE:"africa",LBR:"africa",
  ERI:"africa",DJI:"africa",CPV:"africa",
};

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
  PAN:"🇵🇦",SLV:"🇸🇻",HND:"🇭🇳",NIC:"🇳🇮",JAM:"🇯🇲",
  IRL:"🇮🇪",SVN:"🇸🇮",EST:"🇪🇪",LTU:"🇱🇹",LVA:"🇱🇻",ALB:"🇦🇱",GEO:"🇬🇪",
  ISL:"🇮🇸",BIH:"🇧🇦",MNE:"🇲🇪",MKD:"🇲🇰",ARM:"🇦🇲",AZE:"🇦🇿",CYP:"🇨🇾",
  MNG:"🇲🇳",LKA:"🇱🇰",UZB:"🇺🇿",PRK:"🇰🇵",NPL:"🇳🇵",AFG:"🇦🇫",KHM:"🇰🇭",TJK:"🇹🇯",KGZ:"🇰🇬",TKM:"🇹🇲",
  QAT:"🇶🇦",SYR:"🇸🇾",COD:"🇨🇩",CMR:"🇨🇲",AGO:"🇦🇴",
  MOZ:"🇲🇿",UGA:"🇺🇬",CIV:"🇨🇮",LBY:"🇱🇾",SOM:"🇸🇴",ZMB:"🇿🇲",
  OMN:"🇴🇲",YEM:"🇾🇪",KWT:"🇰🇼",
  NAM:"🇳🇦",BWA:"🇧🇼",RWA:"🇷🇼",MLI:"🇲🇱",NER:"🇳🇪",
  TCD:"🇹🇩",SDN:"🇸🇩",COG:"🇨🇬",SSD:"🇸🇸",GAB:"🇬🇦",
  MDG:"🇲🇬",MWI:"🇲🇼",MRT:"🇲🇷",BEN:"🇧🇯",
  HTI:"🇭🇹",GUY:"🇬🇾",SUR:"🇸🇷",
  LUX:"🇱🇺",MLT:"🇲🇹",AND:"🇦🇩",
  BHR:"🇧🇭",TTO:"🇹🇹",BLZ:"🇧🇿",
  BRN:"🇧🇳",LAO:"🇱🇦",BTN:"🇧🇹",TLS:"🇹🇱",
  PNG:"🇵🇬",FJI:"🇫🇯",
  GIN:"🇬🇳",BFA:"🇧🇫",TGO:"🇹🇬",SLE:"🇸🇱",LBR:"🇱🇷",
  ERI:"🇪🇷",DJI:"🇩🇯",CPV:"🇨🇻",
};

const CONTINENT_VIEW: Record<string, { center: [number, number]; zoom: number }> = {
  all:     { center: [0, 20],   zoom: 1 },
  america: { center: [-75, 5],  zoom: 2.2 },
  europa:  { center: [15, 52],  zoom: 3.5 },
  asia:    { center: [110, 25], zoom: 2 },
  africa:  { center: [30, 15],  zoom: 2.2 },
};

function daysUntil(dateStr: string): number {
  return Math.ceil(
    (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
}

function electionColor(data: CountryData | undefined, dimmed: boolean): string {
  if (dimmed) return "#0d1117";
  if (!data) return "#1f2937";
  if (!data.nextElection) return "#2d3748";
  const days = daysUntil(data.nextElection.date);
  if (days < 0) return "#2d3748";
  if (days <= 90)  return "#ef4444";
  if (days <= 180) return "#f97316";
  if (days <= 365) return "#eab308";
  return "#2d3748";
}

function hoverColor(data: CountryData | undefined): string {
  if (!data?.nextElection) return "#818cf8";
  const days = daysUntil(data.nextElection.date);
  if (days <= 90)  return "#fca5a5";
  if (days <= 180) return "#fdba74";
  if (days <= 365) return "#fde047";
  return "#818cf8";
}

function urgencyLabel(days: number, status: string) {
  if (status === "limite_legal") return { text: `≤${days}d`, cls: "text-gray-400" };
  if (days <= 90)  return { text: `${days}d`, cls: "text-red-400 font-bold" };
  if (days <= 180) return { text: `${days}d`, cls: "text-orange-400 font-semibold" };
  return { text: `${days}d`, cls: "text-yellow-400" };
}

interface TooltipData {
  name: string; iso3: string; election: string | null; days: number | null;
  status: string | null; leader: string | null; x: number; y: number;
}

interface Props { continente: string; }

export default function MapaHome({ continente }: Props) {
  const navigate = useNavigate();
  const [countries, setCountries] = useState<Record<string, CountryData>>({});
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const view = CONTINENT_VIEW[continente] ?? CONTINENT_VIEW.all;
  const isFiltered = continente !== "all";

  const continentIsos = isFiltered
    ? Object.entries(ISO3_CONTINENT).filter(([, c]) => c === continente).map(([iso]) => iso)
    : [];

  useEffect(() => {
    const isos = Object.values(NUMERIC_TO_ISO3);
    Promise.all(
      isos.map((iso3) =>
        fetch(`/data/countries/${iso3}.json`)
          .then((r) => r.json()).then((d) => [iso3, d] as const)
          .catch(() => [iso3, null] as const)
      )
    ).then((entries) => {
      const map: Record<string, CountryData> = {};
      for (const [iso3, data] of entries) if (data) map[iso3] = data;
      setCountries(map);
    });
  }, []);

  // Stats globales
  const allCountriesList = Object.values(countries);
  const electionsThisYear = allCountriesList.filter((c) => {
    if (!c.nextElection) return false;
    const d = daysUntil(c.nextElection.date);
    return d >= 0 && d <= 365;
  });
  const nextElection = electionsThisYear.sort((a, b) =>
    daysUntil(a.nextElection!.date) - daysUntil(b.nextElection!.date)
  )[0];

  function handleMove(geo: any, evt: React.MouseEvent) {
    const iso3 = NUMERIC_TO_ISO3[geo.id];
    if (!iso3) { setTooltip(null); return; }
    const data = countries[iso3];
    let election: string | null = null, days: number | null = null, status: string | null = null;
    if (data?.nextElection) {
      days = daysUntil(data.nextElection.date);
      if (days >= 0) { election = `${data.nextElection.type} · ${data.nextElection.date}`; status = data.nextElection.dateStatus; }
    }
    const leader = data?.headOfGovernment?.name ?? data?.headOfState?.name ?? null;
    setTooltip({ name: data?.name ?? iso3, iso3, election, days, status, leader, x: evt.clientX, y: evt.clientY });
    setHovered(iso3);
  }

  return (
    <div className="flex flex-col bg-gray-950 md:h-[calc(100vh-3rem)]">
      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 px-4 py-2 border-b border-gray-800 text-xs text-gray-400 shrink-0">
        <Stat label="Países" value={Object.keys(countries).length.toString()} />
        <Stat label="Elecciones este año" value={electionsThisYear.length.toString()} accent />
        {nextElection?.nextElection && (
          <span>
            Próxima: <strong className="text-white">{nextElection.name}</strong>
            <span className="text-red-400 ml-1">en {daysUntil(nextElection.nextElection.date)} días</span>
          </span>
        )}
        <div className="ml-auto hidden sm:flex items-center gap-4">
          <LegendDot color="bg-red-500"    label="&lt;3m" />
          <LegendDot color="bg-orange-500" label="3-6m" />
          <LegendDot color="bg-yellow-400" label="6-12m" />
          <LegendDot color="bg-gray-600"   label="sin datos" />
        </div>
      </div>

      {/* ── Vista móvil: lista de tarjetas ── */}
      <div className="md:hidden flex-1 overflow-y-auto">
        <MobileCountryList
          countries={countries}
          continente={continente}
        />
      </div>

      {/* ── Vista escritorio: mapa + sidebar ── */}
      <div className="hidden md:flex flex-1 min-h-0">
        {/* Panel lateral de países del continente */}
        {isFiltered && (
          <aside className="w-52 shrink-0 border-r border-gray-800 overflow-y-auto bg-gray-950">
            <p className="px-3 pt-3 pb-2 text-xs text-gray-500 uppercase tracking-widest">
              {continentIsos.length} países
            </p>
            {continentIsos.map((iso3) => {
              const data = countries[iso3];
              const days = data?.nextElection ? daysUntil(data.nextElection.date) : null;
              const hasElection = days !== null && days >= 0;
              return (
                <button
                  key={iso3}
                  onClick={() => navigate(`/pais/${iso3}`)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-800 transition-colors text-left"
                >
                  <span className="text-xl shrink-0">{FLAG[iso3] ?? "🌍"}</span>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-200 font-medium leading-tight truncate">{data?.name ?? iso3}</p>
                    {hasElection ? (
                      <p className={`text-xs leading-tight ${
                        days! <= 90 ? "text-red-400" : days! <= 180 ? "text-orange-400" : "text-yellow-400"
                      }`}>en {days} días</p>
                    ) : (
                      <p className="text-xs text-gray-600 leading-tight">sin elección</p>
                    )}
                  </div>
                </button>
              );
            })}
          </aside>
        )}

        {/* Mapa */}
        <div className="relative flex-1">
          <ComposableMap
            projectionConfig={{ scale: 147 }}
            style={{ width: "100%", height: "100%" }}
          >
            <ZoomableGroup center={view.center} zoom={view.zoom}>
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const iso3 = NUMERIC_TO_ISO3[geo.id];
                    const data = countries[iso3];
                    const isActive = !!iso3;
                    const dimmed = isFiltered && !!iso3 && ISO3_CONTINENT[iso3] !== continente;
                    const isHov = hovered === iso3;
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={isHov ? hoverColor(data) : electionColor(data, dimmed)}
                        stroke={dimmed ? "#0a0f14" : "#111827"}
                        strokeWidth={dimmed ? 0.2 : 0.5}
                        style={{
                          default: { outline: "none", cursor: isActive && !dimmed ? "pointer" : "default" },
                          hover:   { outline: "none" },
                          pressed: { outline: "none" },
                        }}
                        onMouseMove={(evt) => !dimmed && handleMove(geo, evt)}
                        onMouseLeave={() => { setTooltip(null); setHovered(null); }}
                        onClick={() => { if (iso3 && !dimmed) navigate(`/pais/${iso3}`); }}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>

          {tooltip && (
            <div
              className="fixed z-50 pointer-events-none bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 shadow-2xl min-w-[180px]"
              style={{ left: tooltip.x + 14, top: tooltip.y - 14 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{FLAG[tooltip.iso3] ?? ""}</span>
                <p className="font-bold text-white">{tooltip.name}</p>
              </div>
              {tooltip.leader && <p className="text-indigo-300 text-xs">{tooltip.leader}</p>}
              {tooltip.election && tooltip.days !== null ? (
                <div className="mt-2 pt-2 border-t border-gray-700">
                  <p className="text-gray-300 text-xs">{tooltip.election}</p>
                  <p className={`font-semibold text-sm mt-0.5 ${
                    tooltip.days <= 90 ? "text-red-400" : tooltip.days <= 180 ? "text-orange-400" : "text-yellow-400"
                  }`}>
                    {tooltip.status === "limite_legal" ? `a más tardar (${tooltip.days}d)` : `en ${tooltip.days} días`}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 text-xs mt-1.5">Sin elección próxima</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <span>
      {label}: <strong className={accent ? "text-indigo-400" : "text-gray-200"}>{value}</strong>
    </span>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2.5 h-2.5 rounded-sm inline-block ${color}`} />
      <span>{label}</span>
    </div>
  );
}

const ISO3_CONTINENT_MOBILE = ISO3_CONTINENT;

function MobileCountryList({
  countries,
  continente,
}: {
  countries: Record<string, CountryData>;
  continente: string;
}) {
  const navigate = useNavigate();

  const filtered = Object.entries(countries)
    .filter(([iso3]) => continente === "all" || ISO3_CONTINENT_MOBILE[iso3] === continente)
    .map(([iso3, data]) => {
      const days = data.nextElection ? daysUntil(data.nextElection.date) : null;
      return { iso3, data, days: days !== null && days >= 0 ? days : null };
    })
    .sort((a, b) => {
      if (a.days === null && b.days === null) return (a.data.name ?? "").localeCompare(b.data.name ?? "");
      if (a.days === null) return 1;
      if (b.days === null) return -1;
      return a.days - b.days;
    });

  if (filtered.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-500 text-sm">
        No hay países para este filtro.
      </div>
    );
  }

  return (
    <div className="px-4 py-3 space-y-2">
      {filtered.map(({ iso3, data, days }) => {
        const urgency =
          days === null ? null
          : days <= 90  ? { cls: "bg-red-500/20 border-red-700 text-red-400", label: `${days}d` }
          : days <= 180 ? { cls: "bg-orange-500/20 border-orange-700 text-orange-400", label: `${days}d` }
          : days <= 365 ? { cls: "bg-yellow-500/20 border-yellow-700 text-yellow-400", label: `${days}d` }
          : null;

        const leader = data.headOfGovernment?.name ?? data.headOfState?.name ?? null;

        return (
          <button
            key={iso3}
            onClick={() => navigate(`/pais/${iso3}`)}
            className="w-full flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-left active:bg-gray-800 transition-colors"
          >
            <span className="text-2xl shrink-0">{FLAG[iso3] ?? "🌍"}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-100 truncate">{data.name}</p>
              {leader && <p className="text-xs text-gray-500 truncate">{leader}</p>}
            </div>
            {urgency && (
              <span className={`text-xs font-bold border rounded-full px-2 py-0.5 shrink-0 ${urgency.cls}`}>
                {urgency.label}
              </span>
            )}
            {days === null && (
              <span className="text-xs text-gray-700 shrink-0">—</span>
            )}
            <span className="text-gray-600 shrink-0">›</span>
          </button>
        );
      })}
    </div>
  );
}
