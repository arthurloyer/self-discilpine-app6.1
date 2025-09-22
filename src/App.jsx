import React, { useEffect, useMemo, useState } from "react";
import logoUrl from "./assets/LOGOASCEND.png";

/* ------------------ UI de base ------------------ */
const cls = (...a) => a.filter(Boolean).join(" ");
const H1 = ({ children }) => <div className="h1">{children}</div>;
const H2 = ({ children }) => <div className="h2">{children}</div>;
const Label = ({ children }) => <div className="sub" style={{ textTransform: "uppercase" }}>{children}</div>;
const Button = ({ className = "", ...p }) => <button className={cls("btn", className)} {...p} />;
const Input = ({ className = "", ...p }) => <input className={cls("input", className)} {...p} />;

function ThemedCard({ themeMode, className = "", style, children, ...p }) {
  const isSobre = themeMode === "sobre";
  const baseStyle = isSobre
    ? {
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 24,
        boxShadow: "0 6px 20px rgba(0,0,0,0.07)",
        padding: 16,
      }
    : undefined; // en néon, on laisse la classe .card (déjà stylée dans index.css)
  return (
    <div
      className={cls(isSobre ? "" : "card", className)}
      style={{ ...(baseStyle || {}), ...(style || {}) }}
      {...p}
    >
      {children}
    </div>
  );
}

/* ------------------ Helpers ------------------ */
const todayKey = () => new Date().toISOString().slice(0, 10);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ------------------ Thème (Sobre / Néon) ------------------ */
function applyTheme(mode) {
  const r = document.documentElement;
  if (mode === "sobre") {
    // fond blanc, texte noir, bordures gris clair
    r.style.setProperty("--bg", "#ffffff");
    r.style.setProperty("--text", "#000000");
    r.style.setProperty("--border", "#e5e7eb");
    // accents sobres (noir/gris)
    r.style.setProperty("--accent1", "#111111");
    r.style.setProperty("--accent2", "#111111");
  } else {
    // NEON (comme avant)
    r.style.setProperty("--bg", "#0b0c12");
    r.style.setProperty("--text", "#ffffff");
    r.style.setProperty("--border", "rgba(255,255,255,0.18)");
    r.style.setProperty("--accent1", "#38bdf8");
    r.style.setProperty("--accent2", "#a855f7");
  }
}

function useThemeMode() {
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem("ascend.theme") || "neon");
  useEffect(() => {
    applyTheme(themeMode);
    localStorage.setItem("ascend.theme", themeMode);
  }, [themeMode]);
  return { themeMode, setThemeMode };
}

/* ------------------ Header / SideMenu / BottomNav ------------------ */
function Header({ onMenu }) {
  return (
    <header className="header">
      <div className="container header-inner">
        <div className="row" style={{ gap: 12 }}>
          <img src={logoUrl} alt="Ascend" style={{ width: 28, height: 28, objectFit: "contain" }} />
          <div style={{ fontWeight: 600, letterSpacing: 0.3 }}>Ascend</div>
        </div>
        <Button aria-label="Menu" onClick={onMenu}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ display: "block", width: 24, height: 2, background: "var(--text)" }} />
            <span style={{ display: "block", width: 24, height: 2, background: "var(--text)" }} />
            <span style={{ display: "block", width: 24, height: 2, background: "var(--text)" }} />
          </div>
        </Button>
      </div>
    </header>
  );
}

