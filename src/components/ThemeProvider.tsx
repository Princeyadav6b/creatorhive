import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ThemeContext, type Theme } from "./theme-context";

function getSystemTheme(): "light" | "dark" {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme) {
  const resolved = theme === "system" ? getSystemTheme() : theme;
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("creatorhive-theme");
    if (stored === "light" || stored === "dark" || stored === "system") {
      setThemeState(stored);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    applyTheme(theme);
    window.localStorage.setItem("creatorhive-theme", theme);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") applyTheme("system");
    };
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [ready, theme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme: theme === "system" ? getSystemTheme() : theme,
      setTheme: (nextTheme: Theme) => setThemeState(nextTheme),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
