import { RuleBasedAttackEstimator } from "./RuleBasedAttackEstimator";

export interface WordlistAttackEstimate {
  readonly guesses: number;
  readonly description: string;
  readonly wordlistPosition?: number;
}

export interface WordlistAttackEstimatorProtocol {
  estimate(password: string): WordlistAttackEstimate;
}

export class WordlistAttackEstimator
  implements WordlistAttackEstimatorProtocol
{
  private readonly ruleBasedEstimator: RuleBasedAttackEstimator;

  constructor(ruleBasedEstimator?: RuleBasedAttackEstimator) {
    this.ruleBasedEstimator =
      ruleBasedEstimator ?? new RuleBasedAttackEstimator();
  }

  estimate(password: string): WordlistAttackEstimate {
    const trimmed = password.trim();
    if (!trimmed) {
      return {
        guesses: 14_000_000,
        description: "Standard wordlist (rockyou.txt)",
      };
    }

    const lower = trimmed.toLowerCase();
    const isInTopWordlist = this.isInTopWordlist(lower);
    const isInExtendedWordlist = this.isInExtendedWordlist(lower);

    if (isInTopWordlist) {
      const position = this.getTopWordlistPosition(lower);
      return {
        guesses: position,
        description: `Top ${position.toLocaleString()} common passwords`,
        wordlistPosition: position,
      };
    }

    if (isInExtendedWordlist) {
      return {
        guesses: 500_000,
        description: "Extended wordlist (top 500K)",
        wordlistPosition: 500_000,
      };
    }

    const ruleBased = this.ruleBasedEstimator.estimate(password);
    return {
      guesses: Math.min(ruleBased.guesses, 14_000_000 * 500),
      description: ruleBased.description,
    };
  }

  private isInTopWordlist(lower: string): boolean {
    const topPasswords = [
      "password",
      "123456",
      "123456789",
      "12345678",
      "12345",
      "1234567",
      "password1",
      "qwerty",
      "abc123",
      "111111",
      "123123",
      "admin",
      "letmein",
      "welcome",
      "monkey",
      "1234567890",
      "dragon",
      "sunshine",
      "princess",
      "football",
      "iloveyou",
      "master",
      "hello",
      "freedom",
      "whatever",
      "qazwsx",
      "trustno1",
      "654321",
      "jordan23",
      "harley",
      "password123",
      "shadow",
      "superman",
      "qwerty123",
      "michael",
      "mustang",
      "1234",
      "jennifer",
      "joshua",
      "hunter",
    ];

    return topPasswords.includes(lower);
  }

  private getTopWordlistPosition(lower: string): number {
    const topPasswords = [
      "password",
      "123456",
      "123456789",
      "12345678",
      "12345",
      "1234567",
      "password1",
      "qwerty",
      "abc123",
      "111111",
      "123123",
      "admin",
      "letmein",
      "welcome",
      "monkey",
      "1234567890",
      "dragon",
      "sunshine",
      "princess",
      "football",
      "iloveyou",
      "master",
      "hello",
      "freedom",
      "whatever",
      "qazwsx",
      "trustno1",
      "654321",
      "jordan23",
      "harley",
      "password123",
      "shadow",
      "superman",
      "qwerty123",
      "michael",
      "mustang",
      "1234",
      "jennifer",
      "joshua",
      "hunter",
      "batman",
      "thomas",
      "hockey",
      "ranger",
      "daniel",
      "hannah",
      "maggie",
      "jessica",
      "charlie",
      "samantha",
      "summer",
      "winter",
      "spring",
      "autumn",
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];

    const index = topPasswords.indexOf(lower);
    if (index === -1) return 10_000;
    return index + 1;
  }

  private isInExtendedWordlist(lower: string): boolean {
    if (lower.length < 6) return true;
    if (lower.length > 20) return false;

    const commonPatterns = [
      /^[a-z]+\d+$/,
      /^\d+[a-z]+$/,
      /^[a-z]+\d+[a-z]+$/,
      /^[a-z]{3,}\d{1,4}$/,
      /^\d{1,4}[a-z]{3,}$/,
    ];

    return commonPatterns.some((pattern) => pattern.test(lower));
  }
}
