import { useEffect, useMemo, useRef, useState } from "react";
import { PasswordAnalysisManager } from "../domain/password/PasswordAnalysisManager";
import type { PasswordAnalysisResult } from "../domain/password/PasswordAnalysisTypes";
import { ZxcvbnPasswordEnhancer } from "../domain/password/ZxcvbnPasswordEnhancer";
import type { PasswordContext } from "../domain/password/PasswordContext";

export interface PasswordAnalyzerViewModel {
  password: string;
  setPassword: (value: string) => void;
  context: PasswordContext;
  setContext: (next: PasswordContext) => void;
  analysis: PasswordAnalysisResult;
}

export function usePasswordAnalyzerViewModel(): PasswordAnalyzerViewModel {
  const [password, setPassword] = useState("");
  const [context, setContext] = useState<PasswordContext>({
    username: "",
    email: "",
    site: "",
  });

  const analysisManager = useMemo(() => new PasswordAnalysisManager(), []);
  const enhancer = useMemo(() => new ZxcvbnPasswordEnhancer(), []);
  const [analysis, setAnalysis] = useState<PasswordAnalysisResult>(() =>
    analysisManager.analyze("", context)
  );
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const base = analysisManager.analyze(password, context);
    setAnalysis(base);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // Enhance asynchronously with zxcvbn (lazy-loaded) to reduce initial bundle size.
    enhancer
      .enhance(password, base, controller.signal)
      .then((enhanced) => {
        if (controller.signal.aborted) return;
        setAnalysis(enhanced);
      })
      .catch(() => {
        // ignore
      });

    return () => controller.abort();
  }, [analysisManager, context, enhancer, password]);

  return { password, setPassword, context, setContext, analysis };
}
