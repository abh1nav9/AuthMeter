import { zxcvbn, zxcvbnOptions } from "@zxcvbn-ts/core";
import { adjacencyGraphs, dictionary } from "@zxcvbn-ts/language-common";
import type {
  PasswordGuessEstimate,
  PasswordGuessEstimatorProtocol,
} from "./PasswordGuessEstimator";

export interface ZxcvbnGuessEstimatorProtocol
  extends PasswordGuessEstimatorProtocol {
  getFeedback(password: string): { warnings: string[]; suggestions: string[] };
}

export class ZxcvbnGuessEstimator implements ZxcvbnGuessEstimatorProtocol {
  private readonly isConfigured: boolean;

  constructor() {
    // Configure once per instance; lightweight and avoids global side effects elsewhere.
    zxcvbnOptions.setOptions({
      dictionary,
      graphs: adjacencyGraphs,
    });
    this.isConfigured = true;
  }

  estimate(
    passwordLength: number,
    charsetSize: number,
    entropyPenaltyBits: number
  ): PasswordGuessEstimate {
    // Fallback path if caller doesn't provide password.
    void passwordLength;
    void charsetSize;
    void entropyPenaltyBits;
    return { guesses: 0, entropyBits: 0 };
  }

  estimateFromPassword(
    password: string,
    passwordLength: number,
    charsetSize: number,
    entropyPenaltyBits: number
  ): PasswordGuessEstimate {
    void passwordLength;
    void charsetSize;
    void entropyPenaltyBits;
    if (!this.isConfigured) return { guesses: 0, entropyBits: 0 };
    if (!password) return { guesses: 0, entropyBits: 0 };

    const res = zxcvbn(password);
    const guesses = Math.max(0, res.guesses ?? 0);
    const entropyBits = guesses > 0 ? Math.log2(guesses) : 0;
    return { guesses, entropyBits };
  }

  getFeedback(password: string): { warnings: string[]; suggestions: string[] } {
    if (!password) return { warnings: [], suggestions: [] };
    const res = zxcvbn(password);
    const warning = res.feedback?.warning?.trim();
    const suggestions = res.feedback?.suggestions ?? [];
    return {
      warnings: warning ? [warning] : [],
      suggestions: suggestions.filter(Boolean),
    };
  }
}
