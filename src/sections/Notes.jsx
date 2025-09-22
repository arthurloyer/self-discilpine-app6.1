import React, { useState } from "react";
import { Card, H2, Button, Input, Label } from "../components/UI";

const CATS = ["À faire","À acheter","Idées","Divers"];

export default function Notes(){
  const [tab, setTab] = useState(CATS[0]);
  const saved = JSON.parse(localStorage.getItem("notes.items") || "{}");
  const [items, setItems] = useState(()=> CATS.reduce((acc,c)=>({...acc, [c]: saved[c]||[]}), {}));
  const [txt, setTxt] = useState("");

  function save(next){
    setItems(next);
    localStorage.setItem("notes.items", JSON.stringify(next));
  }
  function add(){
    if(!txt.trim()) return;
    const nx = { ...items, [tab]: [...items[tab], { id:crypto.randomUUID(), t:txt, done:false }] };
    save(nx); setTxt("");
  }
  function toggle(id){
    const nx = { ...items, [tab]: items[tab].map(n => n.id===id ? {...n, done:!n.done} : n) };
    save(nx);
  }
  function remove(id){
    const nx = { ...items, [tab]: items[tab].filter(n => n.id!==id) };
    save(nx);
  }

  return (
    <Card className="p-4">
      <H2>Notes</H2>

      <div className="mt-3 flex flex-wrap gap-2">
        {CATS.map(c=>(
          <Button key={c} onClick={()=>setTab(c)} className={tab===c?"border-white":""}>{c}</Button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
        <Input placeholder={`Ajouter à "${tab}"...`} value={txt} onChange={e=>setTxt(e.target.value)} />
        <Button onClick={add}>Ajouter</Button>
      </div>

      <ul className="mt-3 grid gap-2">
        {(items[tab]||[]).map(n=>(
          <li key={n.id} className="rounded-2xl border p-3 flex items-start gap-3"
              style={{borderColor:"var(--border)", wordBreak:"break-word", overflowWrap:"anywhere"}}>
            <input type="checkbox" className="mt-1" checked={n.done} onChange={()=>toggle(n.id)} />
            <div className="flex-1 whitespace-pre-wrap leading-snug">{n.t}</div>
            <Button onClick={()=>remove(n.id)} className="text-red-300 border-red-400">Supprimer</Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
