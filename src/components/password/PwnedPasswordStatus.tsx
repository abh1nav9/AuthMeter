import type { PwnedPasswordStatus } from "../../viewmodels/usePwnedPasswordViewModel";
import { Badge } from "../ui/Badge";
import { Switch } from "../ui/Switch";

export interface PwnedPasswordStatusProps {
  enabled: boolean;
  onEnabledChange: (value: boolean) => void;
  status: PwnedPasswordStatus;
}

export function PwnedPasswordStatusRow({
  enabled,
  onEnabledChange,
  status,
}: PwnedPasswordStatusProps) {
  return (
    <div className="mt-4 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-2)] p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-medium text-[var(--app-text-muted)]">
            Breach exposure (HIBP)
          </div>
          <div className="text-[11px] text-[var(--app-text-subtle)]">
            Checks only a SHA‑1 prefix (k‑anonymity). Your password is never
            sent.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={enabled}
            onCheckedChange={onEnabledChange}
            aria-label="Enable breach check"
          />
          <BreachBadge enabled={enabled} status={status} />
        </div>
      </div>
      <div className="sr-only" aria-live="polite">
        {enabled ? statusToLiveText(status) : "Breach check disabled."}
      </div>
    </div>
  );
}

function BreachBadge(props: { enabled: boolean; status: PwnedPasswordStatus }) {
  if (!props.enabled) return <Badge tone="neutral">Off</Badge>;
  switch (props.status.kind) {
    case "idle":
      return <Badge tone="neutral">—</Badge>;
    case "loading":
      return <Badge tone="neutral">Checking…</Badge>;
    case "safe":
      return <Badge tone="success">Not found</Badge>;
    case "compromised":
      return (
        <Badge tone="danger">
          {formatCount(props.status.breachCount)} hits
        </Badge>
      );
    case "error":
      return <Badge tone="warning">Error</Badge>;
    default:
      return <Badge tone="neutral">—</Badge>;
  }
}

function formatCount(count: number): string {
  if (count >= 1_000_000_000) return `${Math.round(count / 1_000_000_000)}B`;
  if (count >= 1_000_000) return `${Math.round(count / 1_000_000)}M`;
  if (count >= 1_000) return `${Math.round(count / 1_000)}K`;
  return `${count}`;
}

function statusToLiveText(status: PwnedPasswordStatus): string {
  switch (status.kind) {
    case "idle":
      return "Breach check idle.";
    case "loading":
      return "Checking breach exposure.";
    case "safe":
      return "Password not found in breach dataset.";
    case "compromised":
      return `Password found in breaches ${status.breachCount} times.`;
    case "error":
      return "Breach check error.";
    default:
      return "Breach check status.";
  }
}
