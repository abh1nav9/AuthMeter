import type { PasswordAnalysisResult } from "../../domain/password/PasswordAnalysisTypes";
import { PasswordSuggestionManager } from "../../domain/password/PasswordSuggestionManager";
import type { PasswordContext } from "../../domain/password/PasswordContext";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { useEffect, useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";

export interface AdviceCardProps {
  analysis: PasswordAnalysisResult;
  password: string;
  context?: PasswordContext;
  className?: string;
}

export function AdviceCard({
  analysis,
  password,
  context,
  className,
}: AdviceCardProps) {
  const warnings = analysis.warnings;
  const suggestions = analysis.suggestions;
  const suggestionManager = useMemo(() => new PasswordSuggestionManager(), []);
  const [passwordIdeas, setPasswordIdeas] = useState(() =>
    suggestionManager.suggest(password, 3, context)
  );
  const [copiedPassword, setCopiedPassword] = useState<string | null>(null);

  useEffect(() => {
    setPasswordIdeas(suggestionManager.suggest(password, 3, context));
  }, [context, password, suggestionManager]);

  const handleCopy = (text: string) => {
    void navigator.clipboard?.writeText(text);
    setCopiedPassword(text);
    setTimeout(() => setCopiedPassword(null), 2000);
  };

  return (
    <Card className={className}>
      <div className="flex h-full flex-col">
        <div className="space-y-1">
          <div className="text-sm font-medium text-[var(--app-text)]">
            What to fix
          </div>
          <div className="text-xs text-[var(--app-text-subtle)]">
            Quick checks that attackers commonly exploit.
          </div>
        </div>

        <div className="mt-4 min-h-0 overflow-auto">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-xs font-medium text-[var(--app-text-muted)]">
                Warnings
              </div>
              <ul className="mt-2 space-y-1 text-sm text-[var(--app-text)]">
                {warnings.length === 0 ? (
                  <li className="text-[var(--app-text-subtle)]">
                    None detected.
                  </li>
                ) : (
                  warnings.map((w) => <li key={w}>- {w}</li>)
                )}
              </ul>
            </div>
            <div>
              <div className="text-xs font-medium text-[var(--app-text-muted)]">
                Suggestions
              </div>
              <ul className="mt-2 space-y-1 text-sm text-[var(--app-text)]">
                {suggestions.length === 0 ? (
                  <li className="text-[var(--app-text-subtle)]">
                    Type a password to see suggestions.
                  </li>
                ) : (
                  uniqueStrings(suggestions).map((s) => <li key={s}>- {s}</li>)
                )}
              </ul>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-2)] p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-medium text-[var(--app-text-muted)]">
                  Suggested stronger passwords
                </div>
                <div className="text-[11px] text-[var(--app-text-subtle)]">
                  Generated locally based on what you typed. Use as inspiration
                  (don't reuse suggestions exactly).
                </div>
              </div>
              <Button
                variant="ghost"
                className="h-8 px-3"
                onClick={() =>
                  setPasswordIdeas(
                    suggestionManager.suggest(password, 3, context)
                  )
                }
              >
                Regenerate
              </Button>
            </div>
            <ul className="mt-2 space-y-1 font-mono text-xs text-[var(--app-text)]">
              {passwordIdeas.length === 0 ? (
                <li className="text-[var(--app-text-subtle)]">
                  Type a password to see ideas.
                </li>
              ) : (
                passwordIdeas.map((e) => (
                  <li
                    key={e}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="min-w-0 truncate">{e}</span>
                    {/* <Button
                      variant="ghost"
                      className="h-6 shrink-0 rounded-full border border-[var(--app-border)] px-3 text-[10px] transition-all hover:scale-105 hover:border-[var(--app-text)] hover:bg-[var(--app-surface)]"
                      onClick={() => handleCopy(e)}
                      aria-label="Copy suggested password"
                      title="Copy to clipboard"
                    >
                      {copiedPassword === e ? "Copied" : "Copy"}
                    </Button> */}
                    <Button
                      variant="ghost"
                      className="shrink-0 border border-[var(--app-border)] p-0"
                      onClick={() => handleCopy(e)}
                      aria-label={copiedPassword === e ? "Copied" : "Copy"}
                      title={copiedPassword === e ? "Copied" : "Copy"}
                    >
                      {copiedPassword === e ? (
                        <Check size={12} strokeWidth={2.5} />
                      ) : (
                        <Copy size={12} strokeWidth={2.5} />
                      )}
                    </Button>
                  </li>
                ))
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
