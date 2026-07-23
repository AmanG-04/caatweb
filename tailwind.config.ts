import type { Config } from "tailwindcss";
export default { darkMode: "class", content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"], theme: { extend: { colors: { ink: "#102a2a", teal: "#0f766e", lime: "#d8f36a", cream: "#f7f8f2" }, boxShadow: { soft: "0 18px 60px rgba(16,42,42,.10)" } } }, plugins: [] } satisfies Config;