function SideMenu({ open, onClose, themeMode, setThemeMode }) {
  return (
    <>
      {open && <div className="sidemenu-backdrop" onClick={onClose} />}
      <div className={cls("sidemenu", open && "sidemenu--open")}>
        <div className="stack" style={{ height: "100%", overflow: "auto", padding: 16 }}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div style={{ fontWeight: 600, fontSize: 18 }}>Menu</div>
            <Button onClick={onClose}>Fermer</Button>
          </div>

          <ThemedCard themeMode={themeMode}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Contact</div>
            <p className="sub" style={{ textTransform: "none" }}>contact@ascend.app (exemple)</p>
          </ThemedCard>

          <ThemedCard themeMode={themeMode}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Mes informations</div>
            <p className="sub" style={{ textTransform: "none" }}>Taille, poids, objectifs… (à venir)</p>
          </ThemedCard>

          <ThemedCard themeMode={themeMode}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Mon compte</div>
            <p className="sub" style={{ textTransform: "none" }}>Version locale : pas de compte requis.</p>
          </ThemedCard>

          <ThemedCard themeMode={themeMode}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Thème</div>
            <div className="row">
              <Button
                onClick={() => setThemeMode("sobre")}
                style={{
                  borderColor: themeMode === "sobre" ? "var(--text)" : "var(--border)",
                  background: themeMode === "sobre" ? (themeMode === "sobre" ? "#f3f4f6" : "transparent") : "transparent",
                }}
              >
                Sobre
              </Button>
              <Button
                onClick={() => setThemeMode("neon")}
                style={{
                  borderColor: themeMode === "neon" ? "var(--text)" : "var(--border)",
                  background: themeMode === "neon" ? "rgba(255,255,255,.08)" : "transparent",
                }}
              >
                Néon
              </Button>
            </div>
          </ThemedCard>
        </div>
      </div>
    </>
  );
}

