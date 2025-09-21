import React, { useEffect, useState } from "react";

const cls = (...a) => a.filter(Boolean).join(" ");
const todayKey = () => new Date().toISOString().slice(0, 10);
const n = (x, d = 0) => {
  const v = parseFloat(x);
  return isNaN(v) ? d : v;
};
const norm = (s) =>
  (s || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
function useLocal(key, init) {
  const [s, set] = useState(() => {
    try {
      const r = localStorage.getItem(key);
      return r
        ? JSON.parse(r)
        : typeof init === "function"
        ? init()
        : init;
    } catch {
      return typeof init === "function" ? init() : init;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(s));
    } catch {}
  }, [key, s]);
  return [s, set];
}

// Composants de base
const Card = ({ className, children }) => (
  <div className={cls("glass neon-border rounded-3xl p-5 md:p-7", className)}>
    {children}
  </div>
);
const H2 = ({ children }) => (
  <h2 className="text-xl md:text-2xl font-semibold tracking-tight">{children}</h2>
);
const Label = ({ children }) => (
  <label className="text-xs uppercase tracking-wider text-zinc-300">
    {children}
  </label>
);
const Input = ({ className = "", ...p }) => (
  <input
    {...p}
    className={cls(
      "w-full bg-transparent border border-white/15 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neon-blue",
      className
    )}
  />
);
const Button = ({ className = "", ...p }) => (
  <button
    {...p}
    className={cls(
      "px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 transition active:scale-[.98]",
      className
    )}
  />
);

// Navigation
const TABS = [
  { id: "Dashboard", label: "Home" },
  { id: "Hydratation", label: "Eau" },
  { id: "Musculation", label: "Muscu" },
  { id: "Nutrition", label: "Nutri" },
  { id: "Sommeil", label: "Sleep" },
  { id: "Notes", label: "Notes" },
];

export default function App() {
  const [tab, setTab] = useLocal("ui.tab", "Dashboard");
  return (
    <div className="min-h-screen pb-24 relative overflow-x-hidden">
      <div className="stars pointer-events-none"></div>

      {/* HEADER */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-black/30 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-neon-blue to-neon-violet grid place-items-center shadow-holo">
              ∆
            </div>
            <div className="font-semibold">Self-Discipline</div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-4 py-6 grid gap-6 text-center">
        {tab === "Dashboard" && <Dashboard />}
        {tab === "Hydratation" && <Hydration />}
        {tab === "Musculation" && <Musculation />}
        {tab === "Nutrition" && <Nutrition />}
        {tab === "Sommeil" && <Sleep />}
        {tab === "Notes" && <Notes />}
      </main>

      {/* NAVIGATION EN BAS */}
      <div className="fixed bottom-3 inset-x-0 px-4">
        <div className="max-w-lg mx-auto glass neon-border rounded-3xl p-2 grid grid-cols-6 gap-1 overflow-hidden">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cls(
                "text-xs py-2 rounded-2xl truncate",
                tab === t.id &&
                  "bg-gradient-to-r from-neon-blue/30 to-neon-violet/30"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- DASHBOARD ---------------- */
function Dashboard() {
  return (
    <Card>
      <H2>Dashboard</H2>
      <p className="mt-3 text-sm text-zinc-300">
        Vue globale de tes objectifs (hydratation, muscu, nutrition, sommeil,
        notes)
      </p>
      <div className="mt-6 flex justify-center">
        <div className="w-40 h-40 rounded-full border-4 border-neon-blue flex items-center justify-center text-2xl font-bold">
          75%
        </div>
      </div>
    </Card>
  );
}

/* ---------------- HYDRATATION ---------------- */
function Hydration() {
  const [goal, setGoal] = useLocal("water.goal", 2000);
  const [current, setCurrent] = useLocal("water.current." + todayKey(), 0);
  const pct = Math.min(100, Math.round((current / goal) * 100));

  return (
    <Card>
      <H2>Hydratation</H2>
      <div className="mt-4 flex justify-center">
        <Bottle pct={pct} />
      </div>
      <p className="mt-3 text-sm">{current} ml / {goal} ml</p>
      <div className="mt-4 flex gap-2 justify-center">
        {[100, 250, 500].map((ml) => (
          <Button key={ml} onClick={() => setCurrent(current + ml)}>
            +{ml}ml
          </Button>
        ))}
      </div>
      <div className="mt-2">
        <Button onClick={() => setCurrent(0)}>Reset</Button>
      </div>
    </Card>
  );
}

function Bottle({ pct = 0 }) {
  const H = 200;
  const fillY = H - Math.round((H * pct) / 100);
  return (
    <svg viewBox="0 0 100 200" className="w-24 h-48">
      <defs>
        <clipPath id="bottle-clip">
          <rect x="20" y="10" width="60" height="180" rx="20" ry="20" />
        </clipPath>
        <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <rect
        x="20"
        y="10"
        width="60"
        height="180"
        rx="20"
        ry="20"
        stroke="#38bdf8"
        strokeWidth="4"
        fill="none"
      />
      <rect
        x="20"
        y={fillY}
        width="60"
        height={H - fillY + 10}
        clipPath="url(#bottle-clip)"
        fill="url(#grad)"
      />
    </svg>
  );
}

/* ---------------- MUSCULATION ---------------- */
function Musculation() {
  const [seances, setSeances] = useLocal("workouts", []);
  const [exo, setExo] = useState("");

  const exosPDC = ["Pompes", "Tractions", "Squats", "Burpees", "Planche"];

  const addSeance = () => {
    const name = prompt("Nom de la séance ?");
    if (name) setSeances([...seances, { name, exercices: [] }]);
  };

  return (
    <Card>
      <H2>Musculation</H2>
      <Button onClick={addSeance}>Créer une séance</Button>
      <ul className="mt-4">
        {seances.map((s, i) => (
          <li key={i} className="mt-2">
            <strong>{s.name}</strong>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <Label>Défis PDC</Label>
        <ul>
          {exosPDC.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

/* ---------------- NUTRITION ---------------- */
const foods = [
  { name: "Riz", kcal: 130, p: 2, g: 28, l: 0 },
  { name: "Poulet", kcal: 165, p: 31, g: 0, l: 3 },
  { name: "Pomme", kcal: 52, p: 0, g: 14, l: 0 },
];

function Nutrition() {
  const [meals, setMeals] = useLocal("meals." + todayKey(), []);
  const [search, setSearch] = useState("");

  const filtered = foods.filter((f) =>
    norm(f.name).includes(norm(search))
  );

  const addFood = (food) => {
    const grams = parseInt(prompt("Grammage en g ?"), 10);
    if (!grams) return;
    const entry = {
      ...food,
      grams,
      kcal: (food.kcal * grams) / 100,
      p: (food.p * grams) / 100,
      g: (food.g * grams) / 100,
      l: (food.l * grams) / 100,
    };
    setMeals([...meals, entry]);
  };

  const totals = meals.reduce(
    (acc, f) => {
      acc.kcal += f.kcal;
      acc.p += f.p;
      acc.g += f.g;
      acc.l += f.l;
      return acc;
    },
    { kcal: 0, p: 0, g: 0, l: 0 }
  );

  return (
    <Card>
      <H2>Nutrition</H2>
      <Input
        placeholder="Rechercher un aliment"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <ul className="mt-4">
        {filtered.map((f, i) => (
          <li key={i} className="flex justify-between">
            <span>{f.name}</span>
            <Button onClick={() => addFood(f)}>+ Ajouter</Button>
          </li>
        ))}
      </ul>
