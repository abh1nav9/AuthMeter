export interface PasswordCharacterSetSizing {
  readonly charsetSize: number;
  readonly reasons: string[];
}

export interface PasswordCharacterSetSizingManager {
  getSizing(password: string): PasswordCharacterSetSizing;
}

export class PasswordCharacterSetManager
  implements PasswordCharacterSetSizingManager
{
  getSizing(password: string): PasswordCharacterSetSizing {
    const reasons: string[] = [];

    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasWhitespace = /\s/.test(password);
    const hasAsciiSymbol = /[^a-zA-Z0-9\s]/.test(password);

    let charsetSize = 0;
    if (hasLower) {
      charsetSize += 26;
      reasons.push("lowercase");
    }
    if (hasUpper) {
      charsetSize += 26;
      reasons.push("uppercase");
    }
    if (hasDigit) {
      charsetSize += 10;
      reasons.push("digits");
    }
    if (hasAsciiSymbol) {
      charsetSize += 33;
      reasons.push("symbols");
    }
    if (hasWhitespace) {
      charsetSize += 1;
      reasons.push("whitespace");
    }

    if (charsetSize === 0) return { charsetSize: 0, reasons };
    return { charsetSize, reasons };
  }
}
