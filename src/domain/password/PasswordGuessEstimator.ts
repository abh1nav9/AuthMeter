import { PasswordMath } from "./PasswordMath";

export interface PasswordGuessEstimate {
  readonly guesses: number;
  readonly entropyBits: number;
}

export interface PasswordGuessEstimatorProtocol {
  estimate(
    passwordLength: number,
    charsetSize: number,
    entropyPenaltyBits: number
  ): PasswordGuessEstimate;
}

export class PasswordGuessEstimator implements PasswordGuessEstimatorProtocol {
  private readonly math: PasswordMath;

  constructor(math: PasswordMath) {
    this.math = math;
  }

  estimate(
    passwordLength: number,
    charsetSize: number,
    entropyPenaltyBits: number
  ): PasswordGuessEstimate {
    if (passwordLength <= 0 || charsetSize <= 0)
      return { guesses: 0, entropyBits: 0 };

    // Brute-force upper bound entropy: log2(charset^length) = length * log2(charset)
    // (Attackers often do smarter things; pattern penalties approximate that advantage.)
    const rawEntropy = passwordLength * this.math.log2(charsetSize);

    const effectiveEntropy = Math.max(
      0,
      rawEntropy - Math.max(0, entropyPenaltyBits)
    );
    const effectiveGuesses = this.math.pow(2, effectiveEntropy);

    return {
      guesses: effectiveGuesses,
      entropyBits: effectiveEntropy,
    };
  }
}
