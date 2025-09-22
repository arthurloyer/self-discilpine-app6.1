import React, { useMemo, useState } from "react";
import { Card, H2, Button, Input, Label } from "../components/UI";

const todayKey = () => new Date().toISOString().slice(0,10);

// Petit catalogue d'exos PDC (peut grandir facilement)
const EXOS = [
  { id:"pushups", name:"Pompes", tips:[
    "Gaine le tronc, mains sous les épaules, descends poitrine proche du sol.",
    "Coude ~45°, respiration contrôlée.",
    "Sources: NSCA, ExRx."
  ]},
  { id:"squats", name:"Squats au poids du corps", tips:[
    "Pieds largeur épaules, dos neutre, genoux suivent les orteils.",
    "Descends cuisses // au sol ou plus si mobilité.",
    "Sources: NSCA, ExRx."
  ]},
  { id:"plank", name:"Planche", tips:[
    "Coude sous épaules, bassin neutre, respiration nasale.",
    "Regard sol, nuque longue.",
    "Sources: NSCA, ExRx."
  ]},
  { id:"lunges", name:"Fentes alternées", tips:[
    "Grand pas, genou avant au-dessus du milieu du pied.",
    "Pousse talon avant au retour.",
    "Sources: NSCA, ExRx."
  ]},
  { id:"burpees", name:"Burpees", tips:[
    "Garde la technique propre avant la vitesse.",
    "Impact élevé — échauffe-toi.",
    "Sources: NSCA, ExRx."
  ]},
];

// Génére un défi PDC quotidien (stable pour la journée)
function useDailyChallenge() {
  const k = todayKey();
  const saved = JSON.parse(localStorage.getItem("muscle.challenge") || "{}")[k];
  const challenge = useMemo(() => {
    if (saved) return saved;
    const i = Math.abs(k.split("-").join("").split("").reduce((a,c)=>a+(c.charCodeAt(0)%7),0)) % EXOS.length;
    const base = { id: EXOS[i].id, name: EXOS[i].name, target: 1, unit:"bloc", done:false };
    const all = JSON.parse(localStorage.getItem("muscle.challenge") || "{}");
    all[k] = base;
    localStorage.setItem("muscle.challenge", JSON.stringify(all));
    return base;
  // eslint-disable-next-line
  }, [k]);

  function setDone(v){
    const all = JSON.parse(localStorage.getItem("muscle.challenge") || "{}");
    all[k] = { ...challenge, done: v };
    localStorage.setItem("muscle.challenge", JSON.stringify(all));
    // Impact hydratation (petit bonus +200 mL si validé)
    const goal = Number(localStorage.getItem("hydr.goal") || 2500);
    localStorage.setItem("hydr.goal", String(v ? goal + 200 : Math.max(500, goal - 200)));
    window.dispatchEvent(new Event("storage"));
  }

  return { challenge, setDone };
}

export default function Musculation() {
  const { challenge, setDone } = useDailyChallenge();

  // Recherche d’exos + fiche conseils
  const [q, setQ] = useState("");
  const list = EXOS.filter(x => x.name.toLowerCase().includes(q.toLowerCase()));

  const [open, setOpen] = useState(null); // id exo → ouvrir fiche

  return (
    <Card className="p-4">
      <H2>Musculation</H2>

      {/* Défi PDC du jour */}
      <Card className="mt-3 p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm opacity-80">Défi PDC du jour</div>
            <div className="text-lg font-semibold">{challenge.name}</div>
            <div className="text-xs opacity-70">Valide pour impacter tes autres sections (ex: +200 mL d’hydratation).</div>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={!!challenge.done} onChange={e=>setDone(e.target.checked)} />
            <span>J’ai fait le défi</span>
          </label>
        </div>
      </Card>

      {/* Bibliothèque d'exos */}
      <Card className="mt-4 p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="font-medium">Bibliothèque d’exercices (PDC)</div>
          <div className="w-48"><Input placeholder="Rechercher..." value={q} onChange={e=>setQ(e.target.value)} /></div>
        </div>
        <ul className="mt-3 grid sm:grid-cols-2 gap-2">
          {list.map(ex => (
            <li key={ex.id}>
              <Card className="p-3 cursor-pointer hover:opacity-90" onClick={()=>setOpen(ex.id)}>
                <div className="font-medium">{ex.name}</div>
                <div className="text-xs opacity-70">Conseils d’un pro (sources: NSCA, ExRx)</div>
              </Card>
              {open===ex.id && (
                <Card className="mt-2 p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Conseils — {ex.name}</div>
                    <Button onClick={()=>setOpen(null)}>Fermer</Button>
                  </div>
                  <ul className="mt-2 list-disc pl-5 text-sm">
                    {ex.tips.map((t,i)=><li key={i}>{t}</li>)}
                  </ul>
                </Card>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </Card>
  );
}
