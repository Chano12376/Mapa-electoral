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
  "438": "LIE", "492": "MCO", "674": "SMR",
  "044": "BHS", "052": "BRB", "275": "PSE",
  "462": "MDV", "882": "WSM", "776": "TON", "090": "SLB", "548": "VUT",
  "624": "GNB", "226": "GNQ", "140": "CAF", "174": "COM",
  "426": "LSO", "748": "SWZ", "678": "STP", "270": "GMB", "480": "MUS",
  "158": "TWN", "108": "BDI", "690": "SYC", "336": "VAT",
  "028": "ATG", "662": "LCA", "670": "VCT", "308": "GRD", "212": "DMA", "659": "KNA",
  "583": "FSM", "585": "PLW", "584": "MHL", "296": "KIR", "520": "NRU", "798": "TUV",
  "184": "COK", "531": "CUW", "533": "ABW",
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
  LIE:"europa",MCO:"europa",SMR:"europa",
  BHS:"america",BRB:"america",PSE:"africa",
  MDV:"asia",WSM:"asia",TON:"asia",SLB:"asia",VUT:"asia",
  GNB:"africa",GNQ:"africa",CAF:"africa",COM:"africa",
  LSO:"africa",SWZ:"africa",STP:"africa",GMB:"africa",MUS:"africa",
  TWN:"asia",BDI:"africa",SYC:"africa",VAT:"europa",
  ATG:"america",LCA:"america",VCT:"america",GRD:"america",DMA:"america",KNA:"america",
  FSM:"asia",PLW:"asia",MHL:"asia",KIR:"asia",NRU:"asia",TUV:"asia",
  XKX:"europa",COK:"asia",CUW:"america",ABW:"america",
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
  LIE:"🇱🇮",MCO:"🇲🇨",SMR:"🇸🇲",
  BHS:"🇧🇸",BRB:"🇧🇧",PSE:"🇵🇸",
  MDV:"🇲🇻",WSM:"🇼🇸",TON:"🇹🇴",SLB:"🇸🇧",VUT:"🇻🇺",
  GNB:"🇬🇼",GNQ:"🇬🇶",CAF:"🇨🇫",COM:"🇰🇲",
  LSO:"🇱🇸",SWZ:"🇸🇿",STP:"🇸🇹",GMB:"🇬🇲",MUS:"🇲🇺",
  TWN:"🇹🇼",BDI:"🇧🇮",SYC:"🇸🇨",VAT:"🇻🇦",
  ATG:"🇦🇬",LCA:"🇱🇨",VCT:"🇻🇨",GRD:"🇬🇩",DMA:"🇩🇲",KNA:"🇰🇳",
  FSM:"🇫🇲",PLW:"🇵🇼",MHL:"🇲🇭",KIR:"🇰🇮",NRU:"🇳🇷",TUV:"🇹🇻",
  XKX:"🇽🇰",COK:"🇨🇰",CUW:"🇨🇼",ABW:"🇦🇼",
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
  if (dimmed) return "#dde4ea";
  if (!data) return "#cbd5df";
  if (!data.nextElection) return "#c5cdd7";
  const days = daysUntil(data.nextElection.date);
  if (days < 0) return "#c5cdd7";
  if (days <= 90)  return "#c0514a";
  if (days <= 180) return "#c97c3a";
  if (days <= 365) return "#b89830";
  return "#c5cdd7";
}

function hoverColor(data: CountryData | undefined): string {
  if (!data?.nextElection) return "#7c8dc4";
  const days = daysUntil(data.nextElection.date);
  if (days <= 90)  return "#e88a85";
  if (days <= 180) return "#e8a870";
  if (days <= 365) return "#e8cc70";
  return "#7c8dc4";
}

