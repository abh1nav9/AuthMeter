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
        "h-11 w-full rounded-xl border border-[color:var(--app-border)] bg-[color:var(--app-input-bg)] px-4 text-[color:var(--app-text)] outline-none placeholder:text-[color:var(--app-text-subtle)] focus:border-[color:var(--app-border)] focus:ring-2 focus:ring-[color:var(--app-ring)]",
        className
      )}
    />
  );
}
