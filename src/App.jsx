// src/App.jsx
import { HashRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Landing from "./pages/Landing";
import Linea from "./pages/Linea";
import Catalogo from "./pages/Catalogo";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/"             element={<Landing />} />
          <Route path="/linea/:slug"  element={<Linea />} />
          <Route path="/catalogo"     element={<Catalogo />} />
          <Route path="/admin"        element={<Admin />} />
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}
