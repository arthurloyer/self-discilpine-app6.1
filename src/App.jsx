import React, { useEffect, useMemo, useState } from "react";

/* ------------------ Helpers ------------------ */
const cls = (...a) => a.filter(Boolean).join(" ");
const todayKey = () => new Date().toISOString().slice(0, 10);
const n = (x, d = 0) => {
  const v = parseFloat(x); return isNaN(v) ? d : v;
};
const norm = (s) => (s || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
function useLocal(key, init) {
  const [s, set] = useState(() => {
    try {
      const r = localStorage.getItem(key);
      return r ? JSON.parse(r) : (typeof init === "function" ? init() : init);
    } catch {
      return typeof init === "function" ? init() : init;
    }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(s)); } catch {} }, [key, s]);
  return [s, set];
}

/* ------------------ UI de base ------------------ */
const Card = ({ className, children }) => (
  <div className={cls("glass neon-border rounded-3xl p-5 md:p-7", className)}>{children}</div>
);
const H2 = ({ children }) => (<h2 className="text-xl md:text-2xl font-semibold tracking-tight">{children}</h2>);
const Label = ({ children }) => (<label className="text-xs uppercase tracking-wider text-zinc-300">{children}</label>);
const Input = ({ className = "", ...p }) => (
  <input {...p} className={cls("w-full bg-transparent border border-white/15 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neon-blue", className)} />
);
const Button = ({ className = "", ...p }) => (
  <button {...p} className={cls("px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 transition active:scale-[.98]", className)} />
);

/* ------------------ Onglets ------------------ */
const TABS = [
  { id: "Dashboard", label: "Home" },
  { id: "Hydratation", label: "Eau" },
  { id: "Musculation", label: "Muscu" },
  { id: "Nutrition", label: "Nutri" },
  { id: "Sommeil", label: "Sleep" },
  { id: "Notes", label: "Notes" },
];

