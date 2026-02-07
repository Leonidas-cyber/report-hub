import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const themeColorMeta = document.querySelector('meta[name="theme-color"]');

const applySystemTheme = (isDark: boolean) => {
  document.documentElement.classList.toggle("dark", isDark);

  // Ajusta color de barra del navegador en móviles
  if (themeColorMeta) {
    themeColorMeta.setAttribute("content", isDark ? "#0f172a" : "#3b82f6");
  }
};

const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
applySystemTheme(systemTheme.matches);

const onThemeChange = (event: MediaQueryListEvent) => {
  applySystemTheme(event.matches);
};

if (typeof systemTheme.addEventListener === "function") {
  systemTheme.addEventListener("change", onThemeChange);
} else {
  // Safari viejo
  systemTheme.addListener(onThemeChange);
}

createRoot(document.getElementById("root")!).render(<App />);
