/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        neon: { blue: "#38bdf8", violet: "#a855f7" },
      },
      boxShadow: {
        holo: "0 0 18px rgba(99,102,241,.2), 0 0 42px rgba(56,189,248,.15)",
      },
    },
  },
  plugins: [],
};
