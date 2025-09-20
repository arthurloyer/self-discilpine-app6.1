import React, { useEffect, useMemo, useState } from "react";

const cls = (...a) => a.filter(Boolean).join(" ");
const todayKey = () => new Date().toISOString().slice(0,10);
const n = (x, d=0) => { const v=parseFloat(x); return isNaN(v)?d:v; };
const norm = (s) => (s||"").normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
function useLocal(key, init) {
  const [s, set] = useState(() => { try{const r=localStorage.getItem(key); return r?JSON.parse(r):(typeof init==='function'?init():init)}catch{return typeof init==='function'?init():init} });
  useEffect(()=>{ try{localStorage.setItem(key, JSON.stringify(s))}catch{} }, [key, s]);
  return [s, set];
}

const Card = ({className, children}) => (<div className={cls("glass neon-border rounded-3xl p-5 md:p-7", className)}>{children}</div>);
const H2 = ({children}) => (<h2 className="text-xl md:text-2xl font-semibold tracking-tight">{children}</h2>);
const Label = ({children}) => (<label className="text-xs uppercase tracking-wider text-zinc-300">{children}</label>);
const Input = ({className="", ...p}) => (<input {...p} className={cls("w-full bg-transparent border border-white/15 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neon-blue", className)} />);
const Button = ({className="", ...p}) => (<button {...p} className={cls("px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 transition active:scale-[.98]", className)} />);

const TABS = [
  {id:"Dashboard", label:"Home"},
  {id:"Hydratation", label:"Eau"},
  {id:"Musculation", label:"Muscu"},
  {id:"Nutrition", label:"Nutri"},
  {id:"Sommeil", label:"Sleep"},
  {id:"Notes", label:"Notes"},
];

export default function App(){
  const [tab, setTab] = useLocal("ui.tab", "Dashboard");
  return (
    <div className="min-h-screen pb-24 relative">
      <div className="stars pointer-events-none"></div>
      <header className="sticky top-0 z-20 backdrop-blur-md bg-black/30 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-neon-blue to-neon-violet grid place-items-center shadow-holo">∆</div>
            <div className="font-semibold">Self-Discipline</div>
          </div>
          <nav className="hidden md:flex gap-2">{TABS.map(t => <Button key={t.id} onClick={()=>setTab(t.id)} className={cls(tab===t.id && "bg-gradient-to-r from-neon-blue/30 to-neon-violet/30 border-neon-violet")}>{t.id}</Button>)}</nav>
          <select className="md:hidden bg-transparent border border-white/20 rounded-xl px-3 py-2" value={tab} onChange={e=>setTab(e.target.value)}>{TABS.map(t=><option key={t.id} className="bg-zinc-900" value={t.id}>{t.id}</option>)}</select>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid gap-6">
        {tab==="Dashboard" && <Dashboard/>}
        {tab==="Hydratation" && <Hydration/>}
        {tab==="Musculation" && <Musculation/>}
        {tab==="Nutrition" && <Nutrition/>}
        {tab==="Sommeil" && <Sleep/>}
        {tab==="Notes" && <Notes/>}
      </main>

      {/* Barre du bas: 5 cases fixes + Notes accessible séparément */}
      <div className="fixed bottom-3 inset-x-0 px-4">
        <div className="max-w-md mx-auto glass neon-border rounded-3xl p-1 grid grid-cols-5 gap-1 overflow-hidden">
          {TABS.filter((_,i)=>i<5).map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)} className={cls("text-xs py-2 rounded-2xl truncate", tab===t.id && "bg-gradient-to-r from-neon-blue/30 to-neon-violet/30")}>{t.label}</button>
          ))}
        </div>
        <div className="mt-2 text-center">
          <button onClick={()=>setTab("Notes")} className="text-[11px] opacity-80 underline">Notes</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Hydratation: bouteille ---------- */
function Bottle({ pct=0 }){
  const H = 260;
  const fillY = H - Math.round((H * pct)/100);
  return (
    <svg viewBox="0 0 120 260" className="w-28 mx-auto drop-shadow" aria-hidden="true">
      <defs>
        <clipPath id="bottle-clip">
          <path d="M45 10 h30 v20 a10 10 0 0 1 -10 10 h-10 a10 10 0 0 1 -10 -10 z
                   M35 40 h50 v15 h-50 z
                   M30 55 q-10 30 -10 60 v60 q0 40 20 60 q20 20 40 0 q20 -20 20 -60 v-60 q0 -30 -10 -60 z" />
        </clipPath>
        <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8"/>
          <stop offset="100%" stopColor="#a855f7"/>
        </linearGradient>
      </defs>
      <path d="M45 10 h30 v20 a10 10 0 0 1 -10 10 h-10 a10 10 0 0 1 -10 -10 z" fill="rgba(255,255,255,.15)" />
      <rect x="35" y="40" width="50" height="15" rx="6" fill="rgba(255,255,255,.12)" />
      <path d="M30 55 q-10 30 -10 60 v60 q0 40 20 60 q20 20 40 0 q20 -20 20 -60 v-60 q0 -30 -10 -60 z" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.2)"/>
      <g clipPath="url(#bottle-clip)">
        <rect x="0" y={fillY} width="120" height="300" fill="url(#grad)" />
      </g>
    </svg>
  );
}
function Hydration(){
  const [goal, setGoal] = useLocal("hydr.goal", 2500);
  const [logs, setLogs] = useLocal("hydr.logs", {});
  const k=todayKey(); const ml=logs[k]?.ml||0; const pct=Math.min(100, Math.round(ml/(goal||1)*100));
  function setMl(v){ setLogs(prev=>({...prev,[k]:{ml:v}})); }
  return (
    <Card>
      <div className="flex items-center justify-between mb-4"><H2>Hydratation</H2><div className="text-sm">{ml} / {goal} mL</div></div>
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <Label>Objectif (mL)</Label>
          <Input type="number" value={goal} min={500} step={50} onChange={e=>setGoal(n(e.target.value,2500))} className="mt-1" />
          <div className="mt-5 glass rounded-2xl neon-border p-4 grid place-items-center">
            <Bottle pct={pct} />
            <div className="text-sm mt-2">Remplissage : {pct}%</div>
          </div>
        </div>
        <div>
          <Label>Glisser pour ajuster</Label>
          <input type="range" min="0" max={goal} step="50" value={ml} onChange={e=>setMl(n(e.target.value,0))} className="w-full accent-neon-blue mt-2" />
          <div className="mt-3 h-3 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-neon-blue to-neon-violet" style={{width:`${pct}%`}}></div></div>
        </div>
      </div>
    </Card>
  );
}

