import type {
  PasswordAnalysisResult,
  PasswordPolicyFinding,
} from "../../domain/password/PasswordAnalysisTypes";
import type { PwnedPasswordStatus } from "../../viewmodels/usePwnedPasswordViewModel";
import { Drawer } from "../ui/Drawer";
import { Badge } from "../ui/Badge";
import { PasswordScoreExplanationManager } from "../../domain/password/PasswordScoreExplanationManager";
import { PasswordMath } from "../../domain/password/PasswordMath";
import { useMemo } from "react";

export interface ScoreExplanationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: PasswordAnalysisResult;
  pwnedStatus?: PwnedPasswordStatus;
}

export function ScoreExplanationDrawer(props: ScoreExplanationDrawerProps) {
  const policy = props.analysis.policyFindings ?? [];
  const insights = props.analysis.insights ?? [];

  const explanationManager = useMemo(
    () => new PasswordScoreExplanationManager(new PasswordMath()),
    []
  );

  const scoreExplanation = useMemo(
    () =>
      explanationManager.explainScore(
        props.analysis.estimatedEntropyBits,
        props.analysis.strengthScorePercent,
        props.analysis.scenarios
      ),
    [
      explanationManager,
      props.analysis.estimatedEntropyBits,
      props.analysis.strengthScorePercent,
      props.analysis.scenarios,
    ]
  );

  const crackTimeExplanation = useMemo(
    () => explanationManager.explainCrackTime(props.analysis.scenarios),
    [explanationManager, props.analysis.scenarios]
  );

  return (
    <Drawer
      isOpen={props.isOpen}
      onClose={props.onClose}
      title="Why this score?"
    >
      <div className="grid gap-4">
        <Section title="Summary">
          <div className="grid grid-cols-3 gap-3">
            <Metric
              label="Score"
              value={`${props.analysis.strengthScorePercent}%`}
            />
            <Metric
              label="Entropy"
              value={`${Math.round(props.analysis.estimatedEntropyBits)} bits`}
            />
            <Metric label="Length" value={`${props.analysis.passwordLength}`} />
          </div>
        </Section>

        <Section title="Why this score?">
          <div className="text-sm text-[var(--app-text)] leading-relaxed">
            {scoreExplanation.explanation}
          </div>
          {scoreExplanation.adjustmentReason && (
            <div className="mt-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-2)] p-2 text-xs text-[var(--app-text-muted)]">
              <strong>Note:</strong> {scoreExplanation.adjustmentReason}
            </div>
          )}
        </Section>

        <Section title="Why this crack time?">
          <div className="text-sm text-[var(--app-text)] leading-relaxed">
            {crackTimeExplanation.explanation}
          </div>
        </Section>

        <Section title="Policy checks">
          {policy.length === 0 ? (
            <div className="text-sm text-[var(--app-text-subtle)]">
              Type a password to see policy checks.
            </div>
          ) : (
            <ul className="space-y-2">
              {policy.map((f) => (
                <li
                  key={f.id}
                  className="flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm text-[var(--app-text)]">
                      {f.label}
                    </div>
                    {f.detail ? (
                      <div className="text-xs text-[var(--app-text-subtle)]">
                        {f.detail}
                      </div>
                    ) : null}
                  </div>
                  <Badge tone={toneForPolicy(f)}>
                    {f.status.toUpperCase()}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Detected patterns (zxcvbn)">
          {insights.length === 0 ? (
            <div className="text-sm text-[var(--app-text-subtle)]">
              No pattern matches detected.
            </div>
          ) : (
            <ul className="space-y-1 text-sm text-[var(--app-text)]">
              {insights.map((i) => (
                <li key={`${i.kind}:${i.label}`}>- {i.label}</li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Breach exposure (HIBP)">
          <div className="text-sm text-[var(--app-text)]">
            {renderPwnedText(props.pwnedStatus)}
          </div>
          <div className="mt-1 text-xs text-[var(--app-text-subtle)]">
            Note: this checks only a SHA‑1 hash prefix (k‑anonymity). Your
            password is never sent.
          </div>
        </Section>
      </div>
    </Drawer>
  );
}

function Section(props: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3">
      <div className="text-xs font-medium text-[var(--app-text-muted)]">
        {props.title}
      </div>
      <div className="mt-2">{props.children}</div>
    </div>
  );
}

function Metric(props: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-2)] p-3">
      <div className="text-[11px] text-[var(--app-text-subtle)]">
        {props.label}
      </div>
      <div className="mt-1 text-sm font-semibold text-[var(--app-text)]">
        {props.value}
      </div>
    </div>
  );
}

function toneForPolicy(
  f: PasswordPolicyFinding
): "success" | "warning" | "danger" | "neutral" {
  if (f.status === "pass") return "success";
  if (f.status === "warn") return "warning";
  return "danger";
}

function renderPwnedText(status?: PwnedPasswordStatus): string {
  if (!status) return "Breach check not available.";
  switch (status.kind) {
    case "idle":
      return "Not checked.";
    case "loading":
      return "Checking…";
    case "safe":
      return "Not found in known breach dataset.";
    case "compromised":
      return `Found in breaches ${status.breachCount} times.`;
    case "error":
      return "Error checking breach exposure.";
    default:
      return "Breach status.";
  }
}
