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
        cyber: {
          dark: "#05070a",
          darker: "#030407",
          card: "#090d16",
          cardBorder: "#1a2333",
          cyan: "#00f5ff",
          blue: "#3b82f6",
          purple: "#8b5cf6",
          amber: "#f59e0b",
          red: "#ef4444",
          green: "#10b981",
        },
      },
      fontFamily: {
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scanline": "scanline 6s linear infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 10px rgba(0, 245, 255, 0.2)" },
          "100%": { boxShadow: "0 0 25px rgba(0, 245, 255, 0.6)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
