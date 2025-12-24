import type { PasswordAnalysisResult } from "../../domain/password/PasswordAnalysisTypes";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Progress } from "../ui/Progress";
import { PasswordStrengthToneMapper } from "./PasswordStrengthToneMapper";
import type { PwnedPasswordStatus } from "../../viewmodels/usePwnedPasswordViewModel";
import { PwnedPasswordStatusRow } from "./PwnedPasswordStatus";
import { useState } from "react";
import { ScoreExplanationDrawer } from "./ScoreExplanationDrawer";
import { Button } from "../ui/Button";
import { Copy, Info } from "lucide-react";

export interface StrengthResultCardProps {
  analysis: PasswordAnalysisResult;
  className?: string;
  pwnedEnabled?: boolean;
  onPwnedEnabledChange?: (value: boolean) => void;
  pwnedStatus?: PwnedPasswordStatus;
}

export function StrengthResultCard({
  analysis,
  className,
  pwnedEnabled,
  onPwnedEnabledChange,
  pwnedStatus,
}: StrengthResultCardProps) {
  const mapper = new PasswordStrengthToneMapper();
  const tone = mapper.getBadgeTone(analysis.strengthLabel);
  const barClassName = mapper.getProgressBarClassName(analysis.strengthLabel);
  const [isWhyOpen, setIsWhyOpen] = useState(false);

  return (
    <Card className={className}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="text-sm font-medium text-[var(--app-text)]">
            Strength
          </div>
          <div className="text-xs text-[var(--app-text-subtle)]">
            Percentage is based on estimated entropy (length + variety + pattern
            penalties).
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* <Button
            variant="ghost"
            className="h-6 shrink-0 rounded-full border border-[var(--app-border)] px-3 text-[10px] transition-all hover:scale-105 hover:border-[var(--app-text)] hover:bg-[var(--app-surface)]"
            onClick={() => setIsWhyOpen(true)}
            aria-label="Explain score"
            title="Why this score?"
          >
            Why?
          </Button> */}
          <Button
            variant="ghost"
            className="shrink-0 border border-[var(--app-border)] p-0"
            onClick={() => setIsWhyOpen(true)}
            aria-label={isWhyOpen ? "Close explanation" : "Explain score"}
            title={isWhyOpen ? "Close explanation" : "Explain score"}
          >
            <Info size={12} />
          </Button>
          <Badge tone={tone}>{analysis.strengthLabel}</Badge>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="text-[var(--app-text-muted)]">Score</div>
          <div className="font-semibold text-[var(--app-text)]">
            {analysis.strengthScorePercent}%
          </div>
        </div>
        <Progress
          value={analysis.strengthScorePercent}
          barClassName={barClassName}
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-2)] p-3">
          <div className="text-[11px] text-[var(--app-text-subtle)]">
            Length
          </div>
          <div className="mt-1 text-sm font-semibold">
            {analysis.passwordLength}
          </div>
        </div>
        <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-2)] p-3">
          <div className="text-[11px] text-[var(--app-text-subtle)]">
            Charset
          </div>
          <div className="mt-1 text-sm font-semibold">
            {analysis.detectedCharsetSize || "—"}
          </div>
        </div>
        <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-2)] p-3">
          <div className="text-[11px] text-[var(--app-text-subtle)]">
            Entropy
          </div>
          <div className="mt-1 text-sm font-semibold">
            {Math.round(analysis.estimatedEntropyBits)} bits
          </div>
        </div>
      </div>

      {typeof pwnedEnabled === "boolean" &&
      pwnedStatus &&
      onPwnedEnabledChange ? (
        <PwnedPasswordStatusRow
          enabled={pwnedEnabled}
          onEnabledChange={onPwnedEnabledChange}
          status={pwnedStatus}
        />
      ) : null}

      <ScoreExplanationDrawer
        isOpen={isWhyOpen}
        onClose={() => setIsWhyOpen(false)}
        analysis={analysis}
        pwnedStatus={pwnedStatus}
      />
    </Card>
  );
}
