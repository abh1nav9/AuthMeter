import { useEffect, useMemo, useState } from "react";
import { ThemeManager } from "../domain/theme/ThemeManager";
import type { AppTheme } from "../domain/theme/ThemeTypes";

export interface ThemeViewModel {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
}

export function useThemeViewModel(): ThemeViewModel {
  const themeManager = useMemo(() => new ThemeManager(), []);
  const [theme, setThemeState] = useState<AppTheme>(() =>
    themeManager.getInitialTheme()
  );

  useEffect(() => {
    themeManager.setTheme(theme);
  }, [theme, themeManager]);

  const setTheme = (nextTheme: AppTheme) => setThemeState(nextTheme);
  const toggleTheme = () => setThemeState((t) => themeManager.toggleTheme(t));

  return { theme, setTheme, toggleTheme };
}
