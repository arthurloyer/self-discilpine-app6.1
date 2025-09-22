import React, { useEffect, useMemo, useState } from "react";

/* ------------------ Helpers ------------------ */
const cls = (...a) => a.filter(Boolean).join(" ");
const todayKey = () => new Date().toISOString().slice(0, 10);
const n = (x, d = 0) => { const v = parseFloat(x); return isNaN(v) ? d : v; };
const norm = (s) => (s || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
function useLocal(key, init) {
  const [s, set] = useState(() => {
    try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : (typeof init === "function" ? init() : init); }
    catch { return typeof init === "function" ? init() : init; }
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
      {/* Fond léger */}
      <div className="stars pointer-events-none"></div>

      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-black/30 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-neon-blue to-neon-violet grid place-items-center shadow-holo">∆</div>
            <div className="font-semibold">Self-Discipline</div>
          </div>
        </div>
      </header>

      {/* Contenu centré */}
      <main className="max-w-6xl mx-auto px-4 py-6 grid gap-6 text-center">
        {tab === "Dashboard"   && <Dashboard />}
        {tab === "Hydratation" && <Hydration />}
        {tab === "Musculation" && <Musculation />}
        {tab === "Nutrition"   && <Nutrition />}
        {tab === "Sommeil"     && <Sleep />}
        {tab === "Notes"       && <Notes />}
      </main>

      {/* Barre de nav (Notes incluse) */}
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

  // Nutrition (totaux du jour calculés depuis recettes/journal)
  const foods = JSON.parse(localStorage.getItem("nut.foods") || "[]");
  const recipes = JSON.parse(localStorage.getItem("nut.recipes") || "[]");
  const nutLogs = JSON.parse(localStorage.getItem("nut.logs") || "{}");
  const todayMeals = nutLogs[day]?.meals || { breakfast: [], lunch: [], dinner: [], snacks: [] };

  function itemMacros(it) {
    const r = recipes.find((x) => x.id === it.recipeId);
    if (!r) return { k: 0, p: 0, c: 0, f: 0 };
    const base = r.items.reduce(
      (acc, ing) => {
        const f = foods.find((x) => x.id === ing.foodId);
        const R = (ing.grams || 0) / 100;
        acc.k += Math.round((f?.per100.kcal || 0) * R);
        acc.p += Math.round((f?.per100.p || 0) * R);
        acc.c += Math.round((f?.per100.c || 0) * R);
        acc.f += Math.round((f?.per100.f || 0) * R);
        return acc;
      },
      { k: 0, p: 0, c: 0, f: 0 }
    );
    const per = {
      k: Math.round(base.k / (r.servings || 1)),
      p: Math.round(base.p / (r.servings || 1)),
      c: Math.round(base.c / (r.servings || 1)),
      f: Math.round(base.f / (r.servings || 1)),
    };
    const mult = it.portions || 1;
    return { k: per.k * mult, p: per.p * mult, c: per.c * mult, f: per.f * mult };
  }

  const totals = Object.values(todayMeals)
    .flat()
    .reduce(
      (a, it) => {
        const m = itemMacros(it);
        a.k += m.k;
        a.p += m.p;
        a.c += m.c;
        a.f += m.f;
        return a;
      },
      { k: 0, p: 0, c: 0, f: 0 }
    );

  // Notes
  const notes = JSON.parse(localStorage.getItem("notes.items") || "{}");
  const notesDone = Object.values(notes).some((list) =>
    (list || []).some((it) => it.done)
  );

  // Score global
  const score = Math.min(
    100,
    hydrPct * 0.3 + sleepPct * 0.3 + (totals.k > 0 ? 30 : 0) + (notesDone ? 10 : 0)
  );
  const scoreInt = Math.round(score);

  // Citation
  const quote = useMemo(() => {
    const QUOTES = [
      "Petits pas, grands effets.",
      "La discipline bat la motivation.",
      "Faire aujourd’hui ce que les autres remettent.",
      "Tu es en compétition avec toi-même.",
      "Chaque jour compte. Celui-ci aussi.",
    ];
    return QUOTES[new Date().getDate() % QUOTES.length];
  }, []);

  return (
    <Card className="overflow-hidden relative">
      <H2>Tableau de bord</H2>

      <div className="mt-4 grid md:grid-cols-[260px_1fr] gap-6 items-center">
        {/* Jauge principale */}
        <div className="relative w-[240px] h-[240px] mx-auto rounded-full bg-gradient-to-br from-neon-blue/40 to-neon-violet/40 border border-white/20 shadow-holo grid place-items-center">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(#38bdf8 ${scoreInt * 3.6}deg, rgba(255,255,255,.08) 0deg)`,
            }}
          ></div>
          <div className="absolute inset-5 rounded-full glass grid place-items-center">
            <div className="text-4xl font-bold">{scoreInt}</div>
            <div className="text-xs text-zinc-300">score</div>
          </div>
        </div>

        {/* Mini-widgets */}
        <div className="grid sm:grid-cols-2 gap-3 text-left">
          <div className="glass rounded-2xl p-3">
            <div className="text-sm opacity-80">Hydratation</div>
            <div className="text-2xl font-semibold">
              {ml}
              <span className="text-sm ml-1">/ {hydrGoal} mL</span>
            </div>
            <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-neon-blue to-neon-violet"
                style={{ width: `${hydrPct}%` }}
              />
            </div>
          </div>

          <div className="glass rounded-2xl p-3">
            <div className="text-sm opacity-80">Sommeil</div>
            <div className="text-2xl font-semibold">
              {slept}
              <span className="text-sm ml-1">/ {sleepGoal} h</span>
            </div>
            <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-neon-blue to-neon-violet"
                style={{ width: `${sleepPct}%` }}
              />
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
  );
}

/* ================= HYDRATATION (bouteille verticale) ================= */
function Bottle({ pct = 0 }) {
  const H = 200;
  const fillY = H - Math.round((H * pct) / 100);

  return (
    <svg viewBox="0 0 120 220" className="w-28 h-[220px] drop-shadow">
      <defs>
        <clipPath id="bottle-clip">
          <path d="M50 5 h20 v20 a10 10 0 0 1 -10 10 h-0 a10 10 0 0 1 -10 -10 z M40 35 h40 v10 h-40 z
                   M35 45 q-10 30 -10 60 v60 q0 40 20 60 q20 20 40 0 q20 -20 20 -60 v-60 q0 -30 -10 -60 z" />
        </clipPath>
        <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>

      <path d="M50 5 h20 v20 a10 10 0 0 1 -10 10 h-0 a10 10 0 0 1 -10 -10 z" fill="none" stroke="#7dd3fc" strokeWidth="3"/>
      <rect x="40" y="35" width="40" height="10" rx="4" fill="none" stroke="#7dd3fc" strokeWidth="2" />
      <path d="M35 45 q-10 30 -10 60 v60 q0 40 20 60 q20 20 40 0 q20 -20 20 -60 v-60 q0 -30 -10 -60 z" fill="none" stroke="#7dd3fc" strokeWidth="2"/>

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

/* ================= MUSCULATION (séances + catalogue + défis PDC) ================= */
const EXOS = [
  {id:"back-squat", name:"Back Squat", eq:"Barre", muscles:["Quadriceps","Fessiers","Ischios"], cues:["Pieds stables","Dos neutre","Genoux suivent orteils"], mistakes:["Dos rond","Talons décollés"], prog:"Force 3–5x3–5 • Hyper 3–5x6–10"},
  {id:"front-squat", name:"Front Squat", eq:"Barre", muscles:["Quadriceps","Tronc"], cues:["Coudes hauts","Tronc gainé"], mistakes:["Dos qui s'arrondit"], prog:"3–5x4–8"},
  {id:"goblet-squat", name:"Goblet Squat", eq:"Haltère/Kettlebell", muscles:["Quadriceps","Fessiers"], cues:["Charge près du torse"], mistakes:["Talons levés"], prog:"3–4x8–12"},
  {id:"leg-press", name:"Presse à cuisses", eq:"Machine", muscles:["Quadriceps","Fessiers"], cues:["Amplitude contrôlée"], mistakes:["Verrouiller les genoux"], prog:"3–5x8–15"},
  {id:"hip-thrust", name:"Hip Thrust", eq:"Barre", muscles:["Fessiers","Ischios"], cues:["Verrou 1s en haut"], mistakes:["Hyperextension lombaire"], prog:"3–5x6–12"},
  {id:"deadlift", name:"Soulevé de terre", eq:"Barre", muscles:["Chaîne postérieure","Dos"], cues:["Barre proche tibias","Gainage fort"], mistakes:["Dos rond"], prog:"2–5x2–6"},
  {id:"rdl", name:"Soulevé roumain", eq:"Barre/Haltères", muscles:["Ischios","Fessiers"], cues:["Hanches en arrière"], mistakes:["Trop plier genoux"], prog:"3–4x6–10"},
  {id:"pullup", name:"Tractions", eq:"Barre fixe", muscles:["Dorsaux","Biceps"], cues:["Épaules basses","Amplitude complète"], mistakes:["Balancement"], prog:"3–5x4–12"},
  {id:"chinup", name:"Chin-up", eq:"Barre fixe", muscles:["Dorsaux","Biceps"], cues:["Poitrine vers barre"], mistakes:["Demi-répétitions"], prog:"3–5x4–12"},
  {id:"lat-pulldown", name:"Tirage vertical", eq:"Machine", muscles:["Dorsaux"], cues:["Coudes vers hanches"], mistakes:["Épaules montent"], prog:"3–4x8–15"},
  {id:"row-bar", name:"Rowing barre", eq:"Barre", muscles:["Milieu du dos","Biceps"], cues:["Dos plat","Tirer nombril"], mistakes:["Coups de reins"], prog:"3–5x6–12"},
  {id:"row-cable", name:"Rowing poulie", eq:"Poulie", muscles:["Milieu du dos"], cues:["Épaules basses"], mistakes:["Tirer aux biceps"], prog:"3–4x8–15"},
  {id:"bench", name:"Développé couché", eq:"Barre", muscles:["Pecs","Triceps","Épaules"], cues:["Omoplates serrées","Coudes ~45°"], mistakes:["Fesses décollées"], prog:"3–5x3–8"},
  {id:"incline-db", name:"Développé incliné haltères", eq:"Haltères", muscles:["Haut des pecs","Épaules"], cues:["Trajectoire contrôlée"], mistakes:["Descente incomplète"], prog:"3–4x6–12"},
  {id:"ohp", name:"Développé militaire", eq:"Barre/Haltères", muscles:["Épaules","Triceps"], cues:["Gainage fort"], mistakes:["Cambrure excessive"], prog:"3–4x5–10"},
  {id:"dip", name:"Dips", eq:"Barres parallèles", muscles:["Pecs bas","Triceps"], cues:["Buste penché"], mistakes:["Épaules montent"], prog:"3–4x6–12"},
  {id:"lateral-raise", name:"Élévations latérales", eq:"Haltères", muscles:["Épaules moyennes"], cues:["Coudes souples"], mistakes:["Hausser épaules"], prog:"3–4x10–20"},
  {id:"curl-db", name:"Curl haltères", eq:"Haltères", muscles:["Biceps"], cues:["Coudes fixes"], mistakes:["Balancement"], prog:"3–4x8–15"},
  {id:"tricep-rope", name:"Extension triceps corde", eq:"Poulie", muscles:["Triceps"], cues:["Écarter en bas"], mistakes:["Coudes s'écartent"], prog:"3–4x8–15"},
];

const MUSCLES = Array.from(new Set(EXOS.flatMap(e => e.muscles))).sort();
const EQS = Array.from(new Set(EXOS.map(e => e.eq))).sort();

function Musculation() {
  const [sessions, setSessions] = useLocal("muscu.sessions", []);
  const [active, setActive] = useLocal("muscu.active", "");
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState("");
  const [eq, setEq] = useState("");
  const [sel, setSel] = useState(null);
  const [view, setView] = useState("list");
  const [rest, setRest] = useState({});

  function createSession() {
    const name = draft.trim() || `Séance ${sessions.length + 1}`;
    const id = Math.random().toString(36).slice(2);
    setSessions([...sessions, { id, name, items: [] }]);
    setActive(id);
    setDraft("");
  }
  function rename(id, name) { setSessions(sessions.map(s => s.id === id ? { ...s, name } : s)); }
  function addToSession(exId, sid = active) {
    if (!sessions.length) return alert("Crée une séance avant.");
    if (!sid) return alert("Choisis une séance.");
    setSessions(sessions.map(s => s.id === sid ? { ...s, items: [...new Set([...s.items, exId])] } : s));
  }
  function removeFromSession(exId, sid) { setSessions(sessions.map(s => s.id === sid ? { ...s, items: s.items.filter(i => i !== exId) } : s)); }
  function startRest(exId, sec = 60) { setRest(prev => ({ ...prev, [exId]: sec })); }

  useEffect(() => {
    const on = Object.values(rest).some(v => v > 0);
    if (!on) return;
    const t = setInterval(() => {
      setRest(prev => {
        const nx = { ...prev };
        Object.keys(nx).forEach(k => { if (nx[k] > 0) nx[k] -= 1; });
        return nx;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [rest]);

  const filtered = EXOS.filter(e => {
    const q = norm(query);
    const mq = !q || norm(e.name).includes(q) || norm(e.eq).includes(q) || e.muscles.some(m => norm(m).includes(q));
    const mm = !muscle || e.muscles.includes(muscle);
    const me = !eq || e.eq === eq;
    return mq && mm && me;
  });

  const act = sessions.find(s => s.id === active);

  return (
    <div className="grid gap-6">
      <Card>
        <H2>Musculation</H2>
        <div className="mt-3 grid gap-3">
          <div className="flex gap-2">
            <Input placeholder="Nom de la séance" value={draft} onChange={e => setDraft(e.target.value)} />
            <Button onClick={createSession} className="bg-gradient-to-r from-neon-blue/30 to-neon-violet/30 border-neon-violet">Créer une séance</Button>
          </div>
          {sessions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-zinc-300">Séances :</span>
              {sessions.map(s => (
                <div key={s.id} className="glass neon-border rounded-2xl px-3 py-2 flex items-center gap-2">
                  <input type="radio" name="act" checked={active === s.id} onChange={() => setActive(s.id)} />
                  <input className="bg-transparent border border-white/15 rounded-xl px-2 py-1 text-sm" value={s.name} onChange={e => rename(s.id, e.target.value)} />
                  <span className="text-xs text-zinc-400">{s.items.length} exos</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {act && act.items.length > 0 && (
        <Card>
          <div className="font-medium mb-2">Séance « {act.name} »</div>
          <div className="grid gap-2">
            {act.items.map(id => {
              const e = EXOS.find(x => x.id === id); const r = rest[id] || 0;
              return (
                <div key={id} className="flex flex-wrap items-center justify-between glass rounded-2xl px-3 py-2">
                  <div><b>{e?.name}</b> <span className="text-xs text-zinc-400">• {e?.eq} • {e?.muscles.join(", ")}</span></div>
                  <div className="flex items-center gap-2">
                    {r > 0
                      ? <span className="text-sm">Repos {r}s</span>
                      : (<><Button onClick={() => startRest(id, 60)}>60s</Button><Button onClick={() => startRest(id, 90)}>90s</Button></>)
                    }
                    <Button className="border-red-400 text-red-300" onClick={() => removeFromSession(id, act.id)}>Retirer</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Input placeholder="Rechercher (nom, muscle, matériel)..." value={query} onChange={e => setQuery(e.target.value)} />
            <div className="flex gap-2">
              <select className="bg-transparent border border-white/20 rounded-xl px-3 py-2" value={muscle} onChange={e => setMuscle(e.target.value)}>
                <option value="">Muscles : tous</option>{MUSCLES.map(m => <option key={m} className="bg-zinc-900">{m}</option>)}
              </select>
              <select className="bg-transparent border border-white/20 rounded-xl px-3 py-2" value={eq} onChange={e => setEq(e.target.value)}>
                <option value="">Matériel : tous</option>{EQS.map(m => <option key={m} className="bg-zinc-900">{m}</option>)}
              </select>
            </div>
            <div className="max-h-72 overflow-auto pr-2 grid gap-2">
              {filtered.map(ex => (
                <div key={ex.id} className="glass rounded-2xl px-3 py-2 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{ex.name}</div>
                    <div className="text-xs text-zinc-400">{ex.eq} • {ex.muscles.join(", ")}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => { setSel(ex); setView("detail"); }}>Détails</Button>
                    <Button className="bg-gradient-to-r from-neon-blue/30 to-neon-violet/30 border-neon-violet" onClick={() => addToSession(ex.id)}>Ajouter</Button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <div className="text-sm text-zinc-400">Aucun exercice.</div>}
            </div>
          </div>

          {view === "detail" && sel && (
            <div className="grid gap-2 text-left">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">{sel.name}</div>
                <Button onClick={() => setView("list")}>← Retour</Button>
              </div>
              <div className="text-sm text-zinc-300">Matériel : {sel.eq} • Muscles : {sel.muscles.join(", ")}</div>
              <div className="glass rounded-2xl p-3"><div className="font-medium mb-1">Techniques clés</div><ul className="list-disc pl-5 text-sm space-y-1">{(sel.cues || []).map((c, i) => <li key={i}>{c}</li>)}</ul></div>
              <div className="glass rounded-2xl p-3"><div className="font-medium mb-1">Erreurs fréquentes</div><ul className="list-disc pl-5 text-sm space-y-1">{(sel.mistakes || []).map((c, i) => <li key={i}>{c}</li>)}</ul></div>
              <div className="glass rounded-2xl p-3"><div className="font-medium mb-1">Respiration & Tempo</div><div className="text-sm">Excentrique 2–3s, concentrique 1s. Expire en effort, inspire en retour.</div></div>
              <div className="glass rounded-2xl p-3"><div className="font-medium mb-1">Progression type</div><div className="text-sm">{sel.prog}</div></div>
              <div className="text-xs text-zinc-400">* Références : NSCA, ACSM, McGill – (texte non cliquable).</div>
              <div className="flex gap-2">
                <Button className="bg-gradient-to-r from-neon-blue/30 to-neon-violet/30 border-neon-violet" onClick={() => addToSession(sel.id)}>Ajouter à la séance</Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <H2>Défis Poids du Corps</H2>
        <div className="grid sm:grid-cols-2 gap-3 text-left mt-3">
          {[
            { t: "Pompes", goal: "100 en 7 jours", steps: "Commence à 5x10, +5/jour" },
            { t: "Squats PDC", goal: "200 en 10 jours", steps: "4x20 matin/soir, +10/jour" },
            { t: "Gainage", goal: "3 min", steps: "Ajouter 10–15s/jour" },
            { t: "Tractions", goal: "20 strictes", steps: "Grease the groove : séries fréquentes" },
          ].map((d, i) => (
            <div key={i} className="glass rounded-2xl p-3">
              <div className="font-medium">{d.t}</div>
              <div className="text-sm text-zinc-300">Objectif : {d.goal}</div>
              <div className="text-xs text-zinc-400">{d.steps}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ================= NUTRITION (aliments, macros auto, recettes, journal) ================= */
const FOOD_BASE = [
  ["Riz blanc cuit",130,2.4,28,0.3],["Riz basmati cuit",121,3.5,25.2,0.4],["Pâtes cuites",157,5.8,30.9,0.9],
  ["Quinoa cuit",120,4.4,21.3,1.9],["Avoine (flocons)",389,16.9,66.3,6.9],["Pain complet",247,13,41,4.2],
  ["Patate douce cuite",90,2,20.7,0.2],["Pomme de terre cuite",87,1.9,20.1,0.1],["Banane",89,1.1,23,0.3],
  ["Pomme",52,0.3,14,0.2],["Myrtilles",57,0.7,14,0.3],["Avocat",160,2,9,15],
  ["Brocoli cuit",55,3.7,11.2,0.6],["Haricots verts",31,1.8,7,0.2],["Carotte",41,0.9,10,0.2],
  ["Pois chiches cuits",164,8.9,27.4,2.6],["Lentilles cuites",116,9,20,0.4],["Tofu ferme",144,15,3,8],
  ["Poulet blanc",165,31,0,3.6],["Dinde",135,29,0,1],["Bœuf 5% MG",155,26,0,5],
  ["Saumon",208,20,0,13],["Thon",132,29,0,0.6],["Œuf",143,13,1.1,10.3],
  ["Fromage blanc 0%",55,10,4,0.2],["Yaourt grec 2%",73,10,3.9,2],["Lait demi-écrémé",50,3.4,4.9,1.6],
  ["Huile d'olive",884,0,0,100],["Beurre de cacahuète",588,25,20,50],["Amandes",579,21,22,50],
  ["Noix de cajou",553,18,30,44],["Noisettes",628,15,17,61],["Noix",654,15,14,65],
  ["Fromage râpé",402,25,3.1,33],["Mozzarella",280,28,3,17],["Cheddar",403,25,1.3,33],
  ["Tomate",18,0.9,3.9,0.2],["Concombre",16,0.7,3.6,0.1],["Oignon",40,1.1,9.3,0.1],
  ["Poivron rouge",31,1,6,0.3],["Courgette",17,1.2,3.1,0.3]
].map(([name,kcal,p,c,f])=>({id: name.toLowerCase().replace(/[^a-z0-9]+/g,"-"), name, per100:{kcal,p,c,f}}));

function Nutrition() {
  const [profile, setProfile] = useLocal("nut.profile", { age:25, sex:"H", height:175, weight:70, activity:"moderate", goal:"maintain", deltaPerWeekKg:0.0, proteinPerKg:2.0, fatPerKg:0.8 });
  const [foods]   = useLocal("nut.foods", FOOD_BASE);
  const [recipes, setRecipes] = useLocal("nut.recipes", []);
  const [day] = useLocal("nut.day", todayKey());
  const [log, setLog] = useLocal("nut.logs", {});
  useEffect(() => { if(!log[day]) setLog(prev => ({ ...prev, [day]: { meals:{breakfast:[],lunch:[],dinner:[],snacks:[]}, totals:{k:0,p:0,c:0,f:0} } })); /* eslint-disable-line */ }, [day]);

  const [goalCals, macros] = useMemo(()=>{
    const w=profile.weight, h=profile.height, a=profile.age, s=profile.sex==="F"?-161:5;
    const bmr=10*w+6.25*h-5*a+s; const map={sedentary:1.2,light:1.375,moderate:1.55,active:1.725,very:1.9};
    let tdee=bmr*(map[profile.activity]||1.55);
    const delta = Math.min(700, Math.max(200, Math.abs(profile.deltaPerWeekKg||0)*7000/7));
    if(profile.goal==="cut") tdee-=delta; if(profile.goal==="bulk") tdee+=delta;
    const protein=Math.round((profile.proteinPerKg||2)*w), fat=Math.round((profile.fatPerKg||0.8)*w);
    const pf=protein*4+fat*9; const carbs=Math.max(0, Math.round((tdee-pf)/4));
    return [Math.round(tdee), {protein, carbs, fat}];
  },[profile]);

  const [search,setSearch]=useState(""); const [grams,setGrams]=useState(100); const [sel,setSel]=useState(null);
  const filtered = foods.filter(f => norm(f.name).includes(norm(search)));
  const macrosFrom = (f, g) => { const r=(g||0)/100; return { k:Math.round(f.per100.kcal*r), p:Math.round(f.per100.p*r), c:Math.round(f.per100.c*r), f:Math.round(f.per100.f*r) }; };
  const msel = sel ? macrosFrom(sel, grams) : {k:0,p:0,c:0,f:0};

  const [rid,setRid]=useState(""); const [name,setName]=useState(""); const [serv,setServ]=useState(1);
  function addRecipe() { if(!name.trim()) return; const id="r-"+Math.random().toString(36).slice(2); setRecipes([...recipes,{id,name:name.trim(),servings:serv,items:[],photo:null}]); setRid(id); setName(""); setServ(1); }
  function addIngredient(rid, foodId, grams){ setRecipes(recipes.map(r=> r.id===rid?{...r, items:[...r.items,{foodId,grams:n(grams)}]}:r)); }
  function removeIngredient(rid, idx){ setRecipes(recipes.map(r=> r.id===rid?{...r, items:r.items.filter((_,i)=>i!==idx)}:r)); }

  function addToMeal(rid, meal, portions=1){
    setLog(prev=>{
      const nx = { ...prev };
      nx[day] = nx[day] || { meals:{breakfast:[],lunch:[],dinner:[],snacks:[]}, totals:{k:0,p:0,c:0,f:0} };
      nx[day].meals[meal] = [...nx[day].meals[meal], {recipeId:rid, portions}];
      return nx;
    });
  }

  function caloriesOfFood(item){ const f=foods.find(x=>x.id===item.foodId); const r=(item.grams||0)/100; return { k:Math.round((f?.per100.kcal||0)*r), p:Math.round((f?.per100.p||0)*r), c:Math.round((f?.per100.c||0)*r), f:Math.round((f?.per100.f||0)*r) }; }
  function recipeTotals(r, portions){ const base=r.items.reduce((acc,it)=>{ const m=caloriesOfFood(it); acc.k+=m.k; acc.p+=m.p; acc.c+=m.c; acc.f+=m.f; return acc; },{k:0,p:0,c:0,f:0}); const per={k:Math.round(base.k/(r.servings||1)),p:Math.round(base.p/(r.servings||1)),c:Math.round(base.c/(r.servings||1)),f:Math.round(base.f/(r.servings||1))}; return { k:per.k*portions, p:per.p*portions, c:per.c*portions, f:per.f*portions }; }

  const totals = useMemo(()=>{
    const d = log[day]; if(!d) return {k:0,p:0,c:0,f:0};
    return Object.values(d.meals||{}).flat().reduce((acc,it)=>{
      const r=recipes.find(x=>x.id===it.recipeId); if(!r) return acc;
      const t=recipeTotals(r, it.portions||1);
      acc.k+=t.k; acc.p+=t.p; acc.c+=t.c; acc.f+=t.f; return acc;
    },{k:0,p:0,c:0,f:0});
  },[log, day, recipes]);

  useEffect(()=>{
    setLog(prev=>{
      const nx={...prev};
      nx[day] = nx[day] || { meals:{breakfast:[],lunch:[],dinner:[],snacks:[]}, totals:{k:0,p:0,c:0,f:0} };
      nx[day].totals = totals;
      return nx;
    });
  },[totals, day, setLog]);

  return (
    <div className="grid gap-6">
      <Card>
        <H2>Objectifs personnalisés</H2>
        <div className="grid md:grid-cols-2 gap-4 mt-3 text-left">
          <div className="grid gap-2">
            <Label>Sexe</Label>
            <select className="bg-transparent border border-white/20 rounded-xl px-3 py-2" value={profile.sex} onChange={e=>setProfile({...profile, sex:e.target.value})}>
              <option className="bg-zinc-900" value="H">Homme</option>
              <option className="bg-zinc-900" value="F">Femme</option>
            </select>
            <Label>Âge</Label><Input type="number" value={profile.age} onChange={e=>setProfile({...profile, age:n(e.target.value,25)})} />
            <Label>Taille (cm)</Label><Input type="number" value={profile.height} onChange={e=>setProfile({...profile, height:n(e.target.value,175)})} />
            <Label>Poids (kg)</Label><Input type="number" value={profile.weight} onChange={e=>setProfile({...profile, weight:n(e.target.value,70)})} />
            <Label>Activité</Label>
            <select className="bg-transparent border border-white/20 rounded-xl px-3 py-2" value={profile.activity} onChange={e=>setProfile({...profile, activity:e.target.value})}>
              <option className="bg-zinc-900" value="sedentary">Sédentaire</option>
              <option className="bg-zinc-900" value="light">Légère</option>
              <option className="bg-zinc-900" value="moderate">Modérée</option>
              <option className="bg-zinc-900" value="active">Active</option>
              <option className="bg-zinc-900" value="very">Très active</option>
            </select>
            <Label>Objectif</Label>
            <select className="bg-transparent border border-white/20 rounded-xl px-3 py-2" value={profile.goal} onChange={e=>setProfile({...profile, goal:e.target.value})}>
              <option className="bg-zinc-900" value="maintain">Maintien</option>
              <option className="bg-zinc-900" value="cut">Perte</option>
              <option className="bg-zinc-900" value="bulk">Prise</option>
            </select>
          </div>
          <div className="grid gap-2">
            <Label>Rythme (kg/sem)</Label><Input type="number" step="0.1" value={profile.deltaPerWeekKg} onChange={e=>setProfile({...profile, deltaPerWeekKg:n(e.target.value,0)})} />
            <Label>Prot (g/kg) • Lip (g/kg)</Label>
            <div className="flex gap-2">
              <Input type="number" step="0.1" value={profile.proteinPerKg} onChange={e=>setProfile({...profile, proteinPerKg:n(e.target.value,2)})} />
              <Input type="number" step="0.1" value={profile.fatPerKg} onChange={e=>setProfile({...profile, fatPerKg:n(e.target.value,0.8)})} />
            </div>
            <div className="grid md:grid-cols-3 gap-2 mt-2 text-sm">
              <div className="glass rounded-2xl p-3">Cals: <b>{goalCals}</b></div>
              <div className="glass rounded-2xl p-3">Protéines: <b>{macros.protein}</b> g</div>
              <div className="glass rounded-2xl p-3">Gluc/Lip: <b>{macros.carbs}/{macros.fat}</b> g</div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <H2>Bibliothèque aliments</H2>
        <div className="grid md:grid-cols-[1fr_auto] gap-3 mt-3 text-left">
          <div className="grid gap-2">
            <Input placeholder="Rechercher un aliment..." value={search} onChange={e=>setSearch(e.target.value)} />
            <div className="max-h-56 overflow-auto pr-2 grid gap-2">
              {filtered.map(f => (
                <label key={f.id} className="flex items-center justify-between glass rounded-2xl px-3 py-2">
                  <div className="text-sm"><b>{f.name}</b> <span className="text-xs text-zinc-400">• {f.per100.kcal} kcal /100g • P{f.per100.p}/G{f.per100.c}/L{f.per100.f}</span></div>
                  <input type="radio" name="food" onChange={()=>setSel(f)} />
                </label>
              ))}
              {filtered.length===0 && <div className="text-sm text-zinc-400">Aucun aliment.</div>}
            </div>
          </div>
          <div className="glass rounded-2xl p-3 h-fit">
            <div className="font-medium mb-2">Calculateur express</div>
            <div className="text-sm mb-1">{sel?sel.name:"Sélectionnez un aliment"}</div>
            <div className="flex items-center gap-2 mb-2">
              <Label>Poids (g)</Label>
              <Input type="number" value={grams} onChange={e=>setGrams(n(e.target.value,100))} style={{maxWidth:120}} />
            </div>
            <div className="grid grid-cols-4 gap-2 text-sm">
              <div className="glass rounded-xl p-2">kcal<br/><b>{msel.k}</b></div>
              <div className="glass rounded-xl p-2">Prot<br/><b>{msel.p}</b>g</div>
              <div className="glass rounded-xl p-2">Gluc<br/><b>{msel.c}</b>g</div>
              <div className="glass rounded-xl p-2">Lip<br/><b>{msel.f}</b>g</div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <H2>Recettes & Journal</H2>
        <div className="grid md:grid-cols-2 gap-3 mt-3 text-left">
          <div className="glass rounded-2xl p-3">
            <div className="font-medium mb-2">Créer une recette</div>
            <div className="flex flex-wrap gap-2">
              <Input placeholder="Nom de la recette" value={name} onChange={e=>setName(e.target.value)} />
              <Input placeholder="Portions" type="number" value={serv} onChange={e=>setServ(n(e.target.value,1))} style={{maxWidth:120}} />
              <Button onClick={addRecipe} className="bg-gradient-to-r from-neon-blue/30 to-neon-violet/30 border-neon-violet">Créer</Button>
            </div>
            <div className="mt-3">
              <Label>Mes recettes</Label>
              <select className="bg-transparent border border-white/20 rounded-xl px-3 py-2 w-full" value={rid} onChange={e=>setRid(e.target.value)}>
                <option className="bg-zinc-900" value="">— Sélectionner —</option>
                {recipes.map(r=> <option className="bg-zinc-900" key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          </div>

          <RecipeIngredients foods={foods} rid={rid} addIngredient={addIngredient} removeIngredient={removeIngredient} recipes={recipes} />
        </div>

        <DayJournal recipes={recipes} addToMeal={addToMeal} log={log[day] || {meals:{breakfast:[],lunch:[],dinner:[],snacks:[]}}} totals={totals} />
      </Card>
    </div>
  );
}

function RecipeIngredients({ foods, rid, addIngredient, removeIngredient, recipes }) {
  const [search,setSearch]=useState(""); const [grams,setGrams]=useState(100); const [sel,setSel]=useState("");
  const filtered = foods.filter(f=> norm(f.name).includes(norm(search)));
  const r = recipes.find(x=>x.id===rid);
  function caloriesOfFood(item){ const f=foods.find(x=>x.id===item.foodId); const ratio=(item.grams||0)/100; return { k:Math.round((f?.per100.kcal||0)*ratio), p:Math.round((f?.per100.p||0)*ratio), c:Math.round((f?.per100.c||0)*ratio), f:Math.round((f?.per100.f||0)*ratio) }; }
  if(!r) return <div className="glass rounded-2xl p-3">Sélectionne ou crée une recette pour ajouter des ingrédients.</div>;

  return (
    <div className="glass rounded-2xl p-3">
      <div className="font-medium mb-2">Ajouter un ingrédient</div>
      <Input placeholder="Rechercher un aliment..." value={search} onChange={e=>setSearch(e.target.value)} />
      <div className="max-h-40 overflow-auto pr-2 grid gap-2 mt-2">
        {filtered.map(f => (
          <label key={f.id} className="flex items-center justify-between glass rounded-2xl px-3 py-2">
            <span className="text-sm">{f.name}</span>
            <input type="radio" name="food" onChange={()=>setSel(f.id)} />
          </label>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <Label>Poids (g)</Label>
        <Input type="number" value={grams} onChange={e=>setGrams(n(e.target.value,100))} style={{maxWidth:120}} />
        <Button onClick={()=> sel && addIngredient(rid, sel, grams)} className="bg-gradient-to-r from-neon-blue/30 to-neon-violet/30 border-neon-violet">Ajouter</Button>
      </div>

      <div className="font-medium mt-4 mb-2">Ingrédients</div>
      <div className="grid gap-2 max-h-48 overflow-auto pr-2">
        {r.items.map((it,idx)=>{ const f=foods.find(x=>x.id===it.foodId); const m=caloriesOfFood(it); return (
          <div key={idx} className="flex items-center justify-between glass rounded-2xl px-3 py-2">
            <div className="text-sm"><b>{f?.name||it.foodId}</b> <span className="text-xs text-zinc-400">• {it.grams} g • {m.k} kcal • P{m.p}/G{m.c}/L{m.f}</span></div>
            <Button className="text-red-300 border-red-400" onClick={()=>removeIngredient(r.id, idx)}>Retirer</Button>
          </div>
        )})}
        {r.items.length===0 && <div className="text-sm text-zinc-400">Aucun ingrédient.</div>}
      </div>
    </div>
  );
}

function DayJournal({ recipes, addToMeal, log, totals }){
  const [rid,setRid]=useState(""); const [meal,setMeal]=useState("lunch"); const [p,setP]=useState(1);
  return (
    <div className="grid gap-3 mt-4 text-left">
      <div className="glass rounded-2xl p-3">
        <div className="font-medium mb-2">Ajouter au jour</div>
        <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <select className="bg-transparent border border-white/20 rounded-xl px-3 py-2" value={rid} onChange={e=>setRid(e.target.value)}>
            <option className="bg-zinc-900" value="">— Recette —</option>
            {recipes.map(r=> <option className="bg-zinc-900" key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <div className="flex gap-2">
            <select className="bg-transparent border border-white/20 rounded-xl px-3 py-2" value={meal} onChange={e=>setMeal(e.target.value)}>
              <option className="bg-zinc-900" value="breakfast">Petit-déj</option>
              <option className="bg-zinc-900" value="lunch">Déjeuner</option>
              <option className="bg-zinc-900" value="dinner">Dîner</option>
              <option className="bg-zinc-900" value="snacks">Collation</option>
            </select>
            <Input type="number" min="1" value={p} onChange={e=>setP(n(e.target.value,1))} style={{maxWidth:100}} />
          </div>
          <Button onClick={()=> rid && addToMeal(rid, meal, p)} className="bg-gradient-to-r from-neon-blue/30 to-neon-violet/30 border-neon-violet">Ajouter</Button>
        </div>
      </div>

      <div className="glass rounded-2xl p-3">
        <div className="font-medium mb-2">Journal du jour</div>
        <div className="grid md:grid-cols-2 gap-2">
          {Object.entries(log.meals || {breakfast:[],lunch:[],dinner:[],snacks:[]}).map(([k,arr])=>(
            <div key={k} className="glass rounded-2xl p-3">
              <div className="font-medium mb-1">{{breakfast:'Petit-déj',lunch:'Déjeuner',dinner:'Dîner',snacks:'Collation'}[k]}</div>
              <div className="grid gap-2">{arr.map((it,idx)=>{ const r=recipes.find(x=>x.id===it.recipeId); return (
                <div key={idx} className="glass rounded-2xl px-3 py-2 flex items-center justify-between">
                  <div className="text-sm"><b>{r?.name||it.recipeId}</b> <span className="text-xs text-zinc-400">• {it.portions||1} portion</span></div>
                </div>
              )})}</div>
              {arr.length===0 && <div className="text-sm text-zinc-400">—</div>}
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-2 text-sm mt-3">
          <div className="glass rounded-2xl p-3">Total kcal: <b>{totals.k}</b></div>
          <div className="glass rounded-2xl p-3">Prot: <b>{totals.p}</b> g</div>
          <div className="glass rounded-2xl p-3">Gluc/Lip: <b>{totals.c}/{totals.f}</b> g</div>
        </div>
      </div>
    </div>
  );
}

/* ================= SOMMEIL amélioré ================= */
function Sleep() {
  const [goal, setGoal] = useLocal("sleep.goal", 8);
  const [log, setLog] = useLocal("sleep.log", {});
  const k = todayKey();
  const today = new Date();

  const wakeTime = new Date(today.getTime() + 24 * 3600 * 1000);
  wakeTime.setHours(7, 0, 0, 0);
  const bedtime = new Date(wakeTime.getTime() - goal * 3600 * 1000);

  function setSlept(h) { setLog(prev => ({ ...prev, [k]: { h } })); }

  return (
    <Card>
      <H2>Sommeil</H2>
      <div className="grid md:grid-cols-2 gap-6 mt-3 text-left">
        <div className="grid gap-3">
          <Label>Objectif (heures / nuit)</Label>
          <Input type="number" min="4" max="12" step="0.5" value={goal} onChange={e => setGoal(n(e.target.value, 8))} />
          <Label>Heure de coucher conseillée</Label>
          <div className="glass rounded-2xl p-3">{bedtime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          <Label>Conseils sommeil</Label>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Dors avant 23h pour optimiser la récupération.</li>
            <li>Évite les écrans 30 min avant.</li>
            <li>Expose-toi à la lumière naturelle le matin.</li>
          </ul>
        </div>
        <div className="grid gap-3">
          <Label>Sommeil enregistré aujourd’hui</Label>
          <Input type="number" step="0.5" value={log[k]?.h || ""} onChange={e => setSlept(n(e.target.value, 0))} />
          <div className="glass rounded-2xl p-3">
            {log[k]?.h ? `Tu as dormi ${log[k].h}h, objectif ${goal}h.` : "Renseigne ton sommeil ce matin."}
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ================= NOTES (catégories simples) ================= */
function Notes() {
  const [items, setItems] = useLocal("notes.items", { todo: [], buy: [], ideas: [] });
  const cats = { todo: "À faire", buy: "À acheter", ideas: "Idées" };

  function add(cat) {
    const t = prompt(`Nouvelle note (${cats[cat]}) :`);
    if (t) setItems({ ...items, [cat]: [...items[cat], { text: t, done: false }] });
  }
  function toggle(cat, i) {
    setItems({ ...items, [cat]: items[cat].map((x, j) => j === i ? { ...x, done: !x.done } : x) });
  }
  function remove(cat, i) {
    setItems({ ...items, [cat]: items[cat].filter((_, j) => j !== i) });
  }

  return (
    <Card>
      <H2>Notes</H2>
      <div className="grid md:grid-cols-3 gap-4 mt-4 text-left">
        {Object.keys(cats).map(cat => (
          <div key={cat} className="glass rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">{cats[cat]}</div>
              <Button onClick={() => add(cat)}>+ Ajouter</Button>
            </div>
            <ul className="grid gap-2">
              {items[cat].map((it, i) => (
                <li key={i} className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={it.done} onChange={() => toggle(cat, i)} />
                    <span className={cls(it.done && "line-through opacity-60")}>{it.text}</span>
                  </label>
                  <Button className="text-red-300 border-red-400" onClick={() => remove(cat, i)}>✕</Button>
                </li>
              ))}
              {items[cat].length === 0 && <li className="text-sm text-zinc-400">— vide —</li>}
            </ul>
          </div>
        ))}
      </div>
    </Card>
  );
}
