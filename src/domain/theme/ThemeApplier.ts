import type { AppTheme } from "./ThemeTypes";

export interface ThemeApplierProtocol {
  apply(theme: AppTheme): void;
}

export class ThemeApplier implements ThemeApplierProtocol {
  apply(theme: AppTheme): void {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.theme = theme;
  }
}
