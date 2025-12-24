export class PasswordMath {
  log2(value: number): number {
    if (value <= 0) return 0;
    return Math.log(value) / Math.log(2);
  }

  pow(base: number, exponent: number): number {
    if (exponent < 0) return 0;
    return base ** exponent;
  }

  clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }
}
