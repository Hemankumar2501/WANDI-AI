import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type ThemeMode = "solo" | "couple" | "team";
export type ColorMode = "light" | "dark";

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("wanderwise_theme_mode");
    return (saved as ThemeMode) || "solo";
  });

  const [colorMode, setColorMode] = useState<ColorMode>(() => {
    const saved = localStorage.getItem("wanderwise_color_mode");
    if (saved === "light" || saved === "dark") return saved as ColorMode;
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  });

  useEffect(() => {
    localStorage.setItem("wanderwise_theme_mode", mode);
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem("wanderwise_color_mode", colorMode);
    const root = document.documentElement;
    if (colorMode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [colorMode]);

  return (
    <ThemeContext.Provider value={{ mode, setMode, colorMode, setColorMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
