import type { PasswordStrengthLabel } from "./PasswordAnalysisTypes";
import { PasswordMath } from "./PasswordMath";

export interface PasswordStrengthScoreResult {
  readonly scorePercent: number;
  readonly label: PasswordStrengthLabel;
}

export interface PasswordStrengthScoreManagerProtocol {
  getScore(entropyBits: number): PasswordStrengthScoreResult;
}

export class PasswordStrengthScoreManager
  implements PasswordStrengthScoreManagerProtocol
{
  private readonly math: PasswordMath;

  constructor(math: PasswordMath) {
    this.math = math;
  }

  getScore(entropyBits: number): PasswordStrengthScoreResult {
    const score = this.scoreFromEntropy(entropyBits);
    return { scorePercent: score, label: this.labelFromScore(score) };
  }

  private scoreFromEntropy(entropyBits: number): number {
    // Map 0..80 bits into 0..100. 80 bits is "very strong" for human passwords.
    const normalized = entropyBits / 80;
    return Math.round(this.math.clamp(normalized, 0, 1) * 100);
  }

  private labelFromScore(scorePercent: number): PasswordStrengthLabel {
    if (scorePercent < 20) return "Very weak";
    if (scorePercent < 40) return "Weak";
    if (scorePercent < 60) return "Okay";
    if (scorePercent < 80) return "Strong";
    return "Very strong";
  }
}
