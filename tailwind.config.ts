import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",

        main: "#111111",
        "main-light": "#181819",
        "main-dark": "#0D0D0D",
        "main-highlight": "#1D1e20",
        primary: "#CCCCCC",
        secondary: "#bababa",
        console: "#A28C55",
        accent: "#31D183",
        ptve: "#88D693",
        ntve: "#F04866",
      },
      fontFamily: {
        "geist-sans": ["var(--font-geist-sans)", "sans-serif"],
        "geist-mono": ["var(--font-geist-mono)", "monospace"],
        roboto: ["var(--font-roboto)", "sans-serif"],
      },
      keyframes: {
        radarPulse: {
          "0%": { transform: "scale(0)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "0" },
        },
        pulse: {
          "0%": { opacity: "1" },
          "50%": { opacity: "0.5" },
          "100%": { opacity: "1" },
        },
        wiggle: {
          "0%": { transform: "rotate(0deg)" },
          "60%": { transform: "rotate(0deg)" },
          "65%": { transform: "rotate(3deg)" },
          "75%": { transform: "rotate(-3deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
        scanning: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "dark-pulse": {
          "0%": { backgroundColor: "#111111" },
          "50%": { backgroundColor: "#0D0D0D" },
          "100%": { backgroundColor: "#111111" },
        },
        blink: {
          "0%": { opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "width-left-to-right": {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
      },
      animation: {
        radarPulse: "radarPulse 4s infinite",
        wiggle: "wiggle 1.5s ease-in-out infinite",
        scanning: "scanning 1s linear infinite",
        blink: "blink 1s infinite",
        pulse: "pulse 1s ease-in-out infinite",
        "dark-pulse": "dark-pulse 1s ease-in-out infinite",
        "width-left-to-right": "width-left-to-right 0.2s linear",
      },
    },
  },
  plugins: [],
} satisfies Config;
