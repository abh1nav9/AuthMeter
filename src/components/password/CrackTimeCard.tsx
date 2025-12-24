import type { PasswordAnalysisResult } from "../../domain/password/PasswordAnalysisTypes";
import { PasswordCrackScenarioVisibilityManager } from "../../domain/password/PasswordCrackScenarioVisibilityManager";
import { HumanDurationFormatter } from "../../domain/time/HumanDurationFormatter";
import { Eye, EyeOff } from "lucide-react";
import { useMemo, useState } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";

export interface CrackTimeCardProps {
  analysis: PasswordAnalysisResult;
  className?: string;
}

export function CrackTimeCard({ analysis, className }: CrackTimeCardProps) {
  const formatter = new HumanDurationFormatter();
  const visibilityManager = useMemo(
    () => new PasswordCrackScenarioVisibilityManager(),
    []
  );
  const [isExpanded, setIsExpanded] = useState(false);

  const { primary, others } = visibilityManager.getVisibility(
    analysis.scenarios
  );

  return (
    <Card className={className}>
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="text-sm font-medium text-[color:var(--app-text)]">
              Estimated time to crack
            </div>
            <div className="text-xs text-[color:var(--app-text-subtle)]">
              Real attackers use smarter guesses (leaks, dictionaries, rules).
              Treat this as a rough range.
            </div>
          </div>
          <Button
            variant="ghost"
            className="h-8 whitespace-nowrap px-3"
            onClick={() => setIsExpanded((v) => !v)}
            disabled={!primary || others.length === 0}
          >
            {isExpanded ? (
              <span className="inline-flex items-center gap-2 whitespace-nowrap">
                Hide <EyeOff size={16} />
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 whitespace-nowrap">
                Show more <Eye size={16} />
              </span>
            )}
          </Button>
        </div>

        <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[color:var(--app-border)]">
          <div className="grid grid-cols-4 bg-[color:var(--app-surface-2)] px-3 py-2 text-xs text-[color:var(--app-text-muted)]">
            <div>Scenario</div>
            <div className="text-right">Speed</div>
            <div className="text-right">Avg</div>
            <div className="text-right">Worst</div>
          </div>

          {primary ? (
            <div className="min-h-0 flex-1 overflow-auto divide-y divide-[color:var(--app-border)]">
              <div className="grid grid-cols-4 px-3 py-2 text-sm">
                <div className="text-[color:var(--app-text)]">
                  {primary.name}
                </div>
                <div className="text-right text-[color:var(--app-text-muted)]">
                  {formatGuessesPerSecond(primary.guessesPerSecond)}
                </div>
                <div className="text-right font-medium text-[color:var(--app-text)]">
                  {formatter.formatSeconds(primary.expectedTimeSeconds)}
                </div>
                <div className="text-right text-[color:var(--app-text-muted)]">
                  {formatter.formatSeconds(primary.worstCaseTimeSeconds)}
                </div>
              </div>

              {isExpanded
                ? others.map((s) => (
                    <div
                      key={s.id}
                      className="grid grid-cols-4 px-3 py-2 text-sm"
                    >
                      <div className="text-[color:var(--app-text)]">
                        {s.name}
                      </div>
                      <div className="text-right text-[color:var(--app-text-muted)]">
                        {formatGuessesPerSecond(s.guessesPerSecond)}
                      </div>
                      <div className="text-right font-medium text-[color:var(--app-text)]">
                        {formatter.formatSeconds(s.expectedTimeSeconds)}
                      </div>
                      <div className="text-right text-[color:var(--app-text-muted)]">
                        {formatter.formatSeconds(s.worstCaseTimeSeconds)}
                      </div>
                    </div>
                  ))
                : null}
            </div>
          ) : (
            <div className="px-3 py-3 text-sm text-[color:var(--app-text-subtle)]">
              Type a password to see estimates.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function formatGuessesPerSecond(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (value >= 1_000_000_000) return `${Math.round(value / 1_000_000_000)}B/s`;
  if (value >= 1_000_000) return `${Math.round(value / 1_000_000)}M/s`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K/s`;
  if (value >= 1) return `${value.toFixed(0)}/s`;
  return `${value.toFixed(2)}/s`;
}
