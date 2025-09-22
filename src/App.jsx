// src/App.jsx
import React, { useEffect, useState } from "react";

// Thème & layout
import { ThemeProvider } from "./theme";
import Header from "./components/Header";
import SideMenu from "./components/SideMenu";
import { Card, H2 } from "./components/UI";

// Sections
import Hydration from "./sections/Hydration";
import Musculation from "./sections/Musculation";
import Nutrition from "./sections/Nutrition";
import Sleep from "./sections/Sleep";
import Notes from "./sections/Notes";

// Util
const todayKey = () => new Date().toISOString().slice(0, 10);

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  // petit “tick” pour re-render quand localStorage change (slider, objectifs, etc.)
  const [, setTick] = useState(0);
  useEffect(() => {
    const on = () => setTick((t) => t + 1);
    window.addEventListener("storage", on);
    return () => window.removeEventListener("storage", on);
  }, []);

  return (
    <ThemeProvider>
      <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--text)" }}>
        {/* Barre du haut : logo Ascend + menu (3 barres) */}
        <Header onMenu={() => setMenuOpen(true)} />

        {/* Contenu */}
        <main className="max-w-6xl mx-auto px-4 py-5 pb-24 overflow-x-hidden">
          <Dashboard />

          <div className="mt-6 grid gap-6">
            <Hydration />
            <Musculation />
            <Nutrition />
            <Sleep />
            <Notes />
          </div>
        </main>

        {/* Panneau latéral (Contact / Mes informations / Mon compte / Thème) */}
        <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      </div>
    </ThemeProvider>
  );
}

/* ============================
   Dashboard (résumé central)
   ============================ */
function Dashboard() {
  const k = todayKey();

  // Hydratation
  const goal = Number(localStorage.getItem("hydr.goal") || 2500);
  const logs = JSON.parse(localStorage.getItem("hydr.logs") || "{}");
  const ml = logs[k]?.ml || 0;
  const hydrPct = Math.min(100, Math.round((ml / Math.max(1, goal)) * 100));

  // Défi PDC du jour
  const challenge =
    JSON.parse(localStorage.getItem("muscle.challenge") || "{}")[k] || { name: "—", done: false };

  // Nutrition (totaux du jour simplifiés)
  const nutLogs = JSON.parse(localStorage.getItem("nut.logs") || "{}");
  const foods = JSON.parse(localStorage.getItem("nut.foods") || "[]");
  const today = nutLogs[k];
  const meals = today?.meals || { breakfast: [], lunch: [], dinner: [], snacks: [] };
  const totals = ["breakfast", "lunch", "dinner", "snacks"].reduce(
    (acc, key) => {
      (meals[key] || []).forEach((m) => {
        const f = foods.find((x) => x.id === m.foodId);
        if (!f) return;
        const r = (m.grams || 0) / 100;
        acc.k += (f.per100?.kcal || 0) * r;
      });
      return acc;
    },
    { k: 0 }
  );

  return (
    <Card className="p-4">
      <H2>Tableau de bord</H2>

      <div className="mt-3 grid md:grid-cols-3 gap-3">
        {/* Hydratation */}
        <Card className="p-3">
          <div className="text-sm opacity-80">Hydratation</div>
          <div className="text-2xl font-semibold">
            {ml} / {goal} mL
          </div>
          <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full"
              style={{
                width: `${hydrPct}%`,
                background: "linear-gradient(90deg, var(--accent1), var(--accent2))",
              }}
            />
          </div>
        </Card>

        {/* Défi du jour */}
        <Card className="p-3">
          <div className="text-sm opacity-80">Défi PDC du jour</div>
          <div className="text-2xl font-semibold">{challenge.name}</div>
          <div className="mt-1 text-xs opacity-70">
            État : {challenge.done ? "Validé ✅" : "À faire ⏳"}
          </div>
        </Card>

        {/* Kcal du jour (rapide) */}
        <Card className="p-3">
          <div className="text-sm opacity-80">Apport du jour (approx.)</div>
          <div className="text-2xl font-semibold">{Math.round(totals.k)} kcal</div>
          <div className="mt-1 text-xs opacity-70">Détail complet dans Nutrition</div>
        </Card>
      </div>
    </Card>
  );
}
