import { PasswordCharacterSetManager } from "./PasswordCharacterSetManager";
import type { PasswordAnalysisResult } from "./PasswordAnalysisTypes";
import { PasswordCrackTimeEstimator } from "./PasswordCrackTimeEstimator";
import { PasswordGuessEstimator } from "./PasswordGuessEstimator";
import { PasswordMath } from "./PasswordMath";
import { PasswordPatternPenaltyManager } from "./PasswordPatternPenaltyManager";
import { PasswordStrengthScoreManager } from "./PasswordStrengthScoreManager";

export interface PasswordAnalysisManagerProtocol {
  analyze(password: string): PasswordAnalysisResult;
}

export class PasswordAnalysisManager
  implements PasswordAnalysisManagerProtocol
{
  private readonly math = new PasswordMath();
  private readonly characterSetManager = new PasswordCharacterSetManager();
  private readonly penaltyManager = new PasswordPatternPenaltyManager();
  private readonly guessEstimator = new PasswordGuessEstimator(this.math);
  private readonly scoreManager = new PasswordStrengthScoreManager(this.math);
  private readonly crackTimeEstimator = new PasswordCrackTimeEstimator();

  analyze(password: string): PasswordAnalysisResult {
    const passwordLength = password.length;
    const { charsetSize } = this.characterSetManager.getSizing(password);
    const penalty = this.penaltyManager.getPenalty(password);
    const estimate = this.guessEstimator.estimate(
      passwordLength,
      charsetSize,
      penalty.entropyPenaltyBits
    );
    const score = this.scoreManager.getScore(estimate.entropyBits);
    const scenarios = this.crackTimeEstimator.estimate(estimate.guesses);

    return {
      passwordLength,
      detectedCharsetSize: charsetSize,
      estimatedEntropyBits: estimate.entropyBits,
      estimatedGuesses: estimate.guesses,
      strengthScorePercent: score.scorePercent,
      strengthLabel: score.label,
      scenarios,
      warnings: penalty.warnings,
      suggestions: penalty.suggestions,
    };
  }
}
