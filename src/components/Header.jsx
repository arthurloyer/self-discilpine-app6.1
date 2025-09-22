import React from "react";
import { Button } from "./UI";
import logoUrl from "../assets/LOGOASCEND.png"; // <-- ton logo (exactement ce nom)

export default function Header({ onMenu }) {
  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{
        background: "rgba(0,0,0,.35)",
        borderColor: "var(--border)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logoUrl} alt="Ascend" className="w-7 h-7 object-contain" />
          <div className="font-semibold tracking-wide">Ascend</div>
        </div>

        {/* Icône menu (3 barres) */}
        <Button aria-label="Menu" onClick={onMenu} className="flex flex-col gap-1.5">
          <span className="block w-6 h-[2px]" style={{ background: "var(--text)" }} />
          <span className="block w-6 h-[2px]" style={{ background: "var(--text)" }} />
          <span className="block w-6 h-[2px]" style={{ background: "var(--text)" }} />
        </Button>
      </div>
    </header>
  );
}
