import type { SelectHTMLAttributes } from "react";

function cx(...parts: Array<string | undefined | false>): string {
  return parts.filter(Boolean).join(" ");
}

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  className?: string;
};

export function Select({ className, ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={cx(
        "h-8 rounded-xl border border-[var(--app-border)] bg-[var(--app-input-bg)] px-3 text-sm text-[var(--app-text)] outline-none focus:ring-2 focus:ring-[var(--app-ring)]",
        className
      )}
    />
  );
}
