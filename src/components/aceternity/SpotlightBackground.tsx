import type { PropsWithChildren } from "react";

export interface SpotlightBackgroundProps extends PropsWithChildren {
  className?: string;
}

function cx(...parts: Array<string | undefined | false>): string {
  return parts.filter(Boolean).join(" ");
}

export function SpotlightBackground({
  className,
  children,
}: SpotlightBackgroundProps) {
  return (
    <div
      className={cx(
        "relative h-dvh overflow-hidden bg-[var(--app-bg)] text-[var(--app-text)]",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,var(--app-spot-1),transparent_60%)] blur-2xl" />
        <div className="absolute bottom-[-260px] right-[-260px] h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle_at_center,var(--app-spot-2),transparent_60%)] blur-2xl" />
        <div className="absolute bottom-[-260px] left-[-260px] h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle_at_center,var(--app-spot-3),transparent_60%)] blur-2xl" />
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
