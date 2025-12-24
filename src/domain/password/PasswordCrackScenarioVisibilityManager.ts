import type { AttackScenarioResult } from "./PasswordAnalysisTypes";

export interface CrackScenarioVisibility {
  readonly primary: AttackScenarioResult | null;
  readonly others: AttackScenarioResult[];
}

export interface PasswordCrackScenarioVisibilityManagerProtocol {
  getVisibility(scenarios: AttackScenarioResult[]): CrackScenarioVisibility;
}

export class PasswordCrackScenarioVisibilityManager
  implements PasswordCrackScenarioVisibilityManagerProtocol
{
  getVisibility(scenarios: AttackScenarioResult[]): CrackScenarioVisibility {
    const primary =
      scenarios.find((s) => s.id === "offline_fast_hash") ??
      scenarios[0] ??
      null;
    const others = scenarios.filter((s) => primary && s.id !== primary.id);
    return { primary, others };
  }
}