function urgencyLabel(days: number, status: string) {
  if (status === "limite_legal") return { text: `≤${days}d`, cls: "text-gray-500" };
  if (days <= 90)  return { text: `${days}d`, cls: "text-red-600 font-bold" };
  if (days <= 180) return { text: `${days}d`, cls: "text-orange-600 font-semibold" };
  return { text: `${days}d`, cls: "text-amber-600" };
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
    <div className="flex flex-col bg-stone-50 md:h-[calc(100vh-3rem)]">
      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 px-4 py-2 border-b border-gray-200 text-xs text-gray-500 shrink-0">
        <Stat label="Países" value={Object.keys(countries).length.toString()} />
        <Stat label="Elecciones este año" value={electionsThisYear.length.toString()} accent />
        {nextElection?.nextElection && (
          <span>
            Próxima: <strong className="text-gray-900">{nextElection.name}</strong>
            <span className="text-red-600 ml-1">en {daysUntil(nextElection.nextElection.date)} días</span>
          </span>
        )}
        <div className="ml-auto hidden sm:flex items-center gap-4">
          <LegendDot color="bg-red-600"    label="&lt;3m" />
          <LegendDot color="bg-orange-600" label="3-6m" />
          <LegendDot color="bg-amber-600"  label="6-12m" />
          <LegendDot color="bg-gray-400"   label="sin datos" />
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
          <aside className="w-52 shrink-0 border-r border-gray-200 overflow-y-auto bg-white">
            <p className="px-3 pt-3 pb-2 text-xs text-gray-400 uppercase tracking-widest">
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
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="text-xl shrink-0">{FLAG[iso3] ?? "🌍"}</span>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800 font-medium leading-tight truncate">{data?.name ?? iso3}</p>
                    {hasElection ? (
                      <p className={`text-xs leading-tight ${
                        days! <= 90 ? "text-red-600" : days! <= 180 ? "text-orange-600" : "text-amber-600"
                      }`}>en {days} días</p>
                    ) : (
                      <p className="text-xs text-gray-400 leading-tight">sin elección</p>
                    )}
                  </div>
                </button>
              );
            })}
          </aside>
        )}

        {/* Mapa */}
        <div className="relative flex-1" style={{ background: "#e8eff5" }}>
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
                        stroke={dimmed ? "#c5cdd7" : "#ffffff"}
                        strokeWidth={dimmed ? 0.3 : 0.6}
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
              className="fixed z-50 pointer-events-none bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-lg min-w-[180px]"
              style={{ left: tooltip.x + 14, top: tooltip.y - 14 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{FLAG[tooltip.iso3] ?? ""}</span>
                <p className="font-bold text-gray-900">{tooltip.name}</p>
              </div>
              {tooltip.leader && <p className="text-gray-500 text-xs">{tooltip.leader}</p>}
              {tooltip.election && tooltip.days !== null ? (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="text-gray-500 text-xs">{tooltip.election}</p>
                  <p className={`font-semibold text-sm mt-0.5 ${
                    tooltip.days <= 90 ? "text-red-600" : tooltip.days <= 180 ? "text-orange-600" : "text-amber-600"
                  }`}>
                    {tooltip.status === "limite_legal" ? `a más tardar (${tooltip.days}d)` : `en ${tooltip.days} días`}
                  </p>
                </div>
              ) : (
                <p className="text-gray-400 text-xs mt-1.5">Sin elección próxima</p>
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
      {label}: <strong className={accent ? "text-gray-900" : "text-gray-700"}>{value}</strong>
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
          : days <= 90  ? { cls: "bg-red-50 border-red-300 text-red-600", label: `${days}d` }
          : days <= 180 ? { cls: "bg-orange-50 border-orange-300 text-orange-600", label: `${days}d` }
          : days <= 365 ? { cls: "bg-amber-50 border-amber-300 text-amber-700", label: `${days}d` }
          : null;

        const leader = data.headOfGovernment?.name ?? data.headOfState?.name ?? null;

        return (
          <button
            key={iso3}
            onClick={() => navigate(`/pais/${iso3}`)}
            className="w-full flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 text-left active:bg-gray-50 transition-colors"
          >
            <span className="text-2xl shrink-0">{FLAG[iso3] ?? "🌍"}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{data.name}</p>
              {leader && <p className="text-xs text-gray-400 truncate">{leader}</p>}
            </div>
            {urgency && (
              <span className={`text-xs font-bold border rounded-full px-2 py-0.5 shrink-0 ${urgency.cls}`}>
                {urgency.label}
              </span>
            )}
            {days === null && (
              <span className="text-xs text-gray-300 shrink-0">—</span>
            )}
            <span className="text-gray-400 shrink-0">›</span>
          </button>
        );
      })}
    </div>
  );
}
