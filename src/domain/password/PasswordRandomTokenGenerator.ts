export interface PasswordRandomTokenGeneratorProtocol {
  digits(count: number): string;
  symbol(): string;
  letters(count: number): string;
}

export class PasswordRandomTokenGenerator
  implements PasswordRandomTokenGeneratorProtocol
{
  private readonly symbols = "!@#$%^&*?_+-=";
  private readonly lettersAlpha = "abcdefghijklmnopqrstuvwxyz";

  digits(count: number): string {
    return this.token(count, "0123456789");
  }

  symbol(): string {
    return this.token(1, this.symbols);
  }

  letters(count: number): string {
    return this.token(count, this.lettersAlpha);
  }

  private token(count: number, alphabet: string): string {
    const safeCount = Math.max(0, Math.min(64, Math.floor(count)));
    if (safeCount === 0) return "";
    if (!alphabet.length) return "";

    const bytes = new Uint32Array(safeCount);
    crypto.getRandomValues(bytes);

    let out = "";
    for (let i = 0; i < safeCount; i += 1) {
      out += alphabet[bytes[i] % alphabet.length];
    }
    return out;
  }
}