function BottomNav({ tab, setTab, themeMode }) {
  const items = [
    { id: "dashboard", label: "Dashboard" },
    { id: "hydration", label: "Hydratation" },
    { id: "muscle", label: "Musculation" },
    { id: "nutrition", label: "Nutrition" },
    { id: "sleep", label: "Sommeil" },
    { id: "notes", label: "Notes" },
  ];
  const isSobre = themeMode === "sobre";
  return (
    <nav
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        borderTop: `1px solid var(--border)`,
        background: isSobre ? "#ffffff" : "rgba(0,0,0,.35)",
        backdropFilter: isSobre ? "none" : "blur(10px)",
      }}
    >
      <div className="container" style={{ paddingTop: 10, paddingBottom: 10 }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          {items.map((it) => (
            <Button
              key={it.id}
              onClick={() => setTab(it.id)}
              style={{
                padding: "10px 12px",
                borderRadius: 16,
                border: "1px solid var(--border)",
                background:
                  tab === it.id
                    ? isSobre
                      ? "#f3f4f6"
                      : "rgba(255,255,255,.08)"
                    : "transparent",
              }}
            >
              {it.label}
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
}

/* ------------------ Sections ------------------ */
/* Hydratation */
function HydrationSection() {
  const k = todayKey();
  const [goal, setGoal] = useState(Number(localStorage.getItem("hydr.goal") || 2500));
  const logs = JSON.parse(localStorage.getItem("hydr.logs") || "{}");
  const current = logs[k]?.ml || 0;

  const [val, setVal] = useState(current);
  useEffect(() => setVal(current), [current]);

  const pct = clamp(Math.round((val / Math.max(1, goal)) * 100), 0, 100);

  function save(v) {
    const all = { ...logs, [k]: { ml: v } };
    localStorage.setItem("hydr.logs", JSON.stringify(all));
    setVal(v);
    window.dispatchEvent(new Event("storage"));
  }

  return (
    <div className="stack">
      <div className="grid grid-2" style={{ alignItems: "center" }}>
        {/* Bouteille */}
        <div className="bottle-wrap">
          <svg viewBox="0 0 120 240" className="bottle">
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

            {/* contours */}
            <path d="M50 5 h20 v20 a10 10 0 0 1 -10 10 a10 10 0 0 1 -10 -10 z"
                  fill="none" stroke="var(--accent1)" strokeWidth="3"/>
            <rect x="40" y="35" width="40" height="10" rx="4" fill="none"
                  stroke="var(--accent1)" strokeWidth="2" />
            <path d="M35 45 q-10 30 -10 60 v60 q0 40 20 60 q20 20 40 0 q20 -20 20 -60 v-60 q0 -30 -10 -60 z"
                  fill="none" stroke="var(--accent1)" strokeWidth="2"/>

            {/* Remplissage animé */}
            <g clipPath="url(#clip)">
              <rect
                x="0"
                y={200 - Math.round((200 * pct) / 100)}
                width="120"
                height={50 + Math.round((200 * pct) / 100)}
                fill="url(#grad)">
                <animate attributeName="y" dur="0.35s"
                         to={200 - Math.round((200 * pct) / 100)} fill="freeze" />
                <animate attributeName="height" dur="0.35s"
                         to={50 + Math.round((200 * pct) / 100)} fill="freeze" />
              </rect>
            </g>
          </svg>

          <div style={{ fontWeight: 600 }}>{val} mL / {goal} mL</div>
          <div className="progress" style={{ width: "100%", maxWidth: 360 }}>
            <div className="progress__bar" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Contrôles */}
        <div className="stack">
          <Label>Ajuster ton apport</Label>
          <input type="range" min="0" max={goal} value={val}
                 onChange={e => save(Number(e.target.value))} style={{ width: "100%" }} />
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span className="sub">0 mL</span>
            <span className="sub">{goal} mL</span>
          </div>

          <Label>Objectif (mL)</Label>
          <Input
            type="number"
            value={goal}
            onChange={e => {
              const v = Number(e.target.value) || 0;
              setGoal(v);
              localStorage.setItem("hydr.goal", String(v));
              if (val > v) save(v);
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* Musculation */
const EXOS = [
  { id: "pushups", name: "Pompes", tips: ["Dos droit, mains sous épaules.", "Gainage constant."] },
  { id: "squats", name: "Squats", tips: ["Pieds largeur épaules.", "Descends cuisses // au sol."] },
  { id: "plank", name: "Planche", tips: ["Coudes sous épaules.", "Bassin neutre."] },
  { id: "lunges", name: "Fentes", tips: ["Genou avant au-dessus de la cheville.", "Tronc droit."] },
  { id: "burpees", name: "Burpees", tips: ["Mouvement complet, explosif.", "Reste gainé."] },
];

function useDailyChallenge() {
  const k = todayKey();
  const saved = JSON.parse(localStorage.getItem("muscle.challenge") || "{}")[k];
  const [challenge, setLocal] = useState(() => {
    if (saved) return saved;
    const i = Math.floor(Math.random() * EXOS.length);
    const base = { id: EXOS[i].id, name: EXOS[i].name, done: false };
    const all = JSON.parse(localStorage.getItem("muscle.challenge") || "{}");
    all[k] = base;
    localStorage.setItem("muscle.challenge", JSON.stringify(all));
    return base;
  });

  function setDone(v) {
    const all = JSON.parse(localStorage.getItem("muscle.challenge") || "{}");
    const next = { ...challenge, done: v };
    all[k] = next;
    localStorage.setItem("muscle.challenge", JSON.stringify(all));
    setLocal(next);

    // impact simple sur hydratation (exemple)
    const goal = Number(localStorage.getItem("hydr.goal") || 2500);
    localStorage.setItem("hydr.goal", String(v ? goal + 200 : Math.max(500, goal - 200)));
    window.dispatchEvent(new Event("storage"));
  }

  return { challenge, setDone };
}

function MusculationSection() {
  const { challenge, setDone } = useDailyChallenge();
  const [q, setQ] = useState("");
  const list = EXOS.filter(x => x.name.toLowerCase().includes(q.toLowerCase()));
  const [open, setOpen] = useState(null);

  return (
    <div className="stack">
      <ThemedCard themeMode={localStorage.getItem("ascend.theme") || "neon"}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div className="sub">Défi PDC du jour</div>
            <div style={{ fontWeight: 600, marginTop: 4 }}>{challenge.name}</div>
          </div>
          <label className="row" style={{ gap: 8 }}>
            <input type="checkbox" checked={!!challenge.done} onChange={e => setDone(e.target.checked)} />
            <span>Fait</span>
          </label>
        </div>
      </ThemedCard>

      <ThemedCard themeMode={localStorage.getItem("ascend.theme") || "neon"}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div className="h2">Bibliothèque d’exercices</div>
          <Input placeholder="Rechercher…" value={q} onChange={e => setQ(e.target.value)} style={{ maxWidth: 220 }} />
        </div>
        <div className="grid grid-2" style={{ marginTop: 12 }}>
          {list.map(ex => (
            <div key={ex.id}>
              <ThemedCard
                themeMode={localStorage.getItem("ascend.theme") || "neon"}
                className="btn"
                onClick={() => setOpen(open === ex.id ? null : ex.id)}
              >
                <div style={{ fontWeight: 600 }}>{ex.name}</div>
              </ThemedCard>
              {open === ex.id && (
                <ThemedCard themeMode={localStorage.getItem("ascend.theme") || "neon"} style={{ marginTop: 8 }}>
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <div className="h2">Conseils — {ex.name}</div>
                    <Button onClick={() => setOpen(null)}>Fermer</Button>
                  </div>
                  <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                    {ex.tips.map((t, i) => <li key={i} className="sub" style={{ textTransform: "none" }}>{t}</li>)}
                  </ul>
                </ThemedCard>
              )}
            </div>
          ))}
        </div>
      </ThemedCard>
    </div>
  );
}

/* Nutrition (simple) */
const BASE_FOODS = [
  { id: "eau", name: "Eau", per100: { kcal: 0, p: 0, c: 0, f: 0 } },
  { id: "poulet", name: "Poulet (100g cuit)", per100: { kcal: 165, p: 31, c: 0, f: 3.6 } },
  { id: "riz", name: "Riz cuit (100g)", per100: { kcal: 130, p: 2.7, c: 28, f: 0.3 } },
  { id: "pomme", name: "Pomme (100g)", per100: { kcal: 52, p: 0.3, c: 14, f: 0.2 } },
];

function NutritionSection() {
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem("nut.profile")) || { weight: 70, height: 175, target: "maintien" }; }
    catch { return { weight: 70, height: 175, target: "maintien" }; }
  });
  const [foods, setFoods] = useState(() => {
    try { return JSON.parse(localStorage.getItem("nut.foods")) || BASE_FOODS; }
    catch { return BASE_FOODS; }
  });
  const [q, setQ] = useState("");
  const kcalTarget = useMemo(() => {
    const base = profile.weight * 30;
    if (profile.target === "perte") return Math.round(base - 300);
    if (profile.target === "prise") return Math.round(base + 300);
    return Math.round(base);
  }, [profile]);

  function saveProfile(next) {
    setProfile(next);
    localStorage.setItem("nut.profile", JSON.stringify(next));
  }
  function addFood() {
    const name = prompt("Nom de l’aliment ?");
    if (!name) return;
    const kcal = Number(prompt("kcal / 100g ?") || "0");
    const p = Number(prompt("protéines / 100g ?") || "0");
    const c = Number(prompt("glucides / 100g ?") || "0");
    const f = Number(prompt("lipides / 100g ?") || "0");
    const next = [...foods, { id: Date.now().toString(36), name, per100: { kcal, p, c, f } }];
    setFoods(next);
    localStorage.setItem("nut.foods", JSON.stringify(next));
  }

  const list = foods.filter(f => f.name.toLowerCase().includes(q.toLowerCase()));
  const [grams, setGrams] = useState(100);
  const selected = list[0];
  const totals = selected ? {
    kcal: Math.round(selected.per100.kcal * (grams / 100)),
    p: +(selected.per100.p * (grams / 100)).toFixed(1),
    c: +(selected.per100.c * (grams / 100)).toFixed(1),
    f: +(selected.per100.f * (grams / 100)).toFixed(1),
  } : { kcal: 0, p: 0, c: 0, f: 0 };

  return (
    <div className="stack">
      <ThemedCard themeMode={localStorage.getItem("ascend.theme") || "neon"}>
        <div className="h2">Objectif personnalisé</div>
        <div className="grid grid-3" style={{ marginTop: 12 }}>
          <div>
            <Label>Poids (kg)</Label>
            <Input type="number" value={profile.weight}
              onChange={e => saveProfile({ ...profile, weight: Number(e.target.value) || 0 })} />
          </div>
          <div>
            <Label>Taille (cm)</Label>
            <Input type="number" value={profile.height}
              onChange={e => saveProfile({ ...profile, height: Number(e.target.value) || 0 })} />
          </div>
          <div>
            <Label>Objectif</Label>
            <select className="input" value={profile.target}
              onChange={e => saveProfile({ ...profile, target: e.target.value })}>
              <option value="maintien">Maintien</option>
              <option value="perte">Perte de poids</option>
              <option value="prise">Prise de masse</option>
            </select>
          </div>
        </div>
        <div className="row" style={{ marginTop: 10 }}>
          <div className="sub">Apport conseillé :</div>
          <div style={{ fontWeight: 600 }}>{kcalTarget} kcal / jour (approx.)</div>
        </div>
      </ThemedCard>

      <ThemedCard themeMode={localStorage.getItem("ascend.theme") || "neon"}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div className="h2">Bibliothèque alimentaire</div>
          <div className="row">
            <Input placeholder="Rechercher…" value={q} onChange={e => setQ(e.target.value)} />
            <Button onClick={addFood}>Ajouter</Button>
          </div>
        </div>

        {selected && (
          <div className="grid grid-2" style={{ marginTop: 12, alignItems: "start" }}>
            <div>
              <div style={{ fontWeight: 600 }}>{selected.name}</div>
              <Label>Poids (g)</Label>
              <Input type="number" value={grams} onChange={e => setGrams(Number(e.target.value) || 0)} />
            </div>
            <div>
              <Label>Macros calculées</Label>
              <div className="row" style={{ gap: 18, marginTop: 6 }}>
                <div className="card"><div className="sub">kcal</div><div style={{ fontWeight: 700 }}>{totals.kcal}</div></div>
                <div className="card"><div className="sub">P</div><div style={{ fontWeight: 700 }}>{totals.p} g</div></div>
                <div className="card"><div className="sub">C</div><div style={{ fontWeight: 700 }}>{totals.c} g</div></div>
                <div className="card"><div className="sub">F</div><div style={{ fontWeight: 700 }}>{totals.f} g</div></div>
              </div>
            </div>
          </div>
        )}

        {!selected && <div className="sub" style={{ marginTop: 12, textTransform: "none" }}>Aucun aliment trouvé.</div>}
      </ThemedCard>
    </div>
  );
}

/* Sommeil */
function SleepSection() {
  const k = todayKey();
  const logs = JSON.parse(localStorage.getItem("hydr.logs") || "{}");
  const ml = logs[k]?.ml || 0;
  const goal = Number(localStorage.getItem("hydr.goal") || 2500);
  const ratio = goal ? ml / goal : 0;
  const baseBed = 23;
  const shift = ratio < 0.6 ? -0.5 : 0;
  const bedHour = (baseBed + shift + 24) % 24;
  const text = `Heure de coucher conseillée : ${String(Math.floor(bedHour)).padStart(2, "0")}:${shift === -0.5 ? "30" : "00"}`;

  return (
    <div className="stack">
      <ThemedCard themeMode={localStorage.getItem("ascend.theme") || "neon"}>
        <div className="h2">Recommandation</div>
        <div style={{ marginTop: 8 }}>{text}</div>
        <div className="sub" style={{ marginTop: 8, textTransform: "none" }}>
          Conseil : vise un endormissement avant 23h pour une meilleure récupération.
        </div>
      </ThemedCard>
    </div>
  );
}

/* Notes */
function NotesSection() {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("notes.items")) || []; }
    catch { return []; }
  });
  const [txt, setTxt] = useState("");

  function addNote() {
    const content = txt.trim();
    if (!content) return;
    const next = [{ id: Date.now(), content }, ...items];
    setItems(next);
    localStorage.setItem("notes.items", JSON.stringify(next));
    setTxt("");
  }
  function removeNote(id) {
    const next = items.filter(n => n.id !== id);
    setItems(next);
    localStorage.setItem("notes.items", JSON.stringify(next));
  }

  return (
    <div className="stack">
      <ThemedCard themeMode={localStorage.getItem("ascend.theme") || "neon"}>
        <div className="h2">Nouvelle note</div>
        <div className="stack" style={{ marginTop: 8 }}>
          <textarea
            className="input break-anywhere"
            rows={4}
            placeholder="Écris ta note…"
            value={txt}
            onChange={e => setTxt(e.target.value)}
            style={{ resize: "vertical", background: "transparent" }}
          />
          <Button onClick={addNote}>Ajouter</Button>
        </div>
      </ThemedCard>

      <ThemedCard themeMode={localStorage.getItem("ascend.theme") || "neon"}>
        <div className="h2">Mes notes</div>
        <div className="stack" style={{ marginTop: 8 }}>
          {items.length === 0 && <div className="sub" style={{ textTransform: "none" }}>Aucune note.</div>}
          {items.map(n => (
            <div key={n.id} className="card" style={{ background: "transparent" }}>
              <div className="break-anywhere" style={{ whiteSpace: "pre-wrap" }}>{n.content}</div>
              <div className="row" style={{ justifyContent: "flex-end", marginTop: 8 }}>
                <Button className="btn--danger" onClick={() => removeNote(n.id)}>Supprimer</Button>
              </div>
            </div>
          ))}
        </div>
      </ThemedCard>
    </div>
  );
}

