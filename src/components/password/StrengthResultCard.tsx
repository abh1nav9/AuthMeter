import type { PasswordAnalysisResult } from "../../domain/password/PasswordAnalysisTypes";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Progress } from "../ui/Progress";
import { PasswordStrengthToneMapper } from "./PasswordStrengthToneMapper";
import type { PwnedPasswordStatus } from "../../viewmodels/usePwnedPasswordViewModel";
import { PwnedPasswordStatusRow } from "./PwnedPasswordStatus";

export interface StrengthResultCardProps {
  analysis: PasswordAnalysisResult;
  className?: string;
  pwnedEnabled?: boolean;
  pwnedStatus?: PwnedPasswordStatus;
}

export function StrengthResultCard({
  analysis,
  className,
  pwnedEnabled,
  pwnedStatus,
}: StrengthResultCardProps) {
  const mapper = new PasswordStrengthToneMapper();
  const tone = mapper.getBadgeTone(analysis.strengthLabel);
  const barClassName = mapper.getProgressBarClassName(analysis.strengthLabel);

  return (
    <Card className={className}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="text-sm font-medium text-[color:var(--app-text)]">
            Strength
          </div>
          <div className="text-xs text-[color:var(--app-text-subtle)]">
            Percentage is based on estimated entropy (length + variety + pattern
            penalties).
          </div>
        </div>
        <Badge tone={tone}>{analysis.strengthLabel}</Badge>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="text-[color:var(--app-text-muted)]">Score</div>
          <div className="font-semibold text-[color:var(--app-text)]">
            {analysis.strengthScorePercent}%
          </div>
        </div>
        <Progress
          value={analysis.strengthScorePercent}
          barClassName={barClassName}
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-2)] p-3">
          <div className="text-[11px] text-[color:var(--app-text-subtle)]">
            Length
          </div>
          <div className="mt-1 text-sm font-semibold">
            {analysis.passwordLength}
          </div>
        </div>
        <div className="rounded-xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-2)] p-3">
          <div className="text-[11px] text-[color:var(--app-text-subtle)]">
            Charset
          </div>
          <div className="mt-1 text-sm font-semibold">
            {analysis.detectedCharsetSize || "—"}
          </div>
        </div>
        <div className="rounded-xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-2)] p-3">
          <div className="text-[11px] text-[color:var(--app-text-subtle)]">
            Entropy
          </div>
          <div className="mt-1 text-sm font-semibold">
            {Math.round(analysis.estimatedEntropyBits)} bits
          </div>
        </div>
      </div>

      {typeof pwnedEnabled === "boolean" && pwnedStatus ? (
        <PwnedPasswordStatusRow enabled={pwnedEnabled} status={pwnedStatus} />
      ) : null}
    </Card>
  );
}
