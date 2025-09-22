import React from "react";
export const cls = (...a) => a.filter(Boolean).join(" ");

export const Card = ({ className="", children, ...p }) => (
  <div {...p}
    className={cls("rounded-3xl border", className)}
    style={{ background:"var(--card)", borderColor:"var(--border)", backdropFilter:`blur(var(--blur))` }}>
    {children}
  </div>
);

export const H2 = ({ children }) => (
  <h2 className="text-xl md:text-2xl font-semibold tracking-tight">{children}</h2>
);

export const Label = ({ children }) => (
  <label className="text-xs uppercase tracking-wider opacity-70">{children}</label>
);

export const Input = ({ className="", ...p }) => (
  <input {...p}
    className={cls("w-full bg-transparent rounded-2xl px-3 py-2 border outline-none focus:ring-2", className)}
    style={{borderColor:"var(--border)"}} />
);

export const Button = ({ className="", ...p }) => (
  <button {...p}
    className={cls("px-4 py-2 rounded-2xl border transition active:scale-[.98] hover:opacity-90", className)}
    style={{borderColor:"var(--border)"}} />
);
