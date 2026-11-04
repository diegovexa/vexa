// src/App.jsx
// Direcciones normales (/catalogo, /linea/argan-recovery) para que Google indexe cada página;
// vercel.json manda todas las rutas a index.html y main.jsx convierte los links viejos con "#/"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Landing from "./pages/Landing";
import Linea from "./pages/Linea";
import Catalogo from "./pages/Catalogo";
import Producto from "./pages/Producto";
import Preguntas from "./pages/Preguntas";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"             element={<Landing />} />
          <Route path="/linea/:slug"  element={<Linea />} />
          <Route path="/producto/:slug" element={<Producto />} />
          <Route path="/preguntas-frecuentes" element={<Preguntas />} />
          <Route path="/catalogo"     element={<Catalogo />} />
          <Route path="/admin"        element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
