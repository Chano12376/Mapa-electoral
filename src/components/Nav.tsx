import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

const continentes = [
  { id: "all",     label: "🌍 Mundo" },
  { id: "america", label: "🌎 América" },
  { id: "europa",  label: "🌍 Europa" },
  { id: "asia",    label: "🌏 Asia-Pac." },
  { id: "africa",  label: "🌍 O.M. y África" },
];

const ALL_COUNTRIES = [
  { iso3: "USA", name: "Estados Unidos" }, { iso3: "CAN", name: "Canadá" },
  { iso3: "MEX", name: "México" },         { iso3: "BRA", name: "Brasil" },
  { iso3: "ARG", name: "Argentina" },      { iso3: "COL", name: "Colombia" },
  { iso3: "CHL", name: "Chile" },          { iso3: "PER", name: "Perú" },
  { iso3: "VEN", name: "Venezuela" },      { iso3: "ECU", name: "Ecuador" },
  { iso3: "BOL", name: "Bolivia" },        { iso3: "URY", name: "Uruguay" },
  { iso3: "PRY", name: "Paraguay" },       { iso3: "CRI", name: "Costa Rica" },
  { iso3: "CUB", name: "Cuba" },           { iso3: "DOM", name: "Rep. Dominicana" },
  { iso3: "GTM", name: "Guatemala" },
  { iso3: "ESP", name: "España" },         { iso3: "PRT", name: "Portugal" },
  { iso3: "FRA", name: "Francia" },        { iso3: "DEU", name: "Alemania" },
  { iso3: "ITA", name: "Italia" },         { iso3: "GBR", name: "Reino Unido" },
  { iso3: "NLD", name: "Países Bajos" },   { iso3: "POL", name: "Polonia" },
  { iso3: "SWE", name: "Suecia" },         { iso3: "UKR", name: "Ucrania" },
  { iso3: "TUR", name: "Turquía" },        { iso3: "RUS", name: "Rusia" },
  { iso3: "BEL", name: "Bélgica" },        { iso3: "AUT", name: "Austria" },
  { iso3: "CHE", name: "Suiza" },          { iso3: "NOR", name: "Noruega" },
  { iso3: "DNK", name: "Dinamarca" },      { iso3: "GRC", name: "Grecia" },
  { iso3: "HUN", name: "Hungría" },        { iso3: "ROU", name: "Rumanía" },
  { iso3: "FIN", name: "Finlandia" },      { iso3: "CZE", name: "República Checa" },
  { iso3: "SVK", name: "Eslovaquia" },     { iso3: "BGR", name: "Bulgaria" },
  { iso3: "HRV", name: "Croacia" },        { iso3: "SRB", name: "Serbia" },
  { iso3: "MDA", name: "Moldavia" },       { iso3: "BLR", name: "Bielorrusia" },
  { iso3: "CHN", name: "China" },          { iso3: "IND", name: "India" },
  { iso3: "JPN", name: "Japón" },          { iso3: "KOR", name: "Corea del Sur" },
  { iso3: "IDN", name: "Indonesia" },      { iso3: "AUS", name: "Australia" },
  { iso3: "PAK", name: "Pakistán" },       { iso3: "THA", name: "Tailandia" },
  { iso3: "PHL", name: "Filipinas" },      { iso3: "IRN", name: "Irán" },
  { iso3: "VNM", name: "Vietnam" },        { iso3: "MYS", name: "Malasia" },
  { iso3: "BGD", name: "Bangladés" },      { iso3: "NZL", name: "Nueva Zelanda" },
  { iso3: "SGP", name: "Singapur" },       { iso3: "KAZ", name: "Kazajistán" },
  { iso3: "MMR", name: "Myanmar" },
  { iso3: "ISR", name: "Israel" },         { iso3: "SAU", name: "Arabia Saudí" },
  { iso3: "EGY", name: "Egipto" },         { iso3: "NGA", name: "Nigeria" },
  { iso3: "ZAF", name: "Sudáfrica" },      { iso3: "MAR", name: "Marruecos" },
  { iso3: "ETH", name: "Etiopía" },        { iso3: "KEN", name: "Kenia" },
  { iso3: "IRQ", name: "Irak" },           { iso3: "JOR", name: "Jordania" },
  { iso3: "ARE", name: "Emiratos Árabes" },{ iso3: "TUN", name: "Túnez" },
  { iso3: "LBN", name: "Líbano" },         { iso3: "DZA", name: "Argelia" },
  { iso3: "TZA", name: "Tanzania" },       { iso3: "GHA", name: "Ghana" },
  { iso3: "SEN", name: "Senegal" },        { iso3: "ZWE", name: "Zimbabue" },
];

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

interface NavProps {
  continente?: string;
  onContinente?: (c: string) => void;
}

export default function Nav({ continente, onContinente }: NavProps) {
  const loc = useLocation();
  const navigate = useNavigate();
  const isHome = loc.pathname === "/";
  const isCalendario = loc.pathname === "/calendario";
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const results = query.trim().length >= 1
    ? ALL_COUNTRIES.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.iso3.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : [];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function go(iso3: string) {
    setQuery(""); setOpen(false);
    navigate(`/pais/${iso3}`);
  }

  return (
    <header className="border-b border-gray-800 bg-gray-950/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-screen-xl mx-auto px-4">

        {/* Fila principal */}
        <div className="h-12 flex items-center gap-3">
          {/* Logo */}
          <Link to="/" className="font-bold text-white tracking-tight shrink-0 flex items-center gap-1.5">
            <span className="text-indigo-400">🗺</span>
            <span className="hidden sm:inline">Mapa Electoral</span>
          </Link>

          {/* Nav links */}
          <nav className="flex gap-1 text-sm shrink-0">
            <Link to="/"
              className={`px-3 py-1.5 rounded-md transition-colors ${isHome ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}>
              Mapa
            </Link>
            <Link to="/calendario"
              className={`px-3 py-1.5 rounded-md transition-colors ${isCalendario ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}>
              Calendario
            </Link>
          </nav>

          {/* Buscador */}
          <div ref={ref} className="relative flex-1 min-w-0">
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              placeholder="Buscar país…"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {open && results.length > 0 && (
              <ul className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
                {results.map((c) => (
                  <li key={c.iso3}>
                    <button
                      onClick={() => go(c.iso3)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-800 text-left transition-colors"
                    >
                      <span className="text-xl">{FLAG[c.iso3]}</span>
                      <span className="text-sm text-gray-200">{c.name}</span>
                      <span className="text-xs text-gray-500 ml-auto">{c.iso3}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Filtro continente — solo visible en escritorio (md+) */}
          {isHome && onContinente && (
            <div className="hidden md:flex gap-1 ml-2 text-xs shrink-0">
              {continentes.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onContinente(c.id)}
                  className={`px-2.5 py-1 rounded-full border transition-colors whitespace-nowrap ${
                    continente === c.id
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Segunda fila: filtro de continente en móvil */}
        {isHome && onContinente && (
          <div className="flex md:hidden gap-2 overflow-x-auto pb-2.5 -mx-4 px-4" style={{ scrollbarWidth: "none" }}>
            {continentes.map((c) => (
              <button
                key={c.id}
                onClick={() => onContinente(c.id)}
                className={`px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap text-xs shrink-0 ${
                  continente === c.id
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "border-gray-700 text-gray-400 active:bg-gray-800"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
