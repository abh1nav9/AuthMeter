import type { PasswordAnalysisResult } from "../../domain/password/PasswordAnalysisTypes";
import { PasswordSuggestionManager } from "../../domain/password/PasswordSuggestionManager";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { useEffect, useMemo, useState } from "react";

export interface AdviceCardProps {
  analysis: PasswordAnalysisResult;
  password: string;
  className?: string;
}

export function AdviceCard({ analysis, password, className }: AdviceCardProps) {
  const warnings = analysis.warnings;
  const suggestions = analysis.suggestions;
  const suggestionManager = useMemo(() => new PasswordSuggestionManager(), []);
  const [passwordIdeas, setPasswordIdeas] = useState(() =>
    suggestionManager.suggest(password, 3)
  );

  useEffect(() => {
    setPasswordIdeas(suggestionManager.suggest(password, 3));
  }, [password, suggestionManager]);

  return (
    <Card className={className}>
      <div className="flex h-full flex-col">
        <div className="space-y-1">
          <div className="text-sm font-medium text-[color:var(--app-text)]">
            What to fix
          </div>
          <div className="text-xs text-[color:var(--app-text-subtle)]">
            Quick checks that attackers commonly exploit.
          </div>
        </div>

        <div className="mt-4 min-h-0 overflow-auto">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-xs font-medium text-[color:var(--app-text-muted)]">
                Warnings
              </div>
              <ul className="mt-2 space-y-1 text-sm text-[color:var(--app-text)]">
                {warnings.length === 0 ? (
                  <li className="text-[color:var(--app-text-subtle)]">
                    None detected.
                  </li>
                ) : (
                  warnings.map((w) => <li key={w}>- {w}</li>)
                )}
              </ul>
            </div>
            <div>
              <div className="text-xs font-medium text-[color:var(--app-text-muted)]">
                Suggestions
              </div>
              <ul className="mt-2 space-y-1 text-sm text-[color:var(--app-text)]">
                {suggestions.length === 0 ? (
                  <li className="text-[color:var(--app-text-subtle)]">
                    Type a password to see suggestions.
                  </li>
                ) : (
                  uniqueStrings(suggestions).map((s) => <li key={s}>- {s}</li>)
                )}
              </ul>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-2)] p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-medium text-[color:var(--app-text-muted)]">
                  Suggested stronger passwords
                </div>
                <div className="text-[11px] text-[color:var(--app-text-subtle)]">
                  Generated locally based on what you typed. Use as inspiration
                  (don’t reuse suggestions exactly).
                </div>
              </div>
              <Button
                variant="ghost"
                className="h-8 px-3"
                onClick={() =>
                  setPasswordIdeas(suggestionManager.suggest(password, 3))
                }
              >
                Regenerate
              </Button>
            </div>
            <ul className="mt-2 space-y-1 font-mono text-xs text-[color:var(--app-text)]">
              {passwordIdeas.length === 0 ? (
                <li className="text-[color:var(--app-text-subtle)]">
                  Type a password to see ideas.
                </li>
              ) : (
                passwordIdeas.map((e) => <li key={e}>{e}</li>)
              )}
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values));
}
