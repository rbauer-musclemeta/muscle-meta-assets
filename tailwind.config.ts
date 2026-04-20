import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        /* MMM brand palette */
        teal:   { DEFAULT: "#009090", dark: "#006b6b", light: "#00b3b3", muted: "#e6f5f5", tint: "#f0f9f9" },
        gold:   { DEFAULT: "#D4AF37", dark: "#B5952F", light: "#e3c56a", muted: "#faf6e8" },
        purple: { DEFAULT: "#7c3aed", dark: "#6d28d9", muted: "#f3f0fd" },
        green:  { DEFAULT: "#16a34a", dark: "#15803d", muted: "#f0fdf4" },
        ink:    { DEFAULT: "#1a2332", soft: "#344256", muted: "#6b7b8f", faint: "#a8b3c2" },
        surface:{ DEFAULT: "#f7f6f3", tint: "#fdfcfa" },
        border: { DEFAULT: "#e8e6e1", soft: "#f0eeea" },
        /* Risk tiers */
        tier1: "#009090",
        tier2: "#3b82f6",
        tier3: "#f59e0b",
        tier4: "#f97316",
        tier5: "#dc2626",
      },
      fontFamily: {
        display: ["Cormorant Garamond", "Cormorant", "Georgia", "serif"],
        body:    ["Outfit", "Helvetica Neue", "Arial", "sans-serif"],
      },
      fontSize: {
        eyebrow: ["11px", { lineHeight: "1.4", letterSpacing: "0.18em" }],
        caption: ["12px", { lineHeight: "1.5" }],
        micro:   ["13px", { lineHeight: "1.55" }],
        lede:    ["19px", { lineHeight: "1.6" }],
        "h4-mmm":["22px", { lineHeight: "1.25" }],
        "h3-mmm":["28px", { lineHeight: "1.2" }],
        "h2-mmm":["40px", { lineHeight: "1.12" }],
        "h1-mmm":["64px", { lineHeight: "1.05" }],
        "display-mmm": ["88px", { lineHeight: "1.02" }],
      },
      spacing: {
        "s1": "4px",
        "s2": "8px",
        "s3": "12px",
        "s4": "16px",
        "s5": "24px",
        "s6": "32px",
        "s7": "48px",
        "s8": "64px",
        "s9": "96px",
        "s10": "128px",
      },
      borderRadius: {
        "r1": "6px",
        "r2": "10px",
        "r3": "14px",
        "r4": "20px",
        "r5": "28px",
        "pill": "999px",
      },
      boxShadow: {
        xs:   "0 1px 2px rgba(26, 35, 50, 0.04)",
        sm:   "0 2px 8px rgba(26, 35, 50, 0.05)",
        md:   "0 6px 20px rgba(26, 35, 50, 0.07)",
        lg:   "0 12px 40px rgba(26, 35, 50, 0.08)",
        teal: "0 8px 30px rgba(0, 144, 144, 0.15)",
        gold: "0 4px 16px rgba(212, 175, 55, 0.25)",
      },
      transitionTimingFunction: {
        "ease-out-mmm":    "cubic-bezier(0.16, 1, 0.3, 1)",
        "ease-in-out-mmm": "cubic-bezier(0.65, 0, 0.35, 1)",
      },
      maxWidth: {
        content: "1200px",
        narrow:  "880px",
      },
    },
  },
  plugins: [],
};
export default config;
