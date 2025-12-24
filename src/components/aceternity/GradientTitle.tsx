import { motion } from "motion/react";
import type { PropsWithChildren } from "react";

export interface GradientTitleProps extends PropsWithChildren {
  className?: string;
}

function cx(...parts: Array<string | undefined | false>): string {
  return parts.filter(Boolean).join(" ");
}

export function GradientTitle({ className, children }: GradientTitleProps) {
  return (
    <motion.h1
      className={cx(
        "text-balance text-2xl font-semibold tracking-tight sm:text-4xl",
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <span className="bg-linear-to-r from-(--app-text) via-(--app-text) to-(--app-text-muted) bg-clip-text text-transparent">
        {children}
      </span>
    </motion.h1>
  );
}
