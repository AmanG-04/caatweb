import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#102a2a",
        teal: "#0f766e",
        lime: "#d8f36a",
        cream: "#f7f8f2",
        night: "#102a2a",
        dusk: "#0f766e",
        violet: "#0f766e",
        gold: "#d8f36a",
        "gold-soft": "#edffad",
        paper: "#f7f8f2",
        "paper-dim": "#edf1e7",
        "ink-soft": "#52706d",
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: { soft: "0 18px 60px rgba(16,42,42,.10)" },
    },
  },
  plugins: [],
} satisfies Config;
