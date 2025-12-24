import type { InputHTMLAttributes } from "react";

function cx(...parts: Array<string | undefined | false>): string {
  return parts.filter(Boolean).join(" ");
}

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      {...props}
      className={cx(
        "h-10 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-input-bg)] px-4 text-[var(--app-text)] outline-none placeholder:text-[var(--app-text-subtle)] focus:border-[var(--app-border)] focus:ring-2 focus:ring-[var(--app-ring)]",
        className
      )}
    />
  );
}
