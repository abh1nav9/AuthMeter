import type { PropsWithChildren } from "react";

function cx(...parts: Array<string | undefined | false>): string {
  return parts.filter(Boolean).join(" ");
}

export type BadgeTone = "neutral" | "danger" | "warning" | "success";

export interface BadgeProps extends PropsWithChildren {
  tone?: BadgeTone;
  className?: string;
}

export function Badge({ tone = "neutral", className, children }: BadgeProps) {
  const toneClasses: Record<BadgeTone, string> = {
    neutral:
      "bg-[var(--badge-neutral-bg)] text-[var(--badge-neutral-text)] border-[var(--badge-neutral-border)]",
    danger:
      "bg-[var(--badge-danger-bg)] text-[var(--badge-danger-text)] border-[var(--badge-danger-border)]",
    warning:
      "bg-[var(--badge-warning-bg)] text-[var(--badge-warning-text)] border-[var(--badge-warning-border)]",
    success:
      "bg-[var(--badge-success-bg)] text-[var(--badge-success-text)] border-[var(--badge-success-border)]",
  };

  return (
    <span
      className={cx(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
