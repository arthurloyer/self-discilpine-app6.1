/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "neon-blue": "#38bdf8",
        "neon-violet": "#a855f7"
      }
    }
  },
  plugins: []
};
