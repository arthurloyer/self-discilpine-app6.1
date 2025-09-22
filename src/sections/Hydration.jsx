import React, { useMemo } from "react";
import { Card, H2, Label, Input } from "../components/UI";

const todayKey = () => new Date().toISOString().slice(0,10);

// Bouteille SVG qui se remplit selon pct (0–100)
function Bottle({ pct }) {
  const H = 200;
  const y = H - Math.round((H * pct) / 100);
  return (
    <svg viewBox="0 0 120 220" className="w-28 h-[220px]">
      <defs>
        <clipPath id="clip">
          <path d="M50 5 h20 v20 a10 10 0 0 1 -10 10 a10 10 0 0 1 -10 -10 z M40 35 h40 v10 h-40 z
                   M35 45 q-10 30 -10 60 v60 q0 40 20 60 q20 20 40 0 q20 -20 20 -60 v-60 q0 -30 -10 -60 z"/>
        </clipPath>
        <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--accent1)"/>
          <stop offset="100%" stopColor="var(--accent2)"/>
        </linearGradient>
      </defs>

      <path d="M50 5 h20 v20 a10 10 0 0 1 -10 10 a10 10 0 0 1 -10 -10 z" fill="none" stroke="var(--accent1)" strokeWidth="3"/>
      <rect x="40" y="35" width="40" height="10" rx="4" fill="none" stroke="var(--accent1)" strokeWidth="2" />
      <path d="M35 45 q-10 30 -10 60 v60 q0 40 20 60 q20 20 40 0 q20 -20 20 -60 v-60 q0 -30 -10 -60 z"
            fill="none" stroke="var(--accent1)" strokeWidth="2"/>

      <g clipPath="url(#clip)">
        <rect x="0" y={y} width="120" height={H + 50 - y} fill="url(#grad)">
          <animate attributeName="y" dur="0.35s" to={y} fill="freeze" />
          <animate attributeName="height" dur="0.35s" to={H + 50 - y} fill="freeze" />
        </rect>
      </g>
    </svg>
  );
}

export default function Hydration() {
  const k = todayKey();
  const goal = Number(localStorage.getItem("hydr.goal") || 2500);
  const logs = JSON.parse(localStorage.getItem("hydr.logs") || "{}");
  const prefs = JSON.parse(localStorage.getItem("hydr.prefs") || '{"liquid":"Eau"}');

  const ml = logs[k]?.ml || 0;
  const pct = Math.min(100, Math.round((ml / Math.max(1, goal)) * 100));

  function setMl(v) {
    const nx = { ...logs, [k]: { ml: Math.max(0, Math.min(v, 20000)) } };
    localStorage.setItem("hydr.logs", JSON.stringify(nx));
    // forcer re-render
    window.dispatchEvent(new Event("storage"));
  }
  function setGoal(v){
    localStorage.setItem("hydr.goal", String(Math.max(500, Number(v)||2500)));
    window.dispatchEvent(new Event("storage"));
  }
  function setLiquid(liq){
    localStorage.setItem("hydr.prefs", JSON.stringify({liquid: liq}));
    window.dispatchEvent(new Event("storage"));
  }

  // Prévision : où tu devrais en être maintenant
  const shouldNow = useMemo(() => {
    const start = new Date(); start.setHours(7,0,0,0); // journée hydratation 7h→23h
    const end = new Date(); end.setHours(23,0,0,0);
    const now = new Date();
    if (now <= start) return 0;
    if (now >= end) return goal;
    const ratio = (now - start) / (end - start);
    return Math.round(goal * ratio);
  }, [goal]);

  const delta = ml - shouldNow; // si négatif → retard

  return (
    <Card className="p-4">
      <H2>Hydratation</H2>

      <div className="mt-4 grid md:grid-cols-2 gap-6 items-center">
        {/* Gauche : bouteille + stats */}
        <div className="grid gap-3 place-items-center md:place-items-start">
          <Bottle pct={pct} />
          <div className="w-full max-w-sm">
            <div className="text-sm opacity-80 mb-1">{prefs.liquid} — {ml} / {goal} mL</div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full" style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg, var(--accent1), var(--accent2))"
              }}/>
            </div>
            <div className="mt-2 text-xs opacity-80">
              Cible à cette heure : <b>{shouldNow} mL</b> — {delta >= 0 ? "avance" : "retard"} de <b>{Math.abs(delta)} mL</b>
            </div>
          </div>
        </div>

        {/* Droite : contrôles précis */}
        <div className="grid gap-3">
          <Label>Choisir le liquide</Label>
          <div className="flex gap-2 flex-wrap">
            {["Eau","Thé","Café","Boisson isotoniqe","Autre"].map(x=>(
              <button key={x} onClick={()=>setLiquid(x)}
                className={`px-3 py-2 rounded-2xl border ${prefs.liquid===x?"border-white":"border-[var(--border)]"}`}>
                {x}
              </button>
            ))}
          </div>

          <Label>Objectif du jour (mL)</Label>
          <Input type="number" min={500} step={50} defaultValue={goal}
                 onChange={e=>setGoal(e.target.value)} />

          <Label>Remplissage (au mL près)</Label>
          <input type="range" min="0" max={Math.max(goal, ml)} step="1" value={ml}
                 onChange={e=>setMl(Number(e.target.value))}
                 className="w-full accent-[var(--accent1)]" />
          <div className="flex gap-2 flex-wrap">
            {[150,250,500].map(x=>(
              <button key={x} onClick={()=>setMl(ml + x)}
                      className="px-3 py-2 rounded-2xl border border-[var(--border)]">+{x} mL</button>
            ))}
            <button onClick={()=>setMl(Math.max(0, ml-250))}
                    className="px-3 py-2 rounded-2xl border border-[var(--border)]">-250 mL</button>
            <button onClick={()=>setMl(0)}
                    className="px-3 py-2 rounded-2xl border border-red-400 text-red-300">Reset</button>
          </div>
        </div>
      </div>
    </Card>
  );
}
