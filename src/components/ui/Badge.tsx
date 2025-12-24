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
      "bg-(--badge-neutral-bg) text-(--badge-neutral-text) border-(--badge-neutral-border)",
    danger:
      "bg-(--badge-danger-bg) text-(--badge-danger-text) border-(--badge-danger-border)",
    warning:
      "bg-(--badge-warning-bg) text-(--badge-warning-text) border-(--badge-warning-border)",
    success:
      "bg-(--badge-success-bg) text-(--badge-success-text) border-(--badge-success-border)",
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