/* ------------------ App Layout ------------------ */
export default function App() {
  const [tab, setTab] = useLocal("ui.tab", "Dashboard");

  return (
    <div className="min-h-screen pb-28 relative overflow-x-hidden">
      {/* Fond étoilé léger */}
      <div className="stars pointer-events-none"></div>

      {/* Header minimal */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-black/30 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-neon-blue to-neon-violet grid place-items-center shadow-holo">∆</div>
            <div className="font-semibold">Self-Discipline</div>
          </div>
        </div>
      </header>

      {/* Contenu centré, uniquement scroll vertical */}
      <main className="max-w-6xl mx-auto px-4 py-6 grid gap-6 text-center">
        {tab === "Dashboard"   && <Dashboard />}
        {tab === "Hydratation" && <Hydration />}
        {tab === "Musculation" && <Musculation />}
        {tab === "Nutrition"   && <Nutrition />}
        {tab === "Sommeil"     && <Sleep />}
        {tab === "Notes"       && <Notes />}
      </main>

      {/* Barre de navigation — 6 onglets (Notes incluse) */}
      <div className="fixed bottom-3 inset-x-0 px-4">
        <div className="max-w-lg mx-auto glass neon-border rounded-3xl p-2 grid grid-cols-6 gap-1 overflow-hidden">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cls("text-xs py-2 rounded-2xl truncate",
                tab === t.id && "bg-gradient-to-r from-neon-blue/30 to-neon-violet/30")}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================= DASHBOARD amélioré ================= */
function Dashboard() {
  // Récupération de mini-stats stockées localStorage
  const day = todayKey();

  // Hydratation
  const hydrGoal = JSON.parse(localStorage.getItem("hydr.goal") || "2500");
  const hydrLogs = JSON.parse(localStorage.getItem("hydr.logs") || "{}");
  const ml = hydrLogs[day]?.ml || 0;
  const hydrPct = Math.min(100, Math.round((ml / Math.max(1, hydrGoal)) * 100));

  // Sommeil
  const sleepGoal = JSON.parse(localStorage.getItem("sleep.goal") || "8");
  const sleepLog = JSON.parse(localStorage.getItem("sleep.log") || "{}");
  const slept = sleepLog[day]?.h || 0;
  const sleepPct = Math.min(100, Math.round((slept / Math.max(1, sleepGoal)) * 100));

  // Nutrition (kcal du jour)
  const nutLogs = JSON.parse(localStorage.getItem("nut.logs") || "{}");
  const recipes = JSON.parse(localStorage.getItem("nut.recipes") || "[]");
  const foods = JSON.parse(localStorage.getItem("nut.foods") || "[]");
  const todayMeals = nutLogs[day]?.meals || { breakfast: [], lunch: [], dinner: [], snacks: [] };
  function macroItem(it) {
    const r = recipes.find(x => x.id === it.recipeId);
    if (!r) return { k: 0, p: 0, c: 0, f: 0 };
    const base = r.items.reduce((acc, ing) => {
      const f = foods.find(x => x.id === ing.foodId);
      const ratio = (ing.grams || 0) / 100;
      acc.k += Math.round((f?.per100.kcal || 0) * ratio);
      acc.p += Math.round((f?.per100.p || 0) * ratio);
      acc.c += Math.round((f?.per100.c || 0) * ratio);
      acc.f += Math.round((f?.per100.f || 0) * ratio);
      return acc;
    }, { k: 0, p: 0, c: 0, f: 0 });
    return base;
  }
  const totals = Object.values(todayMeals).flat().reduce((a, it) => {
    const m = macroItem(it);
    a.k += m.k; a.p += m.p; a.c += m.c; a.f += m.f; return a;
  }, { k: 0, p: 0, c: 0, f: 0 });

  // Notes (au moins 1 élément coché)
  const notes = JSON.parse(localStorage.getItem("notes.items") || "{}");
  const notesDone = Object.values(notes).some(list => (list || []).some(it => it.done));

  // Score global simple
  const score = Math.min(100,
    (hydrPct * 0.3) + (sleepPct * 0.3) + (Math.min(100, (totals.k > 0 ? 100 : 0)) * 0.3) + (notesDone ? 10 : 0)
  );
  const scoreInt = Math.round(score);

  const quote = useMemo(() => {
    const QUOTES = [
      "Petits pas, grands effets.",
      "La discipline bat la motivation.",
      "Faire aujourd’hui ce que les autres remettent.",
      "Tu es en compétition avec toi-même.",
      "Chaque jour compte. Celui-ci aussi."
    ];
    return QUOTES[(new Date().getDate()) % QUOTES.length];
  }, []);

  return (
    <div className="grid gap-6">
      <Card className="overflow-hidden relative">
        <H2>Tableau de bord</H2>
        <div className="mt-4 grid md:grid-cols-[260px_1fr] gap-6 items-center">
          {/* Jauge principale */}
          <div className="relative w-[240px] h-[240px] mx-auto rounded-full bg-gradient-to-br from-neon-blue/40 to-neon-violet/40 border border-white/20 shadow-holo grid place-items-center">
            <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(#38bdf8 ${scoreInt * 3.6}deg, rgba(255,255,255,.08) 0deg)` }}></div>
            <div className="absolute inset-5 rounded-full glass grid place-items-center">
              <div className="text-4xl font-bold">{scoreInt}</div>
              <div className="text-xs text-zinc-300">score</div>
            </div>
          </div>

          {/* Mini-widgets */}
          <div className="grid sm:grid-cols-2 gap-3 text-left">
            <div className="glass rounded-2xl p-3">
              <div className="text-sm opacity-80">Hydratation</div>
              <div className="text-2xl font-semibold">{ml}<span className="text-sm ml-1">/ {hydrGoal} mL</span></div>
              <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-neon-blue to-neon-violet" style={{ width: `${hydrPct}%` }} />
              </div>
            </div>
            <div className="glass rounded-2xl p-3">
              <div className="text-sm opacity-80">Sommeil</div>
              <div className="text-2xl font-semibold">{slept}<span className="text-sm ml-1">/ {sleepGoal} h</span></div>
              <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-neon-blue to-neon-violet" style={{ width: `${sleepPct}%` }} />
              </div>
            </div>
            <div className="glass rounded-2xl p-3">
              <div className="text-sm opacity-80">Kcal du jour</div>
              <div className="text-2xl font-semibold">{totals.k}</div>
            </div>
            <div className="glass rounded-2xl p-3">
              <div className="text-sm opacity-80">Notes</div>
              <div className="text-2xl font-semibold">{notesDone ? "✓" : "—"}</div>
            </div>
          </div>
        </div>

        {/* Citation motivante */}
        <div className="mt-5 text-sm text-zinc-300 italic">“{quote}”</div>
      </Card>
    </div>
  );
}

/* ================= HYDRATATION (bouteille verticale) ================= */
function Bottle({ pct = 0 }) {
  // Hauteur totale de remplissage dans la bouteille
  const H = 200;
  const fillY = H - Math.round((H * pct) / 100);

  return (
    <svg viewBox="0 0 120 220" className="w-28 h-[220px] drop-shadow">
      <defs>
        <clipPath id="bottle-clip">
          {/* goulot + corps arrondi */}
          <path d="M50 5 h20 v20 a10 10 0 0 1 -10 10 h-0 a10 10 0 0 1 -10 -10 z M40 35 h40 v10 h-40 z
                   M35 45 q-10 30 -10 60 v60 q0 40 20 60 q20 20 40 0 q20 -20 20 -60 v-60 q0 -30 -10 -60 z" />
        </clipPath>
        <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>

      {/* contour */}
      <path d="M50 5 h20 v20 a10 10 0 0 1 -10 10 h-0 a10 10 0 0 1 -10 -10 z" fill="none" stroke="#7dd3fc" strokeWidth="3"/>
      <rect x="40" y="35" width="40" height="10" rx="4" fill="none" stroke="#7dd3fc" strokeWidth="2" />
      <path d="M35 45 q-10 30 -10 60 v60 q0 40 20 60 q20 20 40 0 q20 -20 20 -60 v-60 q0 -30 -10 -60 z" fill="none" stroke="#7dd3fc" strokeWidth="2"/>

      {/* remplissage animé */}
      <g clipPath="url(#bottle-clip)">
        <rect x="0" y={fillY} width="120" height={H + 50 - fillY} fill="url(#grad)">
          <animate attributeName="y" dur="0.4s" to={fillY} fill="freeze" />
          <animate attributeName="height" dur="0.4s" to={H + 50 - fillY} fill="freeze" />
        </rect>
      </g>
    </svg>
  );
}

function Hydration() {
  const [goal, setGoal] = useLocal("hydr.goal", 2500);
  const [logs, setLogs] = useLocal("hydr.logs", {});
  const k = todayKey();
  const ml = logs[k]?.ml || 0;
  const pct = Math.min(100, Math.round((ml / Math.max(1, goal)) * 100));

  function setMl(v) {
    setLogs(prev => ({ ...prev, [k]: { ml: Math.max(0, Math.min(v, 10000)) } }));
  }

  return (
    <Card>
      <H2>Hydratation</H2>
      <div className="mt-4 grid md:grid-cols-2 gap-6 items-center">
        <div className="grid gap-3">
          <div className="text-sm">{ml} / {goal} mL</div>
          <div className="mx-auto"><Bottle pct={pct} /></div>
          <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-neon-blue to-neon-violet" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="grid gap-3">
          <Label>Objectif (mL)</Label>
          <Input type="number" value={goal} min={500} step={50} onChange={e => setGoal(n(e.target.value, 2500))} />
          <Label>Ajuster aujourd’hui</Label>
          <input type="range" min="0" max={goal} step="50" value={ml} onChange={e => setMl(n(e.target.value, 0))} className="w-full accent-neon-blue" />
          <div className="flex flex-wrap gap-2">
            {[100, 250, 500].map(x => <Button key={x} onClick={() => setMl(ml + x)}>+{x} mL</Button>)}
            <Button onClick={() => setMl(Math.max(0, ml - 250))}>-250 mL</Button>
            <Button className="text-red-300 border-red-400" onClick={() => setMl(0)}>Reset</Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ======= Les sections suivantes arrivent dans la Partie 2 & 3 ======= */
function Musculation(){ return null; } // placeholder (Partie 2)
function Nutrition(){ return null; }   // placeholder (Partie 2)
function Sleep(){ return null; }       // placeholder (Partie 3)
function Notes(){ return null; }       // placeholder (Partie 3)
