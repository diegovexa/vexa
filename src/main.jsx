// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/global.css";

// Links viejos de cuando el sitio usaba "#/": /#/linea/argan-recovery → /linea/argan-recovery
if (window.location.hash.startsWith("#/")) {
  window.history.replaceState(null, "", window.location.hash.slice(1) || "/");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
