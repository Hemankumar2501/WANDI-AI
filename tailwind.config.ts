import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },

        /* ── Stitch / Material 3 Design Tokens ──────────────── */
        "surface": "#faf8ff",
        "surface-bright": "#faf8ff",
        "surface-dim": "#d2d9f4",
        "surface-container": "#eaedff",
        "surface-container-low": "#f2f3ff",
        "surface-container-high": "#e2e7ff",
        "surface-container-highest": "#dae2fd",
        "surface-container-lowest": "#ffffff",
        "surface-variant": "#dae2fd",
        "surface-tint": "#1353d8",
        "on-surface": "#131b2e",
        "on-surface-variant": "#434654",
        "on-background": "#131b2e",
        "on-primary": "#ffffff",
        "on-primary-container": "#d4dcff",
        "on-primary-fixed": "#00174d",
        "on-primary-fixed-variant": "#003dab",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#006f66",
        "on-secondary-fixed": "#00201d",
        "on-secondary-fixed-variant": "#005049",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#ffd4c5",
        "on-tertiary-fixed": "#370e00",
        "on-tertiary-fixed-variant": "#7f2b00",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
        "primary-m3": "#003fb1",
        "primary-container": "#1a56db",
        "primary-fixed": "#dbe1ff",
        "primary-fixed-dim": "#b5c4ff",
        "secondary-m3": "#006a61",
        "secondary-container": "#86f2e4",
        "secondary-fixed": "#89f5e7",
        "secondary-fixed-dim": "#6bd8cb",
        "tertiary": "#842c00",
        "tertiary-container": "#ac3c00",
        "tertiary-fixed": "#ffdbce",
        "tertiary-fixed-dim": "#ffb599",
        "error-m3": "#ba1a1a",
        "error-container": "#ffdad6",
        "outline": "#737686",
        "outline-variant": "#c3c5d7",
        "inverse-surface": "#283044",
        "inverse-on-surface": "#eef0ff",
        "inverse-primary": "#b5c4ff",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        DEFAULT: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
        "4xl": "2.5rem",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        headline: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        label: ["Inter", "system-ui", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "typing-dot": {
          "0%, 60%, 100%": { transform: "translateY(0)" },
          "30%": { transform: "translateY(-4px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "slide-in-right": "slide-in-right 0.4s ease-out",
        "slide-in-left": "slide-in-left 0.4s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        float: "float 3s ease-in-out infinite",
        pulse: "pulse 2s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "typing-dot": "typing-dot 1.4s ease-in-out infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-gradient":
          "linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--card)) 100%)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
