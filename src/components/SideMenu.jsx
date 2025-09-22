import React from "react";
import { useTheme } from "../theme";
import { Button, Card } from "./UI";

export default function SideMenu({ open, onClose }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={`fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      {/* Backdrop */}
      <div onClick={onClose}
           className={`absolute inset-0 transition ${open ? "opacity-60" : "opacity-0"}`}
           style={{background:"#000"}}/>
      {/* Panel */}
      <Card className={`absolute right-0 top-0 h-full w-[88%] max-w-sm p-4 transition-transform duration-300
                       ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-lg font-semibold">Menu</div>
          <Button onClick={onClose}>Fermer</Button>
        </div>

        <div className="grid gap-3">
          <Section title="Contact">
            <p className="text-sm opacity-80">contact@ascend.app (placeholder)</p>
          </Section>

          <Section title="Mes informations">
            <p className="text-sm opacity-80">Taille, poids, objectif… (déjà gérés dans Nutrition/Sommeil)</p>
          </Section>

          <Section title="Mon compte">
            <p className="text-sm opacity-80">Version locale — pas de compte requis pour l’instant.</p>
          </Section>

          <Section title="Thème">
            <div className="flex gap-2">
              <Button onClick={()=>setTheme({mode:"sobre"})}
                      className={theme.mode==="sobre" ? "border-white" : ""}>Sobre</Button>
              <Button onClick={()=>setTheme({mode:"neon"})}
                      className={theme.mode==="neon" ? "border-white" : ""}>Néon</Button>
            </div>
          </Section>
        </div>
      </Card>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border p-3" style={{borderColor:"var(--border)"}}>
      <div className="font-medium mb-2">{title}</div>
      {children}
    </div>
  );
}
