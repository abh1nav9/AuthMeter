import { PasswordCharacterSetManager } from "./PasswordCharacterSetManager";
import type { PasswordAnalysisResult } from "./PasswordAnalysisTypes";
import { PasswordCrackTimeEstimator } from "./PasswordCrackTimeEstimator";
import { PasswordGuessEstimator } from "./PasswordGuessEstimator";
import { PasswordMath } from "./PasswordMath";
import { PasswordPatternPenaltyManager } from "./PasswordPatternPenaltyManager";
import { PasswordStrengthScoreManager } from "./PasswordStrengthScoreManager";
import type { PasswordContext } from "./PasswordContext";
import { PasswordContextPenaltyManager } from "./PasswordContextPenaltyManager";
import { PasswordPolicyManager } from "./PasswordPolicyManager";

export interface PasswordAnalysisManagerProtocol {
  analyze(password: string, context?: PasswordContext): PasswordAnalysisResult;
}

export class PasswordAnalysisManager
  implements PasswordAnalysisManagerProtocol
{
  private readonly math = new PasswordMath();
  private readonly characterSetManager = new PasswordCharacterSetManager();
  private readonly penaltyManager = new PasswordPatternPenaltyManager();
  private readonly contextPenaltyManager = new PasswordContextPenaltyManager();
  private readonly policyManager = new PasswordPolicyManager();
  private readonly entropyGuessEstimator = new PasswordGuessEstimator(
    this.math
  );
  private readonly scoreManager = new PasswordStrengthScoreManager(this.math);
  private readonly crackTimeEstimator = new PasswordCrackTimeEstimator();

  analyze(password: string, context?: PasswordContext): PasswordAnalysisResult {
    const passwordLength = password.length;
    const { charsetSize } = this.characterSetManager.getSizing(password);
    const penalty = this.penaltyManager.getPenalty(password);
    const contextPenalty = this.contextPenaltyManager.evaluate(
      password,
      context
    );
    const estimate = this.entropyGuessEstimator.estimateFromPassword(
      password,
      passwordLength,
      charsetSize,
      penalty.entropyPenaltyBits
    );
    const score = this.scoreManager.getScore(estimate.entropyBits);
    const scenarios = this.crackTimeEstimator.estimate(estimate.guesses);
    const policyFindings = this.policyManager.evaluate(password, context);

    const warnings = uniqueStrings([
      ...penalty.warnings,
      ...contextPenalty.warnings,
    ]);
    const suggestions = uniqueStrings([
      ...penalty.suggestions,
      ...contextPenalty.suggestions,
    ]);

    return {
      passwordLength,
      detectedCharsetSize: charsetSize,
      estimatedEntropyBits: estimate.entropyBits,
      estimatedGuesses: estimate.guesses,
      strengthScorePercent: score.scorePercent,
      strengthLabel: score.label,
      scenarios,
      warnings,
      suggestions,
      policyFindings,
    };
  }
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)));
}
