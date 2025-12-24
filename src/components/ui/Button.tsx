import type { ButtonHTMLAttributes } from "react";

function cx(...parts: Array<string | undefined | false>): string {
  return parts.filter(Boolean).join(" ");
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  const variantClasses =
    variant === "primary"
      ? "bg-[color:var(--app-text)] text-[color:var(--app-bg)] hover:opacity-90"
      : "bg-transparent text-[color:var(--app-text)] hover:bg-[color:var(--app-surface-2)]";

  return (
    <button
      {...props}
      className={cx(
        "inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-medium transition-colors disabled:opacity-50",
        variantClasses,
        className
      )}
    />
  );
}
