import type { AttackScenarioResult } from "./PasswordAnalysisTypes";

export interface CrackScenarioVisibility {
  readonly visible: AttackScenarioResult[];
  readonly hidden: AttackScenarioResult[];
}

export interface PasswordCrackScenarioVisibilityManagerProtocol {
  getVisibility(scenarios: AttackScenarioResult[]): CrackScenarioVisibility;
}

export class PasswordCrackScenarioVisibilityManager
  implements PasswordCrackScenarioVisibilityManagerProtocol
{
  private readonly visibleScenarioIds: string[] = [
    "gpu_rules_fast_hash",
    "wordlist_basic",
    "wordlist_rules",
  ];

  getVisibility(scenarios: AttackScenarioResult[]): CrackScenarioVisibility {
    const visible: AttackScenarioResult[] = [];
    const hidden: AttackScenarioResult[] = [];

    for (const scenario of scenarios) {
      if (this.visibleScenarioIds.includes(scenario.id)) {
        visible.push(scenario);
      } else {
        hidden.push(scenario);
      }
    }

    const sortedVisible = this.sortVisibleScenarios(visible);
    const sortedHidden = this.sortHiddenScenarios(hidden);

    return { visible: sortedVisible, hidden: sortedHidden };
  }

  private sortVisibleScenarios(
    scenarios: AttackScenarioResult[]
  ): AttackScenarioResult[] {
    const order = this.visibleScenarioIds;
    return scenarios.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  }

  private sortHiddenScenarios(
    scenarios: AttackScenarioResult[]
  ): AttackScenarioResult[] {
    const priorityOrder = [
      "gpu_rules_slow_hash",
      "offline_fast_hash",
      "offline_slow_hash",
      "offline_pbkdf2",
      "offline_scrypt",
      "offline_argon2id",
      "online_unthrottled",
      "online_throttled",
    ];

    return scenarios.sort((a, b) => {
      const aIndex = priorityOrder.indexOf(a.id);
      const bIndex = priorityOrder.indexOf(b.id);
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  }
}
