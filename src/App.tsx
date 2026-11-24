import { Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";
import MapaHome from "./pages/MapaHome.tsx";
import FichaPais from "./pages/FichaPais.tsx";
import Calendario from "./pages/Calendario.tsx";
import Nav from "./components/Nav.tsx";

export default function App() {
  const [continente, setContinente] = useState("all");

  return (
    <div className="min-h-screen bg-stone-50 text-gray-900">
      <Nav continente={continente} onContinente={setContinente} />
      <Routes>
        <Route path="/" element={<MapaHome continente={continente} />} />
        <Route path="/calendario" element={<Calendario />} />
        <Route path="/pais/:iso3" element={<FichaPais />} />
      </Routes>
    </div>
  );
}
