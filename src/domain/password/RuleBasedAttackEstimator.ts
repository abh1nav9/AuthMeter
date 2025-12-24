export interface RuleBasedAttackEstimate {
  readonly guesses: number;
  readonly description: string;
  readonly wordlistPosition?: number;
}

export interface RuleBasedAttackEstimatorProtocol {
  estimate(password: string): RuleBasedAttackEstimate;
}

export class RuleBasedAttackEstimator
  implements RuleBasedAttackEstimatorProtocol
{
  private readonly commonWordlistSize = 14_000_000; // rockyou.txt size
  private readonly commonRulesCount = 150; // Typical rule set size
  private readonly aggressiveRulesCount = 500; // Large rule set

  estimate(password: string): RuleBasedAttackEstimate {
    const trimmed = password.trim();
    if (!trimmed) {
      return {
        guesses: this.commonWordlistSize * this.commonRulesCount,
        description: "Standard wordlist + rules",
      };
    }

    const lower = trimmed.toLowerCase();
    const isCommonPassword = this.isLikelyInWordlist(lower);
    const hasCommonPattern = this.hasCommonPattern(trimmed);

    if (isCommonPassword || hasCommonPattern) {
      const estimatedGuesses = this.estimateCommonPassword(trimmed);
      const wordlistPosition = this.getEstimatedWordlistPosition(
        lower,
        estimatedGuesses
      );
      return {
        guesses: estimatedGuesses,
        description: "Common password with rule transformations",
        wordlistPosition,
      };
    }

    const complexity = this.assessComplexity(trimmed);
    if (complexity === "low") {
      return {
        guesses: this.commonWordlistSize * this.commonRulesCount,
        description: "Simple pattern, likely in wordlist",
      };
    }

    if (complexity === "medium") {
      return {
        guesses: this.commonWordlistSize * this.aggressiveRulesCount,
        description: "Moderate complexity, aggressive rules",
      };
    }

    return {
      guesses: this.commonWordlistSize * this.aggressiveRulesCount * 10,
      description: "Complex password, extended rules",
    };
  }

  private isLikelyInWordlist(lower: string): boolean {
    const commonPatterns = [
      "password",
      "qwerty",
      "123456",
      "admin",
      "welcome",
      "letmein",
      "monkey",
      "dragon",
      "master",
      "sunshine",
      "princess",
      "football",
      "baseball",
      "superman",
      "trustno1",
    ];

    return commonPatterns.some((pattern) => lower.includes(pattern));
  }

  private hasCommonPattern(password: string): boolean {
    if (password.length < 6) return true;
    if (/^[a-z]+$/.test(password)) return true;
    if (/^[A-Z]+$/.test(password)) return true;
    if (/^\d+$/.test(password)) return true;
    if (/^[a-z]+\d+$/.test(password)) return true;
    if (/^\d+[a-z]+$/.test(password)) return true;

    return false;
  }

  private estimateCommonPassword(password: string): number {
    const hasNumbers = /\d/.test(password);
    const hasSymbols = /[^a-zA-Z0-9]/.test(password);
    const hasMixedCase = /[a-z]/.test(password) && /[A-Z]/.test(password);

    let ruleMultiplier = 1;

    if (!hasMixedCase) {
      ruleMultiplier *= 2;
    }

    if (hasNumbers) {
      const numberSuffix = password.match(/\d+$/)?.[0];
      if (numberSuffix) {
        const numLength = numberSuffix.length;
        ruleMultiplier *= Math.min(100, Math.pow(10, numLength));
      } else {
        ruleMultiplier *= 100;
      }
    }

    if (hasSymbols) {
      ruleMultiplier *= 20;
    }

    return this.commonWordlistSize * Math.min(ruleMultiplier, 1000);
  }

  private assessComplexity(password: string): "low" | "medium" | "high" {
    const length = password.length;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSymbol = /[^a-zA-Z0-9]/.test(password);

    const charsetCount =
      (hasLower ? 1 : 0) +
      (hasUpper ? 1 : 0) +
      (hasDigit ? 1 : 0) +
      (hasSymbol ? 1 : 0);

    if (length < 8 || charsetCount <= 1) return "low";
    if (length < 12 || charsetCount <= 2) return "medium";
    if (length >= 16 && charsetCount >= 3) return "high";
    return "medium";
  }

  private getEstimatedWordlistPosition(
    lower: string,
    estimatedGuesses: number
  ): number | undefined {
    if (this.isLikelyInWordlist(lower)) {
      return Math.min(estimatedGuesses, 100_000);
    }
    if (this.hasCommonPattern(lower)) {
      return Math.min(estimatedGuesses, 1_000_000);
    }
    return undefined;
  }
}
