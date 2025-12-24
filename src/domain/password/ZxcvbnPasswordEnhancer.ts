import type {
  PasswordAnalysisResult,
  PasswordInsight,
  PasswordInsightKind,
} from "./PasswordAnalysisTypes";

export interface ZxcvbnPasswordEnhancerProtocol {
  enhance(
    password: string,
    base: PasswordAnalysisResult,
    signal?: AbortSignal
  ): Promise<PasswordAnalysisResult>;
}

type ZxcvbnResult = {
  guesses?: number;
  score?: number;
  sequence?: Array<{ pattern?: string; token?: string }>;
  feedback?: { warning?: string; suggestions?: string[] };
};

export class ZxcvbnPasswordEnhancer implements ZxcvbnPasswordEnhancerProtocol {
  private loader: Promise<(password: string) => ZxcvbnResult> | null = null;

  async enhance(
    password: string,
    base: PasswordAnalysisResult,
    signal?: AbortSignal
  ): Promise<PasswordAnalysisResult> {
    const trimmed = password.trim();
    if (!trimmed) return base;
    if (signal?.aborted) return base;

    const run = await this.getRunner();
    if (signal?.aborted) return base;

    const res = run(trimmed);
    const guesses = Math.max(0, res.guesses ?? 0);
    const entropyBits = guesses > 0 ? Math.log2(guesses) : 0;

    const zWarning = res.feedback?.warning?.trim();
    const zWarnings = zWarning ? [zWarning] : [];
    const zSuggestions = (res.feedback?.suggestions ?? []).filter(Boolean);
    const insights = buildInsights(res);

    return {
      ...base,
      estimatedGuesses: guesses,
      estimatedEntropyBits: entropyBits,
      warnings: uniqueStrings([...base.warnings, ...zWarnings]),
      suggestions: uniqueStrings([...base.suggestions, ...zSuggestions]),
      insights: uniqueInsights([...(base.insights ?? []), ...insights]),
    };
  }

  private async getRunner(): Promise<(password: string) => ZxcvbnResult> {
    if (!this.loader) {
      this.loader = (async () => {
        const core = await import("@zxcvbn-ts/core");
        const lang = await import("@zxcvbn-ts/language-common");

        core.zxcvbnOptions.setOptions({
          dictionary: lang.dictionary,
          graphs: lang.adjacencyGraphs,
        });

        return (password: string) => core.zxcvbn(password) as ZxcvbnResult;
      })();
    }
    return this.loader;
  }
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)));
}

function buildInsights(res: ZxcvbnResult): PasswordInsight[] {
  const sequence = res.sequence ?? [];
  return sequence.slice(0, 6).map((m) => {
    const kind = mapPatternToKind(m.pattern);
    const token = m.token?.trim();
    return {
      kind,
      label: token
        ? `${m.pattern ?? "match"}: "${token}"`
        : `${m.pattern ?? "match"}`,
      detail: "Detected by zxcvbn matchers.",
    };
  });
}

function mapPatternToKind(pattern?: string): PasswordInsightKind {
  switch (pattern) {
    case "dictionary":
      return "dictionary";
    case "spatial":
      return "keyboard";
    case "sequence":
      return "sequence";
    case "repeat":
      return "repeat";
    case "date":
      return "date";
    case "regex":
      return "regex";
    default:
      return "other";
  }
}

function uniqueInsights(values: PasswordInsight[]): PasswordInsight[] {
  const key = (i: PasswordInsight) => `${i.kind}:${i.label}:${i.detail ?? ""}`;
  const seen = new Set<string>();
  const out: PasswordInsight[] = [];
  for (const v of values) {
    const k = key(v);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(v);
  }
  return out;
}
