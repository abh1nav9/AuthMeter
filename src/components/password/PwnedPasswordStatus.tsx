import type { PwnedPasswordStatus } from "../../viewmodels/usePwnedPasswordViewModel";
import { Badge } from "../ui/Badge";

export interface PwnedPasswordStatusProps {
  enabled: boolean;
  status: PwnedPasswordStatus;
}

export function PwnedPasswordStatusRow({
  enabled,
  status,
}: PwnedPasswordStatusProps) {
  return (
    <div className="mt-4 rounded-xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-2)] p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-medium text-[color:var(--app-text-muted)]">
            Breach exposure (HIBP)
          </div>
          <div className="text-[11px] text-[color:var(--app-text-subtle)]">
            Checks only a SHA‑1 prefix (k‑anonymity). Your password is never
            sent.
          </div>
        </div>
        <BreachBadge enabled={enabled} status={status} />
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
