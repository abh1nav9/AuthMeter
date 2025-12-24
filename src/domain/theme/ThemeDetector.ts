import type { AppTheme } from "./ThemeTypes";

export interface ThemeDetectorProtocol {
  getSystemTheme(): AppTheme;
}

export class ThemeDetector implements ThemeDetectorProtocol {
  getSystemTheme(): AppTheme {
    if (typeof window === "undefined") return "dark";
    return window.matchMedia?.("(prefers-color-scheme: light)")?.matches
      ? "light"
      : "dark";
  }
}