/* ---------- Musculation (catalogue élargi + conseils) ---------- */
const EXOS = [
  {id:"back-squat", name:"Back Squat", eq:"Barre", muscles:["Quadriceps","Fessiers","Ischios"], cues:["Pieds stables","Dos neutre","Genoux suivent orteils","Casse parallèle"], mistakes:["Dos rond","Talons décollés","Genoux rentrent"], prog:"Force 3–5x3–5 • Hypertrophie 3–5x6–10"},
  {id:"front-squat", name:"Front Squat", eq:"Barre", muscles:["Quadriceps","Tronc"], cues:["Coudes hauts","Tronc gainé"], mistakes:["Dos qui s'arrondit"], prog:"3–5x4–8"},
  {id:"goblet-squat", name:"Goblet Squat", eq:"Haltère/Kettlebell", muscles:["Quadriceps","Fessiers"], cues:["Charge près du torse"], mistakes:["Talons levés"], prog:"3–4x8–12"},
  {id:"leg-press", name:"Presse à cuisses", eq:"Machine", muscles:["Quadriceps","Fessiers"], cues:["Amplitude contrôlée"], mistakes:["Verrouiller les genoux"], prog:"3–5x8–15"},
  {id:"bulgarian-split-squat", name:"Split squat bulgare", eq:"Haltères", muscles:["Quadriceps","Fessiers"], cues:["Genou aligné"], mistakes:["Tronc qui tombe"], prog:"3–4x8–12 par jambe"},
  {id:"hip-thrust", name:"Hip Thrust", eq:"Barre", muscles:["Fessiers","Ischios"], cues:["Verrou en haut 1s"], mistakes:["Hyperextension lombaire"], prog:"3–5x6–12"},
  {id:"deadlift", name:"Soulevé de terre", eq:"Barre", muscles:["Chaîne postérieure","Dos"], cues:["Barre proche tibias","Gainage fort"], mistakes:["Dos rond"], prog:"2–5x2–6"},
  {id:"rdl", name:"Soulevé de terre roumain", eq:"Barre/Haltères", muscles:["Ischios","Fessiers"], cues:["Hanches en arrière"], mistakes:["Plier trop les genoux"], prog:"3–4x6–10"},
  {id:"walking-lunge", name:"Fentes marchées", eq:"Haltères", muscles:["Quadriceps","Fessiers"], cues:["Grande foulée"], mistakes:["Genou dépasse trop"], prog:"3–4x8–12 par jambe"},
  {id:"pullup", name:"Tractions", eq:"Barre", muscles:["Dorsaux","Biceps"], cues:["Épaules basses","Amplitude complète"], mistakes:["Balancement"], prog:"3–5x4–12"},
  {id:"chinup", name:"Chin-up", eq:"Barre", muscles:["Dorsaux","Biceps"], cues:["Poitrine à la barre"], mistakes:["Demi-répétitions"], prog:"3–5x4–12"},
  {id:"lat-pulldown", name:"Tirage vertical", eq:"Machine", muscles:["Dorsaux"], cues:["Tirer coudes vers hanches"], mistakes:["Monter les épaules"], prog:"3–4x8–15"},
  {id:"row-bar", name:"Rowing barre", eq:"Barre", muscles:["Milieu du dos","Biceps"], cues:["Dos plat","Tirer vers nombril"], mistakes:["Coups de reins"], prog:"3–5x6–12"},
  {id:"row-cable", name:"Rowing poulie", eq:"Poulie", muscles:["Milieu du dos"], cues:["Épaules basses"], mistakes:["Tirer avec biceps seulement"], prog:"3–4x8–15"},
  {id:"bench", name:"Développé couché", eq:"Barre", muscles:["Pecs","Triceps","Épaules ant."], cues:["Omoplates serrées","Coudes ~45°"], mistakes:["Fesses qui décollent"], prog:"3–5x3–8"},
  {id:"incline-db", name:"Développé incliné haltères", eq:"Haltères", muscles:["Haut des pecs","Épaules"], cues:["Trajectoire contrôlée"], mistakes:["Descente incomplète"], prog:"3–4x6–12"},
  {id:"ohp", name:"Développé militaire", eq:"Barre/Haltères", muscles:["Épaules","Triceps"], cues:["Gainage","Trajectoire proche"], mistakes:["Cambrure excessive"], prog:"3–4x5–10"},
  {id:"dip", name:"Dips", eq:"Barres parallèles", muscles:["Pecs inf.","Triceps"], cues:["Buste légèrement penché"], mistakes:["Épaules qui montent"], prog:"3–4x6–12"},
  {id:"curl-db", name:"Curl haltères", eq:"Haltères", muscles:["Biceps"], cues:["Coudes fixes"], mistakes:["Balancement"], prog:"3–4x8–15"},
  {id:"hammer-curl", name:"Curl marteau", eq:"Haltères", muscles:["Brachial","Brachioradial"], cues:["Poignets neutres"], mistakes:["Trop lourd"], prog:"3–4x8–15"},
  {id:"tricep-rope", name:"Extension triceps corde", eq:"Poulie", muscles:["Triceps"], cues:["Écarter en bas"], mistakes:["Coudes qui s'écartent"], prog:"3–4x8–15"},
  {id:"lateral-raise", name:"Élévations latérales", eq:"Haltères", muscles:["Épaules moyennes"], cues:["Léger coude fléchi"], mistakes:["Hausser les épaules"], prog:"3–4x10–20"},
  {id:"rear-delt", name:"Élévations arrière", eq:"Haltères", muscles:["Deltoïdes post."], cues:["Buste penché"], mistakes:["Traction du dos"], prog:"3–4x10–20"},
  {id:"pec-deck", name:"Pec Deck", eq:"Machine", muscles:["Pectoraux"], cues:["Épaule basse"], mistakes:["Amplitude réduite"], prog:"3–4x10–15"}
];
const MUSCLES = Array.from(new Set(EXOS.flatMap(e=>e.muscles))).sort();
const EQS = Array.from(new Set(EXOS.map(e=>e.eq))).sort();

