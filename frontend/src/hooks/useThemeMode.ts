import { useEffect, useState } from "react";
import type { ThemeMode } from "../view/types";

const getInitialTheme = (storageKey: string): ThemeMode => {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem(storageKey);
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  if (typeof window.matchMedia !== "function") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const useThemeMode = (storageKey: string) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() =>
    getInitialTheme(storageKey),
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeMode);
    window.localStorage.setItem(storageKey, themeMode);
  }, [storageKey, themeMode]);

  return {
    themeMode,
    setThemeMode,
  };
};
