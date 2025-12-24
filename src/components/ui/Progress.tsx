import { motion } from "motion/react";

function cx(...parts: Array<string | undefined | false>): string {
  return parts.filter(Boolean).join(" ");
}

export interface ProgressProps {
  value: number;
  className?: string;
  barClassName?: string;
}

export function Progress({ value, className, barClassName }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      className={cx(
        "h-2 w-full overflow-hidden rounded-full bg-[var(--app-surface-2)]",
        className
      )}
    >
      <motion.div
        className={cx("h-full rounded-full", barClassName ?? "bg-white")}
        initial={false}
        animate={{ width: `${clamped}%` }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
      />
    </div>
  );
}
