import { HibpPwnedPasswordsApiClient } from "./HibpPwnedPasswordsApiClient";
import { Sha1Hasher } from "./Sha1Hasher";

export interface PwnedPasswordCheckResult {
  readonly breachCount: number;
}

export interface PwnedPasswordCheckerManagerProtocol {
  check(
    password: string,
    signal?: AbortSignal
  ): Promise<PwnedPasswordCheckResult>;
}

export class PwnedPasswordCheckerManager
  implements PwnedPasswordCheckerManagerProtocol
{
  private readonly hasher: Sha1Hasher;
  private readonly client: HibpPwnedPasswordsApiClient;
  private readonly rangeCache = new Map<string, Map<string, number>>();

  constructor(params?: {
    hasher?: Sha1Hasher;
    client?: HibpPwnedPasswordsApiClient;
  }) {
    this.hasher = params?.hasher ?? new Sha1Hasher();
    this.client = params?.client ?? new HibpPwnedPasswordsApiClient();
  }

  async check(
    password: string,
    signal?: AbortSignal
  ): Promise<PwnedPasswordCheckResult> {
    if (!password) return { breachCount: 0 };

    const sha1 = await this.hasher.sha1HexUpper(password);
    const prefix5 = sha1.slice(0, 5);
    const suffix = sha1.slice(5);

    const suffixMap = await this.getSuffixMap(prefix5, signal);
    return { breachCount: suffixMap.get(suffix) ?? 0 };
  }

  private async getSuffixMap(
    prefix5: string,
    signal?: AbortSignal
  ): Promise<Map<string, number>> {
    const cached = this.rangeCache.get(prefix5);
    if (cached) return cached;

    const raw = await this.client.fetchRange(prefix5, signal);
    const parsed = this.parseRangeResponse(raw);
    this.rangeCache.set(prefix5, parsed);
    return parsed;
  }

  private parseRangeResponse(raw: string): Map<string, number> {
    const map = new Map<string, number>();
    const lines = raw.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const [suffix, countStr] = trimmed.split(":");
      if (!suffix || !countStr) continue;
      const count = Number.parseInt(countStr, 10);
      if (!Number.isFinite(count)) continue;
      map.set(suffix.trim().toUpperCase(), count);
    }
    return map;
  }
}
