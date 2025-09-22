import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeCtx = createContext();
export const useTheme = () => useContext(ThemeCtx);

const DEFAULT = { mode: "neon" }; // "neon" | "sobre"

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ascend.theme")) || DEFAULT; }
    catch { return DEFAULT; }
  });

  useEffect(() => {
    localStorage.setItem("ascend.theme", JSON.stringify(theme));
    const r = document.documentElement;
    if (theme.mode === "sobre") {
      r.style.setProperty("--bg", "#0b0b0c");
      r.style.setProperty("--card", "rgba(255,255,255,0.05)");
      r.style.setProperty("--border", "rgba(255,255,255,0.14)");
      r.style.setProperty("--text", "#ffffff");
      r.style.setProperty("--accent1", "#ffffff");
      r.style.setProperty("--accent2", "#ffffff");
      r.style.setProperty("--blur", "14px");
    } else {
      r.style.setProperty("--bg", "#0b0c12");
      r.style.setProperty("--card", "rgba(255,255,255,0.06)");
      r.style.setProperty("--border", "rgba(255,255,255,0.18)");
      r.style.setProperty("--text", "#ffffff");
      r.style.setProperty("--accent1", "#38bdf8"); // bleu néon
      r.style.setProperty("--accent2", "#a855f7"); // violet néon
      r.style.setProperty("--blur", "10px");
    }
  }, [theme]);

  return <ThemeCtx.Provider value={{ theme, setTheme }}>{children}</ThemeCtx.Provider>;
}
