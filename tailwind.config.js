/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        body: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        bg: {
          base: "#0a0a0b",
          panel: "#111113",
          card: "#18181b",
          hover: "#1f1f24",
          border: "#2a2a30",
          muted: "#3a3a42",
        },
        ink: {
          primary: "#f4f4f5",
          secondary: "#a1a1aa",
          muted: "#71717a",
          faint: "#3f3f46",
        },
        accent: {
          gold: "#f5c842",
          goldDim: "#a88620",
          teal: "#2dd4bf",
          tealDim: "#0f766e",
          red: "#f87171",
          redDim: "#991b1b",
          purple: "#a78bfa",
          purpleDim: "#5b21b6",
        },
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      animation: {
        "fade-up": "fadeUp 0.4s ease forwards",
        "fade-in": "fadeIn 0.3s ease forwards",
        "pulse-dot": "pulseDot 2s ease-in-out infinite",
        "count-up": "countUp 0.6s ease forwards",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: "translateY(12px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        pulseDot: {
          "0%, 100%": { opacity: 1, transform: "scale(1)" },
          "50%": { opacity: 0.4, transform: "scale(0.85)" },
        },
      },
    },
  },
  plugins: [],
};
