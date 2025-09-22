import React, { useMemo, useState } from "react";
import { Card, H2, Button, Input, Label } from "../components/UI";

const todayKey = () => new Date().toISOString().slice(0,10);

// Aliments de base (exemple, extensible)
const BASE_FOODS = [
  { id:"riz", name:"Riz cuit",        per100:{kcal:130, p:2.7, c:28,  f:0.3} },
  { id:"poulet", name:"Poulet (blanc)", per100:{kcal:165, p:31,  c:0,   f:3.6} },
  { id:"oeuf", name:"Oeuf entier",    per100:{kcal:155, p:13,  c:1.1, f:11} },
  { id:"banane", name:"Banane",       per100:{kcal:89,  p:1.1, c:23,  f:0.3} },
  { id:"pomme", name:"Pomme",         per100:{kcal:52,  p:0.3, c:14,  f:0.2} },
  { id:"avocat", name:"Avocat",       per100:{kcal:160, p:2,   c:9,   f:15} },
  { id:"pates", name:"Pâtes cuites",  per100:{kcal:157, p:5.8, c:30,  f:0.9} },
  { id:"thon", name:"Thon",           per100:{kcal:132, p:29,  c:0,   f:1}  },
  { id:"amandes", name:"Amandes",     per100:{kcal:579, p:21,  c:22,  f:50} },
  { id:"yaourt", name:"Yaourt nature",per100:{kcal:61,  p:3.5, c:4.7, f:3.3} },
];

function useFoods(){
  const [foods, setFoods] = useState(()=>{
    try { return JSON.parse(localStorage.getItem("nut.foods")) || BASE_FOODS; }
    catch { return BASE_FOODS; }
  });
  function up(next){
    setFoods(next);
    localStorage.setItem("nut.foods", JSON.stringify(next));
  }
  return { foods, setFoods: up };
}

