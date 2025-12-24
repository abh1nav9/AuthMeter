import type { PropsWithChildren } from "react";

export interface CardProps extends PropsWithChildren {
  className?: string;
}

function cx(...parts: Array<string | undefined | false>): string {
  return parts.filter(Boolean).join(" ");
}

export function Card(props: CardProps) {
  return (
    <div
      className={cx(
        "rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-sm backdrop-blur overflow-hidden sm:p-5",
        props.className
      )}
    >
      {props.children}
    </div>
  );
}
