export interface PasswordPenaltyResult {
  readonly entropyPenaltyBits: number;
  readonly warnings: string[];
  readonly suggestions: string[];
}

export interface PasswordPatternPenaltyManagerProtocol {
  getPenalty(password: string): PasswordPenaltyResult;
}

export class PasswordPatternPenaltyManager
  implements PasswordPatternPenaltyManagerProtocol
{
  private readonly commonPasswords = new Set<string>([
    "password",
    "password1",
    "qwerty",
    "qwerty123",
    "123456",
    "123456789",
    "12345678",
    "111111",
    "letmein",
    "admin",
    "welcome",
    "iloveyou",
  ]);

  getPenalty(password: string): PasswordPenaltyResult {
    const warnings: string[] = [];
    const suggestions: string[] = [];
    let penaltyBits = 0;

    const normalized = password.trim();
    const lower = normalized.toLowerCase();

    if (normalized.length === 0) {
      return { entropyPenaltyBits: 0, warnings: [], suggestions: [] };
    }

    if (this.commonPasswords.has(lower)) {
      warnings.push("This password is extremely common.");
      penaltyBits += 30;
    }

    if (this.isOnlyOneCharacterRepeated(normalized)) {
      warnings.push("Repeated single character pattern detected.");
      suggestions.push("Avoid repeating the same character.");
      penaltyBits += 20;
    }

    if (this.hasLongRepeatRun(normalized)) {
      warnings.push("Repeated character runs reduce strength.");
      suggestions.push("Use more variety instead of long repeats.");
      penaltyBits += 6;
    }

    if (this.hasSequence(lower)) {
      warnings.push("Sequence pattern detected (e.g., abc, 123).");
      suggestions.push("Avoid obvious sequences.");
      penaltyBits += 10;
    }

    if (this.looksLikeYear(normalized)) {
      warnings.push("Year-like pattern detected.");
      suggestions.push("Avoid using years or dates.");
      penaltyBits += 6;
    }

    if (this.containsCommonKeyboardWalk(lower)) {
      warnings.push("Keyboard pattern detected (e.g., qwerty).");
      suggestions.push("Avoid keyboard walks.");
      penaltyBits += 10;
    }

    if (normalized.length < 12) {
      suggestions.push("Aim for 12–16+ characters (length matters most).");
    }

    if (!/[A-Z]/.test(normalized) || !/[a-z]/.test(normalized)) {
      suggestions.push("Mix uppercase and lowercase letters.");
    }
    if (!/\d/.test(normalized)) {
      suggestions.push("Add digits.");
    }
    if (!/[^a-zA-Z0-9\s]/.test(normalized)) {
      suggestions.push("Add symbols (e.g., !@#$).");
    }

    return {
      entropyPenaltyBits: Math.max(0, penaltyBits),
      warnings,
      suggestions,
    };
  }

  private isOnlyOneCharacterRepeated(password: string): boolean {
    if (password.length < 2) return false;
    return new Set(password.split("")).size === 1;
  }

  private hasLongRepeatRun(password: string): boolean {
    return /(.)\1{2,}/.test(password);
  }

  private hasSequence(lower: string): boolean {
    const sequences = ["abcdefghijklmnopqrstuvwxyz", "0123456789"];
    for (const seq of sequences) {
      if (this.containsAnyWindow(lower, seq, 4)) return true;
      const reversed = seq.split("").reverse().join("");
      if (this.containsAnyWindow(lower, reversed, 4)) return true;
    }
    return false;
  }

  private containsAnyWindow(
    haystack: string,
    sequence: string,
    minLen: number
  ): boolean {
    for (let i = 0; i <= sequence.length - minLen; i += 1) {
      const window = sequence.slice(i, i + minLen);
      if (haystack.includes(window)) return true;
    }
    return false;
  }

  private looksLikeYear(password: string): boolean {
    const match = password.match(/\b(19\d{2}|20\d{2})\b/);
    return Boolean(match);
  }

  private containsCommonKeyboardWalk(lower: string): boolean {
    const patterns = ["qwerty", "asdf", "zxcv", "12345", "password"];
    return patterns.some((p) => lower.includes(p));
  }
}
