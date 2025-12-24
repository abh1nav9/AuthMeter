import { ThemeApplier } from "./ThemeApplier";
import { ThemeDetector } from "./ThemeDetector";
import { ThemeStorage } from "./ThemeStorage";
import type { AppTheme } from "./ThemeTypes";

export interface ThemeManagerProtocol {
  getInitialTheme(): AppTheme;
  setTheme(theme: AppTheme): void;
  toggleTheme(current: AppTheme): AppTheme;
}

export class ThemeManager implements ThemeManagerProtocol {
  private readonly storage: ThemeStorage;
  private readonly detector: ThemeDetector;
  private readonly applier: ThemeApplier;

  constructor(params?: {
    storage?: ThemeStorage;
    detector?: ThemeDetector;
    applier?: ThemeApplier;
  }) {
    this.storage = params?.storage ?? new ThemeStorage();
    this.detector = params?.detector ?? new ThemeDetector();
    this.applier = params?.applier ?? new ThemeApplier();
  }

  getInitialTheme(): AppTheme {
    const stored = this.storage.readTheme();
    return stored ?? this.detector.getSystemTheme();
  }

  setTheme(theme: AppTheme): void {
    this.storage.writeTheme(theme);
    this.applier.apply(theme);
  }

  toggleTheme(current: AppTheme): AppTheme {
    return current === "dark" ? "light" : "dark";
  }
}
