import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        bgPrimary: "var(--bg-primary)",
        bgSecondary: "var(--bg-secondary)",
        textPrimary: "var(--text-primary)",
        textSecondary: "var(--text-secondary)",
        accentCyan: "var(--accent-cyan)",
        accentViolet: "var(--accent-violet)"
      },
      boxShadow: {
        glass: "var(--glass-shadow)",
        glow: "0 0 30px rgba(0, 245, 255, 0.25)"
      },
      fontFamily: {
        heading: "var(--font-orbitron)",
        body: "var(--font-dm-sans)"
      },
      keyframes: {
        marqueeLeft: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        },
        marqueeRight: {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" }
        }
      },
      animation: {
        marqueeLeft: "marqueeLeft 28s linear infinite",
        marqueeRight: "marqueeRight 28s linear infinite"
      }
    }
  },
  plugins: []
};

export default config;
