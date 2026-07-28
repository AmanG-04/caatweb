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
        night: "#0e1128",
        dusk: "#191d45",
        violet: "#8b4fc0",
        gold: "#f5b72e",
        "gold-soft": "#ffd87a",
        paper: "#f7f5f1",
        "paper-dim": "#efece4",
        "ink-soft": "#4a4f6e",
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