export default function Nutrition(){
  const { foods, setFoods } = useFoods();
  const [fold, setFold] = useState({ objectif:false, biblio:false, journal:false });

  // Objectif simple
  const saved = JSON.parse(localStorage.getItem("nut.goal") || '{"mode":"maintien","kcal":2300,"p":120,"c":260,"f":70}');
  const [goal, setGoal] = useState(saved);

  function saveGoal(g){
    setGoal(g);
    localStorage.setItem("nut.goal", JSON.stringify(g));
  }

  // Biblio aliments (recherche)
  const [q, setQ] = useState("");
  const filtered = foods.filter(f => f.name.toLowerCase().includes(q.toLowerCase()));

  // Journal du jour (recettes simples = aliment + grammes)
  const k = todayKey();
  const allLogs = JSON.parse(localStorage.getItem("nut.logs") || "{}");
  const log = allLogs[k] || { meals:{ breakfast:[], lunch:[], dinner:[], snacks:[] } };

  function addTo(meal, food, grams){
    const m = { foodId: food.id, grams: Number(grams)||0 };
    const nx = { ...log, meals: { ...log.meals, [meal]: [...log.meals[meal], m] } };
    const all = { ...allLogs, [k]: nx };
    localStorage.setItem("nut.logs", JSON.stringify(all));
    window.dispatchEvent(new Event("storage"));
  }

  function totalsOf(mealKey){
    const list = log.meals[mealKey] || [];
    return list.reduce((a,m)=>{
      const f = foods.find(x=>x.id===m.foodId); if(!f) return a;
      const r = (m.grams||0)/100;
      a.k += f.per100.kcal*r; a.p += f.per100.p*r; a.c += f.per100.c*r; a.f += f.per100.f*r;
      return a;
    }, {k:0,p:0,c:0,f:0});
  }
  const dayTotals = ["breakfast","lunch","dinner","snacks"].reduce((a,k2)=>{
    const t = totalsOf(k2); a.k+=t.k; a.p+=t.p; a.c+=t.c; a.f+=t.f; return a;
  }, {k:0,p:0,c:0,f:0});

  return (
    <Card className="p-4">
      <H2>Nutrition</H2>

      {/* Objectif — vocabulaire simple + repliable */}
      <Fold title="Objectif personnalisé" open={!fold.objectif} onToggle={()=>setFold(s=>({...s, objectif:!s.objectif}))}>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label>But</Label>
            <div className="flex gap-2 mt-1">
              {["perte de poids","maintien","prise de masse"].map(m=>(
                <Button key={m} onClick={()=>saveGoal({...goal, mode:m})}
                        className={goal.mode===m ? "border-white" : ""}>{m}</Button>
              ))}
            </div>
          </div>
          <div>
            <Label>Calories/jour</Label>
            <Input type="number" value={goal.kcal} onChange={e=>saveGoal({...goal, kcal:Number(e.target.value)||0})}/>
          </div>
          <div><Label>Protéines (g)</Label><Input type="number" value={goal.p} onChange={e=>saveGoal({...goal, p:Number(e.target.value)||0})}/></div>
          <div><Label>Glucides (g)</Label><Input type="number" value={goal.c} onChange={e=>saveGoal({...goal, c:Number(e.target.value)||0})}/></div>
          <div><Label>Lipides (g)</Label><Input type="number" value={goal.f} onChange={e=>saveGoal({...goal, f:Number(e.target.value)||0})}/></div>
        </div>
      </Fold>

      {/* Bibliothèque d'aliments — repliable */}
      <Fold title="Bibliothèque d’aliments" open={!fold.biblio} onToggle={()=>setFold(s=>({...s, biblio:!s.biblio}))}>
        <div className="flex items-center justify-between gap-3">
          <div className="w-56"><Input placeholder="Rechercher un aliment..." value={q} onChange={e=>setQ(e.target.value)} /></div>
          <Button onClick={()=>setFoods([...foods, { id:crypto.randomUUID(), name:"Nouvel aliment", per100:{kcal:0,p:0,c:0,f:0} }])}>+ Aliment</Button>
        </div>
        <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {filtered.map(f=>(
            <Card key={f.id} className="p-3">
              <div className="font-medium">{f.name}</div>
              <div className="text-xs opacity-70">{f.per100.kcal} kcal /100g — P {f.per100.p} • C {f.per100.c} • F {f.per100.f}</div>
              <MealAdder food={f} onAdd={addTo}/>
            </Card>
          ))}
        </div>
      </Fold>

      {/* Journal — repliable */}
      <Fold title="Journal du jour" open={!fold.journal} onToggle={()=>setFold(s=>({...s, journal:!s.journal}))}>
        <div className="grid md:grid-cols-4 gap-3">
          {["breakfast","lunch","dinner","snacks"].map(key=>(
            <Card key={key} className="p-3">
              <div className="font-medium capitalize">{key==="breakfast"?"Petit-déj":key==="lunch"?"Déjeuner":key==="dinner"?"Dîner":"Snacks"}</div>
              <ul className="mt-2 text-sm">
                {(log.meals[key]||[]).map((m,i)=>{
                  const f = foods.find(x=>x.id===m.foodId);
                  return <li key={i} className="flex items-center justify-between gap-2">
                    <span>{f?.name} — {m.grams} g</span>
                    <span className="opacity-70">{Math.round((f?.per100.kcal||0)*(m.grams/100))} kcal</span>
                  </li>
                })}
              </ul>
              <div className="mt-2 text-xs opacity-70">
                Totaux: {Math.round(totalsOf(key).k)} kcal • P {Math.round(totalsOf(key).p)} • C {Math.round(totalsOf(key).c)} • F {Math.round(totalsOf(key).f)}
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-3 p-3">
          <div className="font-medium">Totaux journaliers</div>
          <div className="text-sm opacity-80">
            {Math.round(dayTotals.k)} / {goal.kcal} kcal — P {Math.round(dayTotals.p)}/{goal.p} • C {Math.round(dayTotals.c)}/{goal.c} • F {Math.round(dayTotals.f)}/{goal.f}
          </div>
        </Card>
      </Fold>
    </Card>
  );
}

function Fold({ title, open, onToggle, children }){
  return (
    <Card className="mt-4">
      <div className="flex items-center justify-between p-3">
        <div className="font-medium">{title}</div>
        <Button onClick={onToggle}>{open? "−" : "+"}</Button>
      </div>
      {open && <div className="p-3 pt-0">{children}</div>}
    </Card>
  );
}

function MealAdder({ food, onAdd }){
  const [g,setG] = useState(100);
  const [m,setM] = useState("lunch");
  return (
    <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
      <Input type="number" min={0} step={5} value={g} onChange={e=>setG(Number(e.target.value)||0)} />
      <select value={m} onChange={e=>setM(e.target.value)} className="px-2 py-2 rounded-2xl border" style={{borderColor:"var(--border)", background:"transparent"}}>
        <option value="breakfast">PdJ</option><option value="lunch">Déj</option><option value="dinner">Dîner</option><option value="snacks">Snacks</option>
      </select>
      <Button className="col-span-2" onClick={()=>onAdd(m, food, g)}>Ajouter au journal</Button>
    </div>
  );
}
