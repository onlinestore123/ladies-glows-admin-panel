import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#faf8ff",
          100: "#f3edff",
          gold: "#e9c46a",
          goldLight: "#f4dfa0",
          purple: {
            DEFAULT: "#9333ea",
            dark: "#6b21a8",
          },
          pink: "#ec4899",
        },
      },
      fontFamily: {
        display: ["var(--font-playfair)", "serif"],
        body: ["var(--font-tajawal)", "sans-serif"],
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #9333ea 0%, #ec4899 100%)",
        "brand-gradient-soft": "linear-gradient(135deg, rgba(147,51,234,0.08) 0%, rgba(236,72,153,0.08) 100%)",
      },
      boxShadow: {
        gold: "0 0 20px rgba(233, 196, 106, 0.55)",
        brand: "0 10px 30px -10px rgba(147, 51, 234, 0.45)",
      },
      keyframes: {
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 0px rgba(233,196,106,0.0)" },
          "50%": { boxShadow: "0 0 22px rgba(233,196,106,0.6)" },
        },
      },
      animation: {
        glowPulse: "glowPulse 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
