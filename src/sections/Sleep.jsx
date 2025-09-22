import React, { useMemo, useState } from "react";
import { Card, H2, Input, Label } from "../components/UI";

const todayKey = () => new Date().toISOString().slice(0,10);

export default function Sleep() {
  const k = todayKey();

  // Réveil voulu demain
  const saved = JSON.parse(localStorage.getItem("sleep.prefs") || '{"wake":"07:00","base":8}');
  const [wake, setWake] = useState(saved.wake);
  const [base, setBase] = useState(saved.base);

  function save(w, b){
    localStorage.setItem("sleep.prefs", JSON.stringify({wake:w, base:b}));
  }

  // Facteurs de la journée
  const hydrGoal = Number(localStorage.getItem("hydr.goal") || 2500);
  const hydrLogs = JSON.parse(localStorage.getItem("hydr.logs") || "{}");
  const ml = hydrLogs[k]?.ml || 0;
  const hydrRatio = ml / Math.max(1, hydrGoal); // 0..1+

  const challenge = (JSON.parse(localStorage.getItem("muscle.challenge")||"{}")[k]) || { done:false };

  const nutGoal = JSON.parse(localStorage.getItem("nut.goal") || '{"kcal":2300}');
  const nutLogs = JSON.parse(localStorage.getItem("nut.logs") || "{}");
  const day = nutLogs[k]; // on simplifie → pas de total précis ici

  // Ajustement temps de sommeil (règle simple & claire)
  const needHours = useMemo(()=>{
    let need = Number(base)||8;
    if (challenge.done) need += 0.3;               // effort → +18 min
    if (hydrRatio < 0.6) need += 0.2;              // peu bu → +12 min
    if (hydrRatio > 1.1) need -= 0.1;              // très bien hydraté → -6 min
    // nutrition avancée possible plus tard
    need = Math.max(6.5, Math.min(9.5, need));
    return Number(need.toFixed(2));
  }, [base, challenge.done, hydrRatio]);

  // Heure de coucher conseillée = réveil - needHours
  function toMinutes(hhmm){ const [h,m]=hhmm.split(":").map(Number); return h*60+m; }
  function fromMinutes(min){ const h=((Math.floor(min/60)%24)+24)%24; const m=((min%60)+60)%60; return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`; }
  const bedtime = useMemo(()=>{
    const W = toMinutes(wake);
    const need = Math.round(needHours*60);
    return fromMinutes(W - need);
  }, [wake, needHours]);

  return (
    <Card className="p-4">
      <H2>Sommeil</H2>
      <div className="mt-3 grid sm:grid-cols-3 gap-3">
        <div>
          <Label>Heure de réveil souhaitée (demain)</Label>
          <Input type="time" value={wake} onChange={e=>{setWake(e.target.value); save(e.target.value, base);}} />
        </div>
        <div>
          <Label>Besoins de sommeil de base (heures)</Label>
          <Input type="number" step="0.25" min="5" max="10" value={base}
                 onChange={e=>{const v=Number(e.target.value)||8; setBase(v); save(wake,v);}} />
        </div>
        <div className="rounded-2xl border p-3" style={{borderColor:"var(--border)"}}>
          <div className="text-sm opacity-80">Heure de coucher conseillée</div>
          <div className="text-2xl font-semibold">{bedtime}</div>
          <div className="text-xs opacity-70">Calculée selon ton hydratation et ton défi du jour.</div>
        </div>
      </div>
    </Card>
  );
}
