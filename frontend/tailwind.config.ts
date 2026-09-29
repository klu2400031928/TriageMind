import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        soc: {
          bg: "#06080e",
          surface: "#0c101a",
          card: "#111827",
          cardHover: "#162033",
          border: "#1c2638",
          borderLight: "#2a374f",
          cyan: "#06b6d4",
          cyanGlow: "#22d3ee",
          purple: "#a855f7",
          purpleGlow: "#c084fc",
          emerald: "#10b981",
          amber: "#f59e0b",
          red: "#ef4444",
          crimson: "#dc2626",
          accent: "#38bdf8",
        },
      },
      boxShadow: {
        "cyan-glow": "0 0 20px -5px rgba(6, 182, 212, 0.3)",
        "purple-glow": "0 0 20px -5px rgba(168, 85, 247, 0.3)",
        "emerald-glow": "0 0 20px -5px rgba(16, 185, 129, 0.3)",
        "red-glow": "0 0 20px -5px rgba(239, 68, 68, 0.3)",
        "amber-glow": "0 0 20px -5px rgba(245, 158, 11, 0.3)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "ping-slow": "ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { opacity: "0.6" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
