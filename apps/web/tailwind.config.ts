import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--ink-rgb) / <alpha-value>)",
        navy: {
          DEFAULT: "#17345c",
          strong: "#102540",
          soft: "rgb(var(--navy-soft-rgb) / <alpha-value>)",
          light: "#a9c7ee",
          bright: "#4a73a8",
          deep: "#0c182b",
        },
        paper: "rgb(var(--paper-rgb) / <alpha-value>)",
        surface: "rgb(var(--surface-rgb) / <alpha-value>)",
        cyan: {
          glow: "#00f0ff",
        },
        violet: {
          glow: "#8b5cf6",
        },
      },
      boxShadow: {
        soft: "0 18px 60px rgba(15,23,42,.10)",
        navy: "0 18px 36px rgba(23,52,92,.18)",
        "cyan-glow": "0 0 35px rgba(0, 240, 255, 0.35)",
        "violet-glow": "0 0 35px rgba(139, 92, 246, 0.35)",
      },
    },
  },
  plugins: [],
} satisfies Config;
