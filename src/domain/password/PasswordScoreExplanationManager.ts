import type { AttackScenarioResult } from "./PasswordAnalysisTypes";
import { PasswordMath } from "./PasswordMath";

export interface ScoreExplanation {
  readonly baseScoreFromEntropy: number;
  readonly entropyBits: number;
  readonly adjustedScore: number;
  readonly adjustmentReason?: string;
  readonly explanation: string;
}

export interface CrackTimeExplanation {
  readonly fastestScenario: AttackScenarioResult | null;
  readonly explanation: string;
}

export interface PasswordScoreExplanationManagerProtocol {
  explainScore(
    entropyBits: number,
    finalScore: number,
    scenarios?: AttackScenarioResult[]
  ): ScoreExplanation;
  explainCrackTime(scenarios: AttackScenarioResult[]): CrackTimeExplanation;
}

export class PasswordScoreExplanationManager
  implements PasswordScoreExplanationManagerProtocol
{
  private readonly math: PasswordMath;

  constructor(math: PasswordMath) {
    this.math = math;
  }

  explainScore(
    entropyBits: number,
    finalScore: number,
    scenarios?: AttackScenarioResult[]
  ): ScoreExplanation {
    const baseScore = this.calculateBaseScore(entropyBits);
    const adjustment = finalScore - baseScore;
    const hasAdjustment = Math.abs(adjustment) > 0.5;

    let adjustmentReason: string | undefined;
    if (hasAdjustment && scenarios) {
      const criticalScenarios = this.getCriticalScenarios(scenarios);
      if (criticalScenarios.length > 0) {
        const averageTime = this.getAverageExpectedCrackTime(criticalScenarios);
        if (Number.isFinite(averageTime)) {
          adjustmentReason = this.getAdjustmentReason(averageTime);
        }
      }
    }

    const explanation = this.buildExplanation(
      entropyBits,
      baseScore,
      finalScore,
      hasAdjustment,
      adjustmentReason
    );

    return {
      baseScoreFromEntropy: baseScore,
      entropyBits,
      adjustedScore: finalScore,
      adjustmentReason,
      explanation,
    };
  }

  explainCrackTime(scenarios: AttackScenarioResult[]): CrackTimeExplanation {
    const criticalScenarios = this.getCriticalScenarios(scenarios);
    if (criticalScenarios.length === 0) {
      return {
        fastestScenario: null,
        explanation:
          "Crack time estimates are based on brute-force entropy calculations.",
      };
    }

    const averageTime = this.getAverageExpectedCrackTime(criticalScenarios);
    if (
      !Number.isFinite(averageTime) ||
      averageTime === Number.POSITIVE_INFINITY
    ) {
      return {
        fastestScenario: null,
        explanation:
          "Crack time estimates are based on brute-force entropy calculations.",
      };
    }

    const explanation = this.buildCrackTimeExplanation(
      criticalScenarios,
      averageTime
    );

    return {
      fastestScenario: criticalScenarios[0] ?? null,
      explanation,
    };
  }

  private calculateBaseScore(entropyBits: number): number {
    const normalized = entropyBits / 80;
    return Math.round(this.math.clamp(normalized, 0, 1) * 100);
  }

  private getCriticalScenarios(
    scenarios: AttackScenarioResult[]
  ): AttackScenarioResult[] {
    const criticalIds: string[] = [
      "gpu_rules_fast_hash",
      "wordlist_rules",
      "wordlist_basic",
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

  private getAdjustmentReason(averageCrackTimeSeconds: number): string {
    const secondsInMinute = 60;
    const secondsInHour = 3600;
    const secondsInDay = 86400;
    const secondsInMonth = 2592000;
    const secondsInYear = 31536000;

    if (averageCrackTimeSeconds < secondsInMinute) {
      return "Average crack time across rule-based and wordlist attacks is under a minute.";
    }
    if (averageCrackTimeSeconds < secondsInHour) {
      return "Average crack time across rule-based and wordlist attacks is under an hour.";
    }
    if (averageCrackTimeSeconds < secondsInDay) {
      return "Average crack time across rule-based and wordlist attacks is under a day.";
    }
    if (averageCrackTimeSeconds < secondsInMonth) {
      return "Average crack time across rule-based and wordlist attacks is under a month.";
    }
    if (averageCrackTimeSeconds < secondsInYear) {
      return "Average crack time across rule-based and wordlist attacks is under a year.";
    }
    if (averageCrackTimeSeconds < secondsInYear * 10) {
      return "Average crack time across rule-based and wordlist attacks is under 10 years.";
    }
    return "";
  }

  private buildExplanation(
    entropyBits: number,
    baseScore: number,
    finalScore: number,
    hasAdjustment: boolean,
    adjustmentReason?: string
  ): string {
    const entropyPart = `Base score: ${baseScore}% from ${Math.round(
      entropyBits
    )} bits of entropy (length × charset variety, minus pattern penalties).`;

    if (!hasAdjustment || !adjustmentReason) {
      return `${entropyPart} No crack-time adjustment applied.`;
    }

    const adjustmentPart =
      finalScore < baseScore
        ? `Score reduced to ${finalScore}% because ${adjustmentReason.toLowerCase()}`
        : `Score adjusted to ${finalScore}% because ${adjustmentReason.toLowerCase()}`;

    return `${entropyPart} ${adjustmentPart}`;
  }

  private buildCrackTimeExplanation(
    _scenarios: AttackScenarioResult[],
    averageTime: number
  ): string {
    const timeDescription = this.formatTimeDescription(averageTime);

    const attackType =
      "The score uses the average expected crack time across four realistic attack scenarios: Rule-based GPU (fast hash), Wordlist attack (rockyou.txt), Wordlist + rules (GPU), and Rule-based GPU (slow hash). These methods use wordlists with transformation rules (capitalization, leetspeak, appending numbers) and are much faster than brute force.";

    return `Average across realistic attacks: ${timeDescription.toLowerCase()} ${attackType} This is why the score was adjusted—real attackers use these methods, not pure brute force.`;
  }

  private formatTimeDescription(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds === Number.POSITIVE_INFINITY) {
      return "Crack time is effectively infinite.";
    }

    const secondsInMinute = 60;
    const secondsInHour = 3600;
    const secondsInDay = 86400;
    const secondsInMonth = 2592000;
    const secondsInYear = 31536000;

    if (seconds < secondsInMinute) {
      return `Worst-case crack time: ${Math.round(seconds)} seconds.`;
    }
    if (seconds < secondsInHour) {
      return `Worst-case crack time: ${Math.round(
        seconds / secondsInMinute
      )} minutes.`;
    }
    if (seconds < secondsInDay) {
      return `Worst-case crack time: ${Math.round(
        seconds / secondsInHour
      )} hours.`;
    }
    if (seconds < secondsInMonth) {
      return `Worst-case crack time: ${Math.round(
        seconds / secondsInDay
      )} days.`;
    }
    if (seconds < secondsInYear) {
      return `Worst-case crack time: ${Math.round(
        seconds / secondsInMonth
      )} months.`;
    }
    if (seconds < secondsInYear * 10) {
      return `Worst-case crack time: ${Math.round(
        seconds / secondsInYear
      )} years.`;
    }
    return `Worst-case crack time: ${Math.round(
      seconds / secondsInYear
    )}+ years.`;
  }
}
