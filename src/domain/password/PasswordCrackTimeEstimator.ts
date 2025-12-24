import type {
  AttackScenarioId,
  AttackScenarioResult,
} from "./PasswordAnalysisTypes";

export interface CrackScenarioConfig {
  readonly id: AttackScenarioId;
  readonly name: string;
  readonly guessesPerSecond: number;
}

export interface PasswordCrackTimeEstimatorProtocol {
  estimate(guesses: number): AttackScenarioResult[];
}

export class PasswordCrackTimeEstimator
  implements PasswordCrackTimeEstimatorProtocol
{
  private readonly scenarios: CrackScenarioConfig[] = [
    {
      id: "online_throttled",
      name: "Online (rate-limited)",
      guessesPerSecond: 0.1, // ~6 guesses/min
    },
    {
      id: "online_unthrottled",
      name: "Online (no rate limit)",
      guessesPerSecond: 10,
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

  estimate(guesses: number): AttackScenarioResult[] {
    const safeGuesses = Number.isFinite(guesses) ? Math.max(0, guesses) : 0;
    return this.scenarios.map((scenario) => {
      if (scenario.guessesPerSecond <= 0) {
        return {
          id: scenario.id,
          name: scenario.name,
          guessesPerSecond: scenario.guessesPerSecond,
          expectedTimeSeconds: Number.POSITIVE_INFINITY,
          worstCaseTimeSeconds: Number.POSITIVE_INFINITY,
        };
      }

      // Expected (average) tries to success is ~N/2 for uniform random guesses.
      const expectedTimeSeconds = safeGuesses / (2 * scenario.guessesPerSecond);
      const worstCaseTimeSeconds = safeGuesses / scenario.guessesPerSecond;

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