/* Dashboard */
function Dashboard({ themeMode }) {
  const k = todayKey();
  const goal = Number(localStorage.getItem("hydr.goal") || 2500);
  const logs = JSON.parse(localStorage.getItem("hydr.logs") || "{}");
  const ml = logs[k]?.ml || 0;
  const hydrPct = clamp(Math.round((ml / Math.max(1, goal)) * 100), 0, 100);

  return (
    <ThemedCard themeMode={themeMode}>
      <H1>Tableau de bord</H1>
      <div className="grid grid-3" style={{ marginTop: 12 }}>
        <ThemedCard themeMode={themeMode}>
          <div className="sub">Hydratation</div>
          <div style={{ marginTop: 8, fontWeight: 600 }}>{ml} mL / {goal} mL</div>
          <div className="progress" style={{ marginTop: 8 }}>
            <div className="progress__bar" style={{ width: `${hydrPct}%` }} />
          </div>
        </ThemedCard>
        <ThemedCard themeMode={themeMode}>
          <div className="sub">Sommeil</div>
          <div style={{ marginTop: 8 }}>Voir section</div>
          <div className="progress" style={{ marginTop: 8 }}>
            <div className="progress__bar" style={{ width: "66%" }} />
          </div>
        </ThemedCard>
        <ThemedCard themeMode={themeMode}>
          <div className="sub">Nutrition & Défi</div>
          <div style={{ marginTop: 8 }}>Voir sections</div>
          <div className="progress" style={{ marginTop: 8 }}>
            <div className="progress__bar" style={{ width: "50%" }} />
          </div>
        </ThemedCard>
      </div>
    </ThemedCard>
  );
}

