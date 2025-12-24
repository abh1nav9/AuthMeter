import type {
  AttackScenarioId,
  AttackScenarioResult,
} from "./PasswordAnalysisTypes";
import { RuleBasedAttackEstimator } from "./RuleBasedAttackEstimator";
import { WordlistAttackEstimator } from "./WordlistAttackEstimator";

export interface CrackScenarioConfig {
  readonly id: AttackScenarioId;
  readonly name: string;
  readonly guessesPerSecond: number;
  readonly useSmartEstimate?: boolean;
}

export interface PasswordCrackTimeEstimatorProtocol {
  estimate(guesses: number, password?: string): AttackScenarioResult[];
}

export class PasswordCrackTimeEstimator
  implements PasswordCrackTimeEstimatorProtocol
{
  private readonly ruleBasedEstimator: RuleBasedAttackEstimator;
  private readonly wordlistEstimator: WordlistAttackEstimator;
  private readonly scenarios: CrackScenarioConfig[] = [
    {
      id: "online_throttled",
      name: "Online (rate-limited)",
      guessesPerSecond: 0.1,
    },
    {
      id: "online_unthrottled",
      name: "Online (no rate limit)",
      guessesPerSecond: 10,
    },
    {
      id: "wordlist_basic",
      name: "Wordlist attack (rockyou.txt)",
      guessesPerSecond: 50_000_000,
      useSmartEstimate: true,
    },
    {
      id: "wordlist_rules",
      name: "Wordlist + rules (GPU)",
      guessesPerSecond: 500_000_000,
      useSmartEstimate: true,
    },
    {
      id: "gpu_rules_fast_hash",
      name: "Rule-based GPU (fast hash: MD5/SHA1)",
      guessesPerSecond: 15_000_000_000,
      useSmartEstimate: true,
    },
    {
      id: "gpu_rules_slow_hash",
      name: "Rule-based GPU (slow hash: bcrypt/argon2)",
      guessesPerSecond: 1_000,
      useSmartEstimate: true,
    },
    {
      id: "offline_argon2id",
      name: "Offline (argon2id, strong settings)",
      guessesPerSecond: 50,
    },
    {
      id: "offline_scrypt",
      name: "Offline (scrypt, strong settings)",
      guessesPerSecond: 200,
    },
    {
      id: "offline_pbkdf2",
      name: "Offline (PBKDF2, moderate settings)",
      guessesPerSecond: 200_000,
    },
    {
      id: "offline_slow_hash",
      name: "Offline (slow hash, e.g., bcrypt)",
      guessesPerSecond: 2_000,
    },
    {
      id: "offline_fast_hash",
      name: "Offline (fast hash, GPU / fast hashes)",
      guessesPerSecond: 10_000_000_000,
    },
  ];

  constructor(
    ruleBasedEstimator?: RuleBasedAttackEstimator,
    wordlistEstimator?: WordlistAttackEstimator
  ) {
    this.ruleBasedEstimator =
      ruleBasedEstimator ?? new RuleBasedAttackEstimator();
    this.wordlistEstimator =
      wordlistEstimator ?? new WordlistAttackEstimator(this.ruleBasedEstimator);
  }

  estimate(guesses: number, password?: string): AttackScenarioResult[] {
    const safeGuesses = Number.isFinite(guesses) ? Math.max(0, guesses) : 0;
    const trimmedPassword = password?.trim() ?? "";

    return this.scenarios.map((scenario) => {
      let effectiveGuesses = safeGuesses;

      if (scenario.useSmartEstimate && trimmedPassword) {
        if (
          scenario.id === "wordlist_basic" ||
          scenario.id === "wordlist_rules"
        ) {
          const wordlistEstimate =
            this.wordlistEstimator.estimate(trimmedPassword);
          effectiveGuesses = wordlistEstimate.guesses;
        } else if (
          scenario.id === "gpu_rules_fast_hash" ||
          scenario.id === "gpu_rules_slow_hash"
        ) {
          const ruleEstimate =
            this.ruleBasedEstimator.estimate(trimmedPassword);
          effectiveGuesses = ruleEstimate.guesses;
        }
      }

      if (scenario.guessesPerSecond <= 0) {
        return {
          id: scenario.id,
          name: scenario.name,
          guessesPerSecond: scenario.guessesPerSecond,
          expectedTimeSeconds: Number.POSITIVE_INFINITY,
          worstCaseTimeSeconds: Number.POSITIVE_INFINITY,
        };
      }

      let expectedTimeSeconds: number;
      let worstCaseTimeSeconds: number;

      if (scenario.useSmartEstimate && trimmedPassword) {
        let wordlistPosition: number | undefined;

        if (
          scenario.id === "wordlist_basic" ||
          scenario.id === "wordlist_rules"
        ) {
          const wordlistEstimate =
            this.wordlistEstimator.estimate(trimmedPassword);
          wordlistPosition = wordlistEstimate.wordlistPosition;
        } else if (
          scenario.id === "gpu_rules_fast_hash" ||
          scenario.id === "gpu_rules_slow_hash"
        ) {
          const ruleEstimate =
            this.ruleBasedEstimator.estimate(trimmedPassword);
          wordlistPosition = ruleEstimate.wordlistPosition;
        }

        if (wordlistPosition && wordlistPosition < effectiveGuesses) {
          expectedTimeSeconds = wordlistPosition / scenario.guessesPerSecond;
          worstCaseTimeSeconds = wordlistPosition / scenario.guessesPerSecond;
        } else {
          expectedTimeSeconds =
            effectiveGuesses / (2 * scenario.guessesPerSecond);
          worstCaseTimeSeconds = effectiveGuesses / scenario.guessesPerSecond;
        }
      } else {
        expectedTimeSeconds =
          effectiveGuesses / (2 * scenario.guessesPerSecond);
        worstCaseTimeSeconds = effectiveGuesses / scenario.guessesPerSecond;
      }

      return {
        id: scenario.id,
        name: scenario.name,
        guessesPerSecond: scenario.guessesPerSecond,
        expectedTimeSeconds,
        worstCaseTimeSeconds,
      };
    });
  }
}
