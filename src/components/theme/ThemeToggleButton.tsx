import type { AppTheme } from "../../domain/theme/ThemeTypes";
import { Moon, Sun } from "lucide-react";
import { Button } from "../ui/Button";

export interface ThemeToggleButtonProps {
  theme: AppTheme;
  onToggle: () => void;
}

export function ThemeToggleButton({ theme, onToggle }: ThemeToggleButtonProps) {
  const label =
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
  return (
    <Button
      variant="ghost"
      onClick={onToggle}
      className="border border-[var(--app-border)] p-0"
      aria-label={label}
      title={label}
    >
      {theme === "dark" ? <Sun size={12} /> : <Moon size={12} />}
    </Button>
  );
}
