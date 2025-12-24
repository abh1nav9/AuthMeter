import { useMemo, useState } from "react";
import { PasswordAnalysisManager } from "../domain/password/PasswordAnalysisManager";
import type { PasswordAnalysisResult } from "../domain/password/PasswordAnalysisTypes";

export interface PasswordAnalyzerViewModel {
  password: string;
  setPassword: (value: string) => void;
  analysis: PasswordAnalysisResult;
}

export function usePasswordAnalyzerViewModel(): PasswordAnalyzerViewModel {
  const [password, setPassword] = useState("");

  const analysisManager = useMemo(() => new PasswordAnalysisManager(), []);
  const analysis = useMemo(
    () => analysisManager.analyze(password),
    [analysisManager, password]
  );

  return { password, setPassword, analysis };
}
