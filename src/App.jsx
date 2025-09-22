import React, { useEffect, useMemo, useState } from "react";
import { ThemeProvider } from "./theme";
import Header from "./components/Header";
import SideMenu from "./components/SideMenu";
import { Card } from "./components/UI";

import Hydration from "./sections/Hydration";
import Musculation from "./sections/Musculation";
import Nutrition from "./sections/Nutrition";
import Sleep from "./sections/Sleep";
import Notes from "./sections/Notes";

/* ---------- Helpers ---------- */
const todayKey = () => new Date().toISOString().slice(0, 10);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------- App ---------- */
export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Hydratation (lecture locale pour le dashboard)
  const { ml, goal, pct } = useHydrationSnapshot();

  // Sommeil – petite suggestion illustrative (à remplacer par le calcul avancé de Sleep)
  const sleepTip = useMemo(() => {
    const base = 8; // h
    const shift = ml >= goal ? 0 : 0.25; // bois moins que l'objectif => se coucher un peu plus tôt
    const h = base + shift;
    return `≈ ${h.toFixed(1)} h de sommeil`;
  }, [ml, goal]);

  return (
    <ThemeProvider>
      <div style={{ background: "var(--bg)", color: "var(--text)" }}>
        <Header onMenu={() => setMenuOpen(true)} />

        <main>
          <div className="container stack-lg">
            {/* DASHBOARD */}
            <Card>
              <div className="h1">Tableau de bord</div>

              <div className="grid grid-3" style={{ marginTop: 12 }}>
                {/* Carte Hydratation */}
                <Card>
                  <div className="sub">Hydratation</div>
                  <div style={{ marginTop: 8, fontWeight: 600 }}>
                    {ml} mL / {goal} mL
                  </div>
                  <div className="progress" style={{ marginTop: 8 }}>
                    <div
                      className="progress__bar"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </Card>

                {/* Carte Sommeil */}
                <Card>
                  <div className="sub">Sommeil</div>
                  <div style={{ marginTop: 8 }}>{sleepTip}</div>
                  <div className="progress" style={{ marginTop: 8 }}>
                    <div
                      className="progress__bar"
                      style={{ width: "66%" }}
                    />
                  </div>
                </Card>

                {/* Carte Nutrition & Défi */}
                <Card>
                  <div className="sub">Nutrition & Défi PDC</div>
                  <div style={{ marginTop: 8 }}>
                    Consulte les sections pour les détails du jour.
                  </div>
                  <div className="progress" style={{ marginTop: 8 }}>
                    <div
                      className="progress__bar"
                      style={{ width: "50%" }}
                    />
                  </div>
                </Card>
              </div>
            </Card>

            {/* SECTIONS */}
            <section className="card">
              <div className="h2">Hydratation</div>
              <div style={{ height: 12 }} />
              <Hydration />
            </section>

            <section className="card">
              <div className="h2">Musculation</div>
              <div style={{ height: 12 }} />
              <Musculation />
            </section>

            <section className="card">
              <div className="h2">Nutrition</div>
              <div style={{ height: 12 }} />
              <Nutrition />
            </section>

            <section className="card">
              <div className="h2">Sommeil</div>
              <div style={{ height: 12 }} />
              <Sleep />
            </section>

            <section className="card">
              <div className="h2">Notes</div>
              <div style={{ height: 12 }} />
              <Notes />
            </section>
          </div>
        </main>

        {/* Menu latéral (burger) */}
        <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      </div>
    </ThemeProvider>
  );
}

/* ---------- Mini-hook : snapshot hydratation pour le dashboard ---------- */
function useHydrationSnapshot() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const on = () => setTick(t => t + 1);
    window.addEventListener("storage", on);
    return () => window.removeEventListener("storage", on);
  }, []);

  const k = todayKey();
  const goal = Number(localStorage.getItem("hydr.goal") || 2500);
  const logs = JSON.parse(localStorage.getItem("hydr.logs") || "{}");
  const ml = logs[k]?.ml || 0;
  const pct = clamp(Math.round((ml / Math.max(1, goal)) * 100), 0, 100);

  // tick est juste là pour forcer la mise à jour si localStorage change ailleurs
  void tick;

  return { ml, goal, pct };
}
