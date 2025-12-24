import type { ButtonHTMLAttributes } from "react";

function cx(...parts: Array<string | undefined | false>): string {
  return parts.filter(Boolean).join(" ");
}

export type SwitchProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onChange"
> & {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
};

export function Switch({
  checked,
  onCheckedChange,
  className,
  ...props
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      {...props}
      onClick={() => onCheckedChange(!checked)}
      className={cx(
        "relative inline-flex h-6 w-10 items-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface-2)] transition-colors",
        checked ? "bg-[var(--app-surface-2)]" : "opacity-80",
        className
      )}
    >
      <span
        className={cx(
          "inline-block h-5 w-5 translate-x-0.5 rounded-full bg-[var(--app-text)] transition-transform",
          checked ? "translate-x-4" : "translate-x-0.5"
        )}
      />
    </button>
  );
}
