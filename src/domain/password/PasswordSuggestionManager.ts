import { PassphraseGenerator } from "./PassphraseGenerator";
import { PasswordCharacterSetManager } from "./PasswordCharacterSetManager";
import { PasswordRandomTokenGenerator } from "./PasswordRandomTokenGenerator";

export interface PasswordSuggestionManagerProtocol {
  suggest(password: string, count: number): string[];
}

export class PasswordSuggestionManager
  implements PasswordSuggestionManagerProtocol
{
  private readonly passphraseGenerator: PassphraseGenerator;
  private readonly charsetManager: PasswordCharacterSetManager;
  private readonly tokenGenerator: PasswordRandomTokenGenerator;

  constructor(params?: {
    passphraseGenerator?: PassphraseGenerator;
    charsetManager?: PasswordCharacterSetManager;
    tokenGenerator?: PasswordRandomTokenGenerator;
  }) {
    this.passphraseGenerator =
      params?.passphraseGenerator ?? new PassphraseGenerator();
    this.charsetManager =
      params?.charsetManager ?? new PasswordCharacterSetManager();
    this.tokenGenerator =
      params?.tokenGenerator ?? new PasswordRandomTokenGenerator();
  }

  suggest(password: string, count: number): string[] {
    const trimmed = password.trim();
    const safeCount = Math.max(0, Math.min(5, Math.floor(count)));
    if (safeCount === 0) return [];

    if (trimmed.length === 0) {
      return this.passphraseGenerator.generate(safeCount);
    }

    const candidates: string[] = [];

    // 1) A stronger "upgrade" that keeps the base but adds length + variety.
    candidates.push(this.upgradeKeepingBase(trimmed));

    // 2) A variant that changes casing and ensures missing character classes.
    candidates.push(this.upgradeWithRequirements(trimmed));

    // 3) A passphrase-style alternative (does NOT include the original password verbatim).
    candidates.push(...this.passphraseGenerator.generate(3));

    const unique = this.uniqueNonEmpty(candidates);
    const filtered = unique.filter((s) => s !== trimmed);

    return filtered.slice(0, safeCount);
  }

  private upgradeKeepingBase(base: string): string {
    const suffix = `${this.tokenGenerator.symbol()}${this.tokenGenerator.digits(
      2
    )}`;
    const extra = this.passphraseGenerator.generate(1)[0];
    return `${base}-${extra}-${suffix}`;
  }

  private upgradeWithRequirements(base: string): string {
    const hasLower = /[a-z]/.test(base);
    const hasUpper = /[A-Z]/.test(base);
    const hasDigit = /\d/.test(base);
    const hasSymbol = /[^a-zA-Z0-9\s]/.test(base);

    let out = this.capitalizeFirstLetter(base);
    if (!hasLower) out += this.tokenGenerator.letters(2);
    if (!hasUpper) out += this.tokenGenerator.letters(2).toUpperCase();
    if (!hasDigit) out += this.tokenGenerator.digits(2);
    if (!hasSymbol) out += this.tokenGenerator.symbol();

    // Ensure a minimum length that is reasonable for modern guidance.
    const minLen = 16;
    if (out.length < minLen) {
      out += this.tokenGenerator.letters(minLen - out.length);
    }

    // If the base already had a small charset, nudge with a symbol + digits to increase variety.
    const sizing = this.charsetManager.getSizing(base);
    if (sizing.charsetSize > 0 && sizing.charsetSize < 40) {
      out += `${this.tokenGenerator.symbol()}${this.tokenGenerator.digits(2)}`;
    }

    return out;
  }

  private capitalizeFirstLetter(value: string): string {
    if (value.length === 0) return value;
    return value[0].toUpperCase() + value.slice(1);
  }

  private uniqueNonEmpty(values: string[]): string[] {
    const set = new Set<string>();
    for (const v of values) {
      const t = v.trim();
      if (!t) continue;
      set.add(t);
    }
    return Array.from(set);
  }
}
