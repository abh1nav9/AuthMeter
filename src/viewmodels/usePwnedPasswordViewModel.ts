import { useEffect, useMemo, useRef, useState } from "react";
import { PwnedPasswordCheckerManager } from "../domain/breach/PwnedPasswordCheckerManager";

export type PwnedPasswordStatus =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "safe" }
  | { kind: "compromised"; breachCount: number }
  | { kind: "error" };

export interface PwnedPasswordViewModel {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
  status: PwnedPasswordStatus;
}

export function usePwnedPasswordViewModel(
  password: string
): PwnedPasswordViewModel {
  const checker = useMemo(() => new PwnedPasswordCheckerManager(), []);
  const [enabled, setEnabled] = useState(true);
  const [status, setStatus] = useState<PwnedPasswordStatus>({ kind: "idle" });
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    abortRef.current = null;

    if (!enabled) {
      setStatus({ kind: "idle" });
      return;
    }

    const trimmed = password.trim();
    if (trimmed.length === 0) {
      setStatus({ kind: "idle" });
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setStatus({ kind: "loading" });

    const handle = window.setTimeout(async () => {
      try {
        const result = await checker.check(trimmed, controller.signal);
        if (controller.signal.aborted) return;
        if (result.breachCount > 0)
          setStatus({ kind: "compromised", breachCount: result.breachCount });
        else setStatus({ kind: "safe" });
      } catch {
        if (controller.signal.aborted) return;
        setStatus({ kind: "error" });
      }
    }, 450);

    return () => {
      window.clearTimeout(handle);
      controller.abort();
    };
  }, [checker, enabled, password]);

  return { enabled, setEnabled, status };
}
