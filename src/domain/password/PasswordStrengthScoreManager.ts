import type {
  AttackScenarioResult,
  PasswordStrengthLabel,
} from "./PasswordAnalysisTypes";
import { PasswordMath } from "./PasswordMath";

export interface PasswordStrengthScoreResult {
  readonly scorePercent: number;
  readonly label: PasswordStrengthLabel;
}

export interface PasswordStrengthScoreManagerProtocol {
  getScore(
    entropyBits: number,
    scenarios?: AttackScenarioResult[]
  ): PasswordStrengthScoreResult;
}

export class PasswordStrengthScoreManager
  implements PasswordStrengthScoreManagerProtocol
{
  private readonly math: PasswordMath;

  constructor(math: PasswordMath) {
    this.math = math;
  }

  getScore(
    entropyBits: number,
    scenarios?: AttackScenarioResult[]
  ): PasswordStrengthScoreResult {
    const baseScore = this.scoreFromEntropy(entropyBits);
    const adjustedScore = this.adjustScoreFromCrackTime(baseScore, scenarios);
    return {
      scorePercent: adjustedScore,
      label: this.labelFromScore(adjustedScore),
    };
  }

  private scoreFromEntropy(entropyBits: number): number {
    const normalized = entropyBits / 80;
    return Math.round(this.math.clamp(normalized, 0, 1) * 100);
  }

  private adjustScoreFromCrackTime(
    baseScore: number,
    scenarios?: AttackScenarioResult[]
  ): number {
    if (!scenarios || scenarios.length === 0) return baseScore;

    const criticalScenarios = this.getCriticalScenarios(scenarios);
    if (criticalScenarios.length === 0) return baseScore;

    const averageCrackTime =
      this.getAverageExpectedCrackTime(criticalScenarios);
    const adjustedScore = this.calculateScoreFromCrackTime(
      baseScore,
      averageCrackTime
    );

    return Math.max(0, Math.min(100, adjustedScore));
  }

  private getCriticalScenarios(
    scenarios: AttackScenarioResult[]
  ): AttackScenarioResult[] {
    const criticalIds: string[] = [
      "gpu_rules_fast_hash",
      "wordlist_basic",
      "wordlist_rules",
      "gpu_rules_slow_hash",
    ];

    return scenarios.filter((s) => criticalIds.includes(s.id));
  }

  private getAverageExpectedCrackTime(
    scenarios: AttackScenarioResult[]
  ): number {
    const weights: Record<string, number> = {
      gpu_rules_fast_hash: 0.4,
      wordlist_rules: 0.3,
      wordlist_basic: 0.2,
      gpu_rules_slow_hash: 0.1,
    };

    let weightedSum = 0;
    let totalWeight = 0;

    for (const scenario of scenarios) {
      const time = scenario.expectedTimeSeconds;
      const weight = weights[scenario.id] ?? 0.25;

      if (Number.isFinite(time) && time !== Number.POSITIVE_INFINITY) {
        weightedSum += time * weight;
        totalWeight += weight;
      }
    }

    if (totalWeight === 0) return Number.POSITIVE_INFINITY;
    return weightedSum / totalWeight;
  }

  private calculateScoreFromCrackTime(
    baseScore: number,
    averageCrackTimeSeconds: number
  ): number {
    if (!Number.isFinite(averageCrackTimeSeconds)) return baseScore;
    if (averageCrackTimeSeconds === Number.POSITIVE_INFINITY) return baseScore;

    const secondsInMinute = 60;
    const secondsInHour = 3600;
    const secondsInDay = 86400;
    const secondsInWeek = 604800;
    const secondsInMonth = 2592000;
    const secondsInYear = 31536000;

    let penaltyMultiplier = 1.0;

    if (averageCrackTimeSeconds < secondsInMinute) {
      penaltyMultiplier =
        0.05 + (averageCrackTimeSeconds / secondsInMinute) * 0.05;
    } else if (averageCrackTimeSeconds < secondsInHour) {
      const progress =
        (averageCrackTimeSeconds - secondsInMinute) /
        (secondsInHour - secondsInMinute);
      penaltyMultiplier = 0.1 + progress * 0.1;
    } else if (averageCrackTimeSeconds < secondsInDay) {
      const progress =
        (averageCrackTimeSeconds - secondsInHour) /
        (secondsInDay - secondsInHour);
      penaltyMultiplier = 0.2 + progress * 0.2;
    } else if (averageCrackTimeSeconds < secondsInWeek) {
      const progress =
        (averageCrackTimeSeconds - secondsInDay) /
        (secondsInWeek - secondsInDay);
      penaltyMultiplier = 0.4 + progress * 0.1;
    } else if (averageCrackTimeSeconds < secondsInMonth) {
      const progress =
        (averageCrackTimeSeconds - secondsInWeek) /
        (secondsInMonth - secondsInWeek);
      penaltyMultiplier = 0.5 + progress * 0.2;
    } else if (averageCrackTimeSeconds < secondsInYear) {
      const progress =
        (averageCrackTimeSeconds - secondsInMonth) /
        (secondsInYear - secondsInMonth);
      penaltyMultiplier = 0.7 + progress * 0.2;
    } else if (averageCrackTimeSeconds < secondsInYear * 10) {
      const progress =
        (averageCrackTimeSeconds - secondsInYear) / (secondsInYear * 9);
      penaltyMultiplier = 0.9 + progress * 0.1;
    }

    return Math.max(0, Math.min(100, baseScore * penaltyMultiplier));
  }

  private labelFromScore(scorePercent: number): PasswordStrengthLabel {
    if (scorePercent < 20) return "Very weak";
    if (scorePercent < 40) return "Weak";
    if (scorePercent < 60) return "Okay";
    if (scorePercent < 80) return "Strong";
    return "Very strong";
  }
}
