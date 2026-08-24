import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { preloadLocalData } from "./lib/localData";

// Warm the bundled TMDB cache / catalog / stream links up front.
preloadLocalData();

// Apply persisted theme before render to avoid flash
try {
  const theme = localStorage.getItem("theme");
  if (theme === "light") document.documentElement.classList.add("light");
  else document.documentElement.classList.remove("light");
} catch {}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