function Musculation(){
  const [sessions, setSessions] = useLocal("muscu.sessions", []);
  const [active, setActive] = useLocal("muscu.active", "");
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState(""); const [muscle, setMuscle]=useState(""); const [eq, setEq]=useState("");
  const [rest, setRest] = useState({});
  const [view, setView] = useState("list"); const [sel, setSel] = useState(null);

  function createSession(){ const name=draft.trim()||`Séance ${sessions.length+1}`; const id=Math.random().toString(36).slice(2); setSessions([...sessions,{id,name,items:[]}]); setActive(id); setDraft(""); }
  function rename(id,name){ setSessions(sessions.map(s=> s.id===id?{...s,name}:s)); }
  function addToSession(exId, sid=active){ if(!sessions.length) return alert("Crée une séance avant."); if(!sid) return alert("Choisis une séance."); setSessions(sessions.map(s=> s.id===sid?{...s,items:[...new Set([...s.items, exId])]}:s)); }
  function removeFromSession(exId, sid){ setSessions(sessions.map(s=> s.id===sid?{...s,items:s.items.filter(i=>i!==exId)}:s)); }
  function startRest(exId, sec=60){ setRest(prev=>({...prev,[exId]:sec})); }
  useEffect(()=>{ const on = Object.values(rest).some(v=>v>0); if(!on) return; const t=setInterval(()=>{ setRest(prev=>{ const nx={...prev}; Object.keys(nx).forEach(k=>{ if(nx[k]>0) nx[k]-=1; }); return nx; }); },1000); return ()=>clearInterval(t); },[rest]);

  const filtered = EXOS.filter(e=>{
    const q=norm(query);
    const mq=!q || norm(e.name).includes(q) || norm(e.eq).includes(q) || e.muscles.some(m=>norm(m).includes(q));
    const mm=!muscle || e.muscles.includes(muscle); const me=!eq || e.eq===eq; return mq && mm && me;
  });

  function randomEx(){ const pool = filtered.length?filtered:EXOS; const x = pool[Math.floor(Math.random()*pool.length)]; setSel(x); setView("detail"); }

  const act = sessions.find(s=>s.id===active);
  return (
    <div className="grid gap-6">
      <Card>
        <H2>Musculation</H2>
        <div className="mt-3 grid gap-3">
          <div className="flex gap-2">
            <Input placeholder="Nom de la séance" value={draft} onChange={e=>setDraft(e.target.value)} />
            <Button onClick={createSession} className="bg-gradient-to-r from-neon-blue/30 to-neon-violet/30 border-neon-violet">Créer une séance</Button>
          </div>
          {sessions.length>0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-zinc-300">Séances :</span>
              {sessions.map(s => (
                <div key={s.id} className="glass neon-border rounded-2xl px-3 py-2 flex items-center gap-2">
                  <input type="radio" name="act" checked={active===s.id} onChange={()=>setActive(s.id)} />
                  <input className="bg-transparent border border-white/15 rounded-xl px-2 py-1 text-sm" value={s.name} onChange={e=>rename(s.id, e.target.value)} />
                  <span className="text-xs text-zinc-400">{s.items.length} exos</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {act && act.items.length>0 && (
        <Card>
          <div className="font-medium mb-2">Séance « {act.name} »</div>
          <div className="grid gap-2">
            {act.items.map(id=>{ const e=EXOS.find(x=>x.id===id); const r=rest[id]||0; return (
              <div key={id} className="flex flex-wrap items-center justify-between glass rounded-2xl px-3 py-2">
                <div><b>{e?.name}</b> <span className="text-xs text-zinc-400">• {e?.eq} • {e?.muscles.join(", ")}</span></div>
                <div className="flex items-center gap-2">
                  {r>0 ? <span className="text-sm">Repos {r}s</span> : (<><Button onClick={()=>startRest(id,60)}>60s</Button><Button onClick={()=>startRest(id,90)}>90s</Button></>)}
                  <Button className="border-red-400 text-red-300" onClick={()=>removeFromSession(id, act.id)}>Retirer</Button>
                </div>
              </div>
            )})}
          </div>
        </Card>
      )}

      <Card>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Input placeholder="Rechercher (nom, muscle, matériel)..." value={query} onChange={e=>setQuery(e.target.value)} />
            <div className="flex gap-2">
              <select className="bg-transparent border border-white/20 rounded-xl px-3 py-2" value={muscle} onChange={e=>setMuscle(e.target.value)}>
                <option value="">Muscles : tous</option>{MUSCLES.map(m=><option key={m} className="bg-zinc-900">{m}</option>)}
              </select>
              <select className="bg-transparent border border-white/20 rounded-xl px-3 py-2" value={eq} onChange={e=>setEq(e.target.value)}>
                <option value="">Matériel : tous</option>{EQS.map(m=><option key={m} className="bg-zinc-900">{m}</option>)}
              </select>
              <Button onClick={randomEx}>Exercice au hasard 🎲</Button>
            </div>
            <div className="max-h-72 overflow-auto pr-2 grid gap-2">
              {filtered.map(ex => (
                <div key={ex.id} className="glass rounded-2xl px-3 py-2 flex items-center justify-between">
                  <div><div className="font-medium">{ex.name}</div><div className="text-xs text-zinc-400">{ex.eq} • {ex.muscles.join(", ")}</div></div>
                  <div className="flex gap-2">
                    <Button onClick={()=>{setSel(ex); setView('detail')}}>Détails</Button>
                    <Button className="bg-gradient-to-r from-neon-blue/30 to-neon-violet/30 border-neon-violet" onClick={()=>addToSession(ex.id)}>Ajouter</Button>
                  </div>
                </div>
              ))}
              {filtered.length===0 && <div className="text-sm text-zinc-400">Aucun exercice.</div>}
            </div>
          </div>
          {view==="detail" && sel && (
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">{sel.name}</div>
                <Button onClick={()=>setView('list')}>← Retour</Button>
              </div>
              <div className="text-sm text-zinc-300">Matériel : {sel.eq} • Muscles : {sel.muscles.join(", ")}</div>
              <div className="glass rounded-2xl p-3"><div className="font-medium mb-1">Techniques clés</div><ul className="list-disc pl-5 text-sm space-y-1">{(sel.cues||[]).map((c,i)=><li key={i}>{c}</li>)}</ul></div>
              <div className="glass rounded-2xl p-3"><div className="font-medium mb-1">Erreurs fréquentes</div><ul className="list-disc pl-5 text-sm space-y-1">{(sel.mistakes||[]).map((c,i)=><li key={i}>{c}</li>)}</ul></div>
              <div className="glass rounded-2xl p-3"><div className="font-medium mb-1">Respiration & Tempo</div><div className="text-sm">Excentrique contrôlée (2–3s), concentrique explosive (1s). Expire en effort, inspire en retour.</div></div>
              <div className="glass rounded-2xl p-3"><div className="font-medium mb-1">Amplitude & sécurité</div><div className="text-sm">Amplitude complète sans douleur, gainage actif, trajectoire stable.</div></div>
              <div className="glass rounded-2xl p-3"><div className="font-medium mb-1">Progression type</div><div className="text-sm">{sel.prog}</div></div>
              <div className="text-xs text-zinc-400">* Références : NSCA, ACSM, McGill – (texte non cliquable).</div>
              <div className="flex gap-2"><Button className="bg-gradient-to-r from-neon-blue/30 to-neon-violet/30 border-neon-violet" onClick={()=>addToSession(sel.id)}>Ajouter à la séance</Button></div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

/* ---------- Nutrition (40+ aliments, recherche, grammes -> macros) ---------- */
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

function Nutrition(){
  const [profile, setProfile] = useLocal("nut.profile", { age:25, sex:"H", height:175, weight:70, activity:"moderate", goal:"maintain", deltaPerWeekKg:0.0, proteinPerKg:2.0, fatPerKg:0.8 });
  const [foods] = useLocal("nut.foods", FOOD_BASE);
  const [recipes, setRecipes] = useLocal("nut.recipes", []);
  const [day] = useLocal("nut.day", todayKey());
  const [log, setLog] = useLocal("nut.logs", {});
  if(!log[day]) log[day] = { meals:{breakfast:[],lunch:[],dinner:[],snacks:[]} };

  const [goalCals, macros] = useMemo(()=>{
    const w=profile.weight, h=profile.height, a=profile.age, s=profile.sex==="F"?-161:5;
    const bmr=10*w+6.25*h-5*a+s; const map={sedentary:1.2,light:1.375,moderate:1.55,active:1.725,very:1.9};
    let tdee=bmr*(map[profile.activity]||1.55);
    const delta = Math.min(700, Math.max(200, Math.abs(profile.deltaPerWeekKg||0)*7000/7));
    if(profile.goal==="cut") tdee-=delta; if(profile.goal==="bulk") tdee+=delta;
    const protein=Math.round((profile.proteinPerKg||2)*w), fat=Math.round((profile.fatPerKg||0.8)*w), pf=protein*4+fat*9; const carbs=Math.max(0, Math.round((tdee-pf)/4));
    return [Math.round(tdee), {protein, carbs, fat}];
  },[profile]);

  const [search,setSearch]=useState(""); const [grams,setGrams]=useState(100); const [sel,setSel]=useState(null);
  const filtered = foods.filter(f => norm(f.name).includes(norm(search)));
  const macrosFrom = (f, g) => {
    const ratio=(g||0)/100;
    return { k:Math.round(f.per100.kcal*ratio), p:Math.round(f.per100.p*ratio), c:Math.round(f.per100.c*ratio), f:Math.round(f.per100.f*ratio) };
  };
  const msel = sel ? macrosFrom(sel, grams) : {k:0,p:0,c:0,f:0};

  const [recipesUI, setRecipesUI] = useState({rid:"", portions:1, meal:"lunch"});
  function addRecipe(name, servings=1){ const id="r-"+Math.random().toString(36).slice(2); setRecipes([...recipes,{id,name,servings,items:[],photo:null}]); setRecipesUI(v=>({...v,rid:id})); }
  function addIngredient(rid, foodId, grams){ setRecipes(recipes.map(r=> r.id===rid?{...r, items:[...r.items,{foodId,grams:n(grams)}]}:r)); }
  function removeIngredient(rid, idx){ setRecipes(recipes.map(r=> r.id===rid?{...r, items:r.items.filter((_,i)=>i!==idx)}:r)); }
  function addToMeal(rid, meal, portions=1){ setLog(prev=>{ const nx={...prev}; nx[day]=nx[day]||{meals:{breakfast:[],lunch:[],dinner:[],snacks:[]}}; nx[day].meals[meal]=[...nx[day].meals[meal], {recipeId:rid, portions}]; return nx; }); }

  function caloriesOfFood(item){ const f=foods.find(x=>x.id===item.foodId); const ratio=(item.grams||0)/100; return { k:Math.round((f?.per100.kcal||0)*ratio), p:Math.round((f?.per100.p||0)*ratio), c:Math.round((f?.per100.c||0)*ratio), f:Math.round((f?.per100.f||0)*ratio) }; }
  function recipeTotals(r, portions){ const base=r.items.reduce((acc,it)=>{ const m=caloriesOfFood(it); acc.k+=m.k; acc.p+=m.p; acc.c+=m.c; acc.f+=m.f; return acc; },{k:0,p:0,c:0,f:0}); const per={k:Math.round(base.k/(r.servings||1)),p:Math.round(base.p/(r.servings||1)),c:Math.round(base.c/(r.servings||1)),f:Math.round(base.f/(r.servings||1))}; return { k:per.k*portions, p:per.p*portions, c:per.c*portions, f:per.f*portions }; }
  const totals = Object.values(log[day].meals).flat().reduce((acc,it)=>{ const r=recipes.find(x=>x.id===it.recipeId); if(!r) return acc; const t=recipeTotals(r, it.portions||1); acc.k+=t.k; acc.p+=t.p; acc.c+=t.c; acc.f+=t.f; return acc; },{k:0,p:0,c:0,f:0});

  return (
    <div className="grid gap-6">
      <Card>
        <H2>Objectifs personnalisés</H2>
        <div className="grid md:grid-cols-2 gap-4 mt-3">
          <div className="grid gap-2">
            <Label>Sexe</Label><select className="bg-transparent border border-white/20 rounded-xl px-3 py-2" value={profile.sex} onChange={e=>setProfile({...profile, sex:e.target.value})}><option className="bg-zinc-900" value="H">Homme</option><option className="bg-zinc-900" value="F">Femme</option></select>
            <Label>Âge</Label><Input type="number" value={profile.age} onChange={e=>setProfile({...profile, age:n(e.target.value,25)})} />
            <Label>Taille (cm)</Label><Input type="number" value={profile.height} onChange={e=>setProfile({...profile, height:n(e.target.value,175)})} />
            <Label>Poids (kg)</Label><Input type="number" value={profile.weight} onChange={e=>setProfile({...profile, weight:n(e.target.value,70)})} />
            <Label>Activité</Label><select className="bg-transparent border border-white/20 rounded-xl px-3 py-2" value={profile.activity} onChange={e=>setProfile({...profile, activity:e.target.value})}><option className="bg-zinc-900" value="sedentary">Sédentaire</option><option className="bg-zinc-900" value="light">Légère</option><option className="bg-zinc-900" value="moderate">Modérée</option><option className="bg-zinc-900" value="active">Active</option><option className="bg-zinc-900" value="very">Très active</option></select>
            <Label>Objectif</Label><select className="bg-transparent border border-white/20 rounded-xl px-3 py-2" value={profile.goal} onChange={e=>setProfile({...profile, goal:e.target.value})}><option className="bg-zinc-900" value="maintain">Maintien</option><option className="bg-zinc-900" value="cut">Perte</option><option className="bg-zinc-900" value="bulk">Prise</option></select>
          </div>
          <div className="grid gap-2">
            <Label>Rythme (kg/sem)</Label><Input type="number" step="0.1" value={profile.deltaPerWeekKg} onChange={e=>setProfile({...profile, deltaPerWeekKg:n(e.target.value,0)})} />
            <Label>Prot (g/kg) • Lip (g/kg)</Label>
            <div className="flex gap-2"><Input type="number" step="0.1" value={profile.proteinPerKg} onChange={e=>setProfile({...profile, proteinPerKg:n(e.target.value,2)})} /><Input type="number" step="0.1" value={profile.fatPerKg} onChange={e=>setProfile({...profile, fatPerKg:n(e.target.value,0.8)})} /></div>
            <div className="grid md:grid-cols-3 gap-2 mt-2 text-sm">
              <div className="glass rounded-2xl p-3">Cals: <b>{goalCals}</b></div>
              <div className="glass rounded-2xl p-3">Protéines: <b>{macros.protein}</b> g</div>
              <div className="glass rounded-2xl p-3">Glucides/Lipides: <b>{macros.carbs}/{macros.fat}</b> g</div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <H2>Bibliothèque aliments</H2>
        <div className="grid md:grid-cols-[1fr_auto] gap-3 mt-3">
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
        <RecipeBuilder foods={foods} addIngredient={addIngredient} removeIngredient={removeIngredient} addRecipe={addRecipe} recipes={recipes} />
        <DayJournal recipes={recipes} addToMeal={addToMeal} log={log[day]} totals={totals} />
      </Card>
    </div>
  );
}

function RecipeBuilder({ foods, addIngredient, removeIngredient, addRecipe, recipes }){
  const [rid,setRid]=useState(""); const [name,setName]=useState(""); const [serv,setServ]=useState(1);
  const [search,setSearch]=useState(""); const [grams,setGrams]=useState(100); const [sel,setSel]=useState("");
  const filtered = foods.filter(f=> norm(f.name).includes(norm(search)));
  const r=recipes.find(x=>x.id===rid);
  function caloriesOfFood(item){ const f=foods.find(x=>x.id===item.foodId); const ratio=(item.grams||0)/100; return { k:Math.round((f?.per100.kcal||0)*ratio), p:Math.round((f?.per100.p||0)*ratio), c:Math.round((f?.per100.c||0)*ratio), f:Math.round((f?.per100.f||0)*ratio) }; }

  return (<div className="grid gap-3 mt-3">
    <div className="glass rounded-2xl p-3 grid md:grid-cols-[1fr_auto] gap-3">
      <div className="flex flex-wrap gap-2">
        <Input placeholder="Nom de la recette" value={name} onChange={e=>setName(e.target.value)} />
        <Input placeholder="Portions" type="number" value={serv} onChange={e=>setServ(n(e.target.value,1))} style={{maxWidth:120}} />
      </div>
      <Button onClick={()=>{ if(!name.trim()) return; addRecipe(name.trim(), serv); setName(""); setServ(1); }} className="bg-gradient-to-r from-neon-blue/30 to-neon-violet/30 border-neon-violet">Créer</Button>
      <div className="md:col-span-2">
        <Label>Mes recettes</Label>
        <select className="bg-transparent border border-white/20 rounded-xl px-3 py-2 w-full" value={rid} onChange={e=>setRid(e.target.value)}>
          <option className="bg-zinc-900" value="">— Sélectionner —</option>
          {recipes.map(r=> <option className="bg-zinc-900" key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </div>
    </div>

    {r && (<div className="grid md:grid-cols-2 gap-3">
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
          <Button onClick={()=> sel && addIngredient(r.id, sel, grams)} className="bg-gradient-to-r from-neon-blue/30 to-neon-violet/30 border-neon-violet">Ajouter</Button>
        </div>
      </div>

      <div className="glass rounded-2xl p-3">
        <div className="font-medium mb-2">Ingrédients</div>
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
    </div>)}
  </div>);
}

function DayJournal({ recipes, addToMeal, log, totals }){
  const [rid,setRid]=useState(""); const [meal,setMeal]=useState("lunch"); const [p,setP]=useState(1);
  return (<div className="grid gap-3 mt-3">
    <div className="glass rounded-2xl p-3">
      <div className="font-medium mb-2">Ajouter au jour</div>
      <div className="grid gap-2">
        <select className="bg-transparent border border-white/20 rounded-xl px-3 py-2" value={rid} onChange={e=>setRid(e.target.value)}>
          <option className="bg-zinc-900" value="">— Recette —</option>
          {recipes.map(r=> <option className="bg-zinc-900" key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <select className="bg-transparent border border-white/20 rounded-xl px-3 py-2" value={meal} onChange={e=>setMeal(e.target.value)}>
            <option className="bg-zinc-900" value="breakfast">Petit-déj</option>
            <option className="bg-zinc-900" value="lunch">Déjeuner</option>
            <option className="bg-zinc-900" value="dinner">Dîner</option>
            <option className="bg-zinc-900" value="snacks">Collation</option>
          </select>
          <Input type="number" min="1" value={p} onChange={e=>setP(n(e.target.value,1))} style={{maxWidth:100}} />
          <Button onClick={()=> rid && addToMeal(rid, meal, p)} className="bg-gradient-to-r from-neon-blue/30 to-neon-violet/30 border-neon-violet">Ajouter</Button>
        </div>
    </div>
    </div>

    <div className="glass rounded-2xl p-3">
      <div className="font-medium mb-2">Journal du jour</div>
      <div className="grid md:grid-cols-2 gap-2">
        {Object.entries(log.meals).map(([k,arr])=>(
          <div key={k} className="glass rounded-2xl p-3">
            <div className="font-medium mb-1">{{breakfast:'Petit-déj',lunch:'Déjeuner',dinner:'Dîner',snacks:'Collation'}[k]}</div>
            <div className="grid gap-2">{arr.map((it,idx)=>{ const r=recipes.find(x=>x.id===it.recipeId); return (<div key={idx} className="glass rounded-2xl px-3 py-2 flex items-center justify-between"><div className="text-sm"><b>{r?.name||it.recipeId}</b> <span className="text-xs text-zinc-400">• {it.portions||1} portion</span></div></div>)})}</div>
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
  </div>);
}

/* ---------- Sommeil ---------- */
function Sleep(){
  const [goalH, setGoalH] = useLocal("sleep.goal", 8);
  const [wake, setWake] = useLocal("sleep.wake", "07:00");
  const [log, setLog] = useLocal("sleep.log", {});
  const [morningMl, setMorningMl] = useLocal("sleep.mornMl", 500);
  const k=todayKey(); const slept=log[k]?.h||0;
  function setSlept(v){ setLog(prev=>({...prev, [k]:{h:v}})); }
  function bedtime(w, need){ const [hh,mm]=w.split(":").map(x=>parseInt(x,10)); const m=(hh*60+mm)-Math.round(need*60); const x=(m+24*60)%(24*60); const H=String(Math.floor(x/60)).padStart(2,"0"); const M=String(x%60).padStart(2,"0"); return `${H}:${M}`; }
  const bed=bedtime(wake, goalH);
  const after23 = bed >= "23:00";
  return (
    <Card>
      <H2>Sommeil</H2>
      <div className="grid md:grid-cols-2 gap-4 mt-3">
        <div className="grid gap-2">
          <Label>Heures visées</Label><Input type="number" step="0.5" value={goalH} onChange={e=>setGoalH(n(e.target.value,8))} />
          <Label>Réveil demain</Label><Input type="time" value={wake} onChange={e=>setWake(e.target.value)} />
          <div className="text-sm mt-1">Coucher conseillé : <b>{bed}</b> {after23 && <span className="text-amber-300">• vise avant 23h si possible</span>}</div>
        </div>
        <div className="grid gap-2">
          <Label>Sommeil dernière nuit (h)</Label><Input type="number" step="0.25" value={slept} onChange={e=>setSlept(n(e.target.value,0))} />
          <Label>Hydratation du réveil (mL)</Label>
          <div className="flex gap-2 items-center"><Input type="number" value={morningMl} onChange={e=>setMorningMl(n(e.target.value,500))} style={{maxWidth:140}} /><Button onClick={()=>{ const d=todayKey(); const logs=JSON.parse(localStorage.getItem("hydr.logs")||"{}"); const cur=logs[d]?.ml||0; logs[d]={ml:cur+morningMl}; localStorage.setItem("hydr.logs", JSON.stringify(logs)); }}>J’ai bu</Button></div>
        </div>
      </div>
    </Card>
  );
}

/* ---------- Notes ---------- */
function Notes(){
  const [cats, setCats] = useLocal("notes.cats", ["À faire","À acheter","Idées"]);
  const [active, setActive] = useLocal("notes.active", "À faire");
  const [items, setItems] = useLocal("notes.items", {});
  const [text, setText] = useState(""); const [catDraft, setCatDraft] = useState("");
  useEffect(()=>{ setItems(prev=>{ const nx={...prev}; cats.forEach(c=>{ if(!nx[c]) nx[c]=[]; }); return nx; }); if(!cats.includes(active)) setActive(cats[0]||""); }, [JSON.stringify(cats)]);
  function add(){ if(!text.trim()) return; setItems(prev=>{ const nx={...prev}; nx[active]=[...(nx[active]||[]), {id:Math.random().toString(36).slice(2), text:text.trim(), done:false}]; return nx; }); setText(""); }
  function toggle(id){ setItems(prev=>{ const nx={...prev}; nx[active]=nx[active].map(it=> it.id===id?{...it,done:!it.done}:it); return nx; }); }
  function remove(id){ setItems(prev=>{ const nx={...prev}; nx[active]=nx[active].filter(it=>it.id!==id); return nx; }); }
  function addCat(){ const name=catDraft.trim(); if(!name) return; if(!cats.includes(name)) setCats([...cats,name]); setCatDraft(""); }
  function delCat(name){ setCats(cats.filter(c=>c!==name)); const cp={...items}; delete cp[name]; setItems(cp); }
  return (
    <Card>
      <H2>Notes</H2>
      <div className="flex gap-2 overflow-x-auto pb-2 mt-2">
        {cats.map(c => (<div key={c} className="flex items-center gap-2"><Button onClick={()=>setActive(c)} className={cls(active===c && "bg-gradient-to-r from-neon-blue/30 to-neon-violet/30")}>{c}</Button>{!["À faire","À acheter","Idées"].includes(c)&&(<Button className="text-red-300 border-red-400" onClick={()=>delCat(c)}>x</Button>)}</div>))}
        <div className="flex items-center gap-2 ml-auto"><Input placeholder="Nouvelle catégorie" value={catDraft} onChange={e=>setCatDraft(e.target.value)} style={{maxWidth:180}} /><Button onClick={addCat}>Ajouter</Button></div>
      </div>
      <div className="flex gap-2 mt-2"><Input placeholder={`Ajouter à "${active}"...`} value={text} onChange={e=>setText(e.target.value)} /><Button onClick={add}>Ajouter</Button></div>
      <div className="grid gap-2 mt-3 max-h-72 overflow-auto pr-2">
        {(items[active]||[]).map(it => (<label key={it.id} className="flex items-center justify-between glass rounded-2xl px-3 py-2"><span className="flex items-center gap-3"><input type="checkbox" checked={it.done} onChange={()=>toggle(it.id)} /><span className={cls(it.done && "line-through text-zinc-400")}>{it.text}</span></span><Button className="text-red-300 border-red-400" onClick={()=>remove(it.id)}>Suppr</Button></label>))}
        {(items[active]||[]).length===0 && <div className="text-sm text-zinc-400">Aucun élément.</div>}
      </div>
    </Card>
  );
}

/* ---------- Dashboard ---------- */
function Dashboard(){
  const day=todayKey();
  const hydr=JSON.parse(localStorage.getItem("hydr.logs")||"{}"); const goal=JSON.parse(localStorage.getItem("hydr.goal")||"2500"); const ml=hydr[day]?.ml||0; const hydDone=ml>=goal;
  const sleep=JSON.parse(localStorage.getItem("sleep.log")||"{}"); const goalH=JSON.parse(localStorage.getItem("sleep.goal")||"8"); const sl=sleep[day]?.h||0; const slDone=sl>=goalH;
  const notes=JSON.parse(localStorage.getItem("notes.items")||"{}"); const notesDone=Object.values(notes).some(list=>(list||[]).some(it=>it.done));
  const nut=JSON.parse(localStorage.getItem("nut.logs")||"{}")[day]||{meals:{breakfast:[],lunch:[],dinner:[],snacks:[]}};
  const recipes=JSON.parse(localStorage.getItem("nut.recipes")||"[]"); const foods=JSON.parse(localStorage.getItem("nut.foods")||"[]");
  function macroItem(it){ const r=recipes.find(x=>x.id===it.recipeId); if(!r) return {k:0,p:0,c:0,f:0}; const base=r.items.reduce((acc,ing)=>{ const f=foods.find(x=>x.id===ing.foodId); const ratio=(ing.grams||0)/100; acc.k+=Math.round((f?.per100.kcal||0)*ratio); acc.p+=Math.round((f?.per100.p||0)*ratio); acc.c+=Math.round((f?.per100.c||0)*ratio); acc.f+=Math.round((f?.per100.f||0)*ratio); return acc; },{k:0,p:0,c:0,f:0}); return {k:base.k,p:base.p,c:base.c,f:base.f}; }
  const totals=Object.values(nut.meals).flat().reduce((a,it)=>{ const m=macroItem(it); a.k+=m.k; a.p+=m.p; a.c+=m.c; a.f+=m.f; return a; },{k:0,p:0,c:0,f:0});
  const score = (hydDone?25:0) + (slDone?25:0) + (notesDone?20:0) + (totals.k>0?20:0) + 10;
  const pct=Math.min(100,score);

  return (
    <div className="grid gap-6">
      <Card className="overflow-hidden relative">
        <H2>Tableau de bord</H2>
        <div className="mt-4 grid md:grid-cols-[240px_1fr] gap-6 items-center">
          <div className="relative w-[240px] h-[240px] mx-auto rounded-full bg-gradient-to-br from-neon-blue/40 to-neon-violet/40 border border-white/20 shadow-holo grid place-items-center">
            <div className="absolute inset-0 rounded-full" style={{background:`conic-gradient(#38bdf8 ${pct*3.6}deg, rgba(255,255,255,.08) 0deg)`}}></div>
            <div className="absolute inset-4 rounded-full glass grid place-items-center"><div className="text-4xl font-bold">{pct}</div><div className="text-xs text-zinc-300">score</div></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="glass rounded-2xl p-3"><div className="text-sm">Hydratation</div><div className="text-2xl font-semibold">{ml}<span className="text-sm ml-1">/ {goal} mL</span></div></div>
            <div className="glass rounded-2xl p-3"><div className="text-sm">Sommeil</div><div className="text-2xl font-semibold">{sl}<span className="text-sm ml-1">/ {goalH} h</span></div></div>
            <div className="glass rounded-2xl p-3"><div className="text-sm">Nutrition (kcal)</div><div className="text-2xl font-semibold">{totals.k}</div></div>
            <div className="glass rounded-2xl p-3"><div className="text-sm">Notes</div><div className="text-2xl font-semibold">{notesDone?"OK":"—"}</div></div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="text-sm opacity-80">Streaks</div>
        <div className="mt-2 h-20 relative rounded-2xl glass">
          <div className="absolute inset-0 px-3 flex items-center gap-3">
            {[...Array(8)].map((_,i)=>(<div key={i} className={cls("w-3 h-3 rounded-full", i<Math.floor(pct/12.5)?"bg-neon-blue shadow-holo":"bg-white/15")} />))}
          </div>
        </div>
      </Card>
    </div>
  );
}
