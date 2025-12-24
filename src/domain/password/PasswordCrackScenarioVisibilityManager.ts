import type { AttackScenarioResult } from "./PasswordAnalysisTypes";

export interface CrackScenarioVisibility {
  readonly primary: AttackScenarioResult | null;
  readonly others: AttackScenarioResult[];
}

export interface PasswordCrackScenarioVisibilityManagerProtocol {
  getVisibility(
    scenarios: AttackScenarioResult[],
    preferredPrimaryId?: string
  ): CrackScenarioVisibility;
}

export class PasswordCrackScenarioVisibilityManager
  implements PasswordCrackScenarioVisibilityManagerProtocol
{
  getVisibility(
    scenarios: AttackScenarioResult[],
    preferredPrimaryId?: string
  ): CrackScenarioVisibility {
    const preferred = preferredPrimaryId?.trim();
    const preferredMatch = preferred
      ? scenarios.find((s) => s.id === preferred)
      : undefined;

    const primary =
      preferredMatch ??
      scenarios.find((s) => s.id === "offline_fast_hash") ??
      scenarios[0] ??
      null;
    const others = scenarios.filter((s) => primary && s.id !== primary.id);
    return { primary, others };
  }
}
