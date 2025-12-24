import type { AppTheme } from "./ThemeTypes";

export interface ThemeStorageProtocol {
  readTheme(): AppTheme | null;
  writeTheme(theme: AppTheme): void;
}

export class ThemeStorage implements ThemeStorageProtocol {
  private readonly key = "app_theme";

  readTheme(): AppTheme | null {
    try {
      const value = localStorage.getItem(this.key);
      if (value === "dark" || value === "light") return value;
      return null;
    } catch {
      return null;
    }
  }

  writeTheme(theme: AppTheme): void {
    try {
      localStorage.setItem(this.key, theme);
    } catch {
      // ignore
    }
  }
}