/* ------------------ APP ------------------ */
export default function App() {
  const { themeMode, setThemeMode } = useThemeMode();
  const [menuOpen, setMenuOpen] = useState(false);
  const [tab, setTab] = useState("dashboard");

  // Re-render minimal si localStorage change
  const [, setTick] = useState(0);
  useEffect(() => {
    const on = () => setTick(t => t + 1);
    window.addEventListener("storage", on);
    return () => window.removeEventListener("storage", on);
  }, []);

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)" }}>
      <Header onMenu={() => setMenuOpen(true)} />

      <main style={{ paddingBottom: 90 /* évite d’être masqué par la BottomNav fixée */ }}>
        <div className="container stack-lg">
          {tab === "dashboard" && <Dashboard themeMode={themeMode} />}

          {tab === "hydration" && (
            <section>
              <H2>Hydratation</H2>
              <div style={{ height: 12 }} />
              <HydrationSection />
            </section>
          )}

          {tab === "muscle" && (
            <section>
              <H2>Musculation</H2>
              <div style={{ height: 12 }} />
              <MusculationSection />
            </section>
          )}

          {tab === "nutrition" && (
            <section>
              <H2>Nutrition</H2>
              <div style={{ height: 12 }} />
              <NutritionSection />
            </section>
          )}

          {tab === "sleep" && (
            <section>
              <H2>Sommeil</H2>
              <div style={{ height: 12 }} />
              <SleepSection />
            </section>
          )}

          {tab === "notes" && (
            <section>
              <H2>Notes</H2>
              <div style={{ height: 12 }} />
              <NotesSection />
            </section>
          )}
        </div>
      </main>

      <BottomNav tab={tab} setTab={setTab} themeMode={themeMode} />
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} themeMode={themeMode} setThemeMode={setThemeMode} />
    </div>
  );
}
