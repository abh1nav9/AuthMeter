import { motion } from "motion/react";
import type { PropsWithChildren } from "react";
import { createPortal } from "react-dom";

export interface DrawerProps extends PropsWithChildren {
  isOpen: boolean;
  title: string;
  onClose: () => void;
}

export function Drawer({ isOpen, title, onClose, children }: DrawerProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="relative w-full max-w-2xl rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-2)] p-4 shadow-xl backdrop-blur sm:p-5"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-[var(--app-text)]">
              {title}
            </div>
            <div className="text-xs text-[var(--app-text-subtle)]">
              Details and recommendations
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] hover:bg-[var(--app-surface-2)]"
            aria-label="Close drawer"
          >
            ×
          </button>
        </div>
        <div className="mt-4 max-h-[70vh] overflow-auto">{children}</div>
      </motion.div>
    </div>,
    document.body
  );
}
