export type PasswordStrengthLabel =
  | "Very weak"
  | "Weak"
  | "Okay"
  | "Strong"
  | "Very strong";

export type AttackScenarioId =
  | "online_throttled"
  | "online_unthrottled"
  | "offline_argon2id"
  | "offline_scrypt"
  | "offline_pbkdf2"
  | "offline_slow_hash"
  | "offline_fast_hash"
  | "wordlist_basic"
  | "wordlist_rules"
  | "gpu_rules_fast_hash"
  | "gpu_rules_slow_hash";

export interface AttackScenarioResult {
  id: AttackScenarioId;
  name: string;
  guessesPerSecond: number;
  expectedTimeSeconds: number;
  worstCaseTimeSeconds: number;
}

export interface PasswordAnalysisResult {
  passwordLength: number;
  detectedCharsetSize: number;
  estimatedEntropyBits: number;
  estimatedGuesses: number;
  strengthScorePercent: number;
  strengthLabel: PasswordStrengthLabel;
  scenarios: AttackScenarioResult[];
  warnings: string[];
  suggestions: string[];
  insights?: PasswordInsight[];
  policyFindings?: PasswordPolicyFinding[];
}

export type PasswordInsightKind =
  | "dictionary"
  | "keyboard"
  | "sequence"
  | "repeat"
  | "date"
  | "regex"
  | "other";

export interface PasswordInsight {
  kind: PasswordInsightKind;
  label: string;
  detail?: string;
}

export type PasswordPolicyFindingStatus = "pass" | "warn" | "fail";

export interface PasswordPolicyFinding {
  id: string;
  label: string;
  status: PasswordPolicyFindingStatus;
  detail?: string;
}
