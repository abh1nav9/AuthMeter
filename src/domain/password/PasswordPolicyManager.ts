import type { PasswordPolicyFinding } from "./PasswordAnalysisTypes";
import type { PasswordContext } from "./PasswordContext";

export interface PasswordPolicyManagerProtocol {
  evaluate(
    password: string,
    context?: PasswordContext
  ): PasswordPolicyFinding[];
}

export class PasswordPolicyManager implements PasswordPolicyManagerProtocol {
  evaluate(
    password: string,
    context?: PasswordContext
  ): PasswordPolicyFinding[] {
    const trimmed = password.trim();
    if (!trimmed) return [];

    const findings: PasswordPolicyFinding[] = [];

    findings.push(this.lengthFinding(trimmed));
    findings.push(this.varietyFinding(trimmed));

    const contextFinding = this.contextFinding(trimmed, context);
    if (contextFinding) findings.push(contextFinding);

    return findings;
  }

  private lengthFinding(password: string): PasswordPolicyFinding {
    const minLen = 12;
    const idealLen = 16;
    if (password.length < minLen) {
      return {
        id: "length",
        label: "Length",
        status: "fail",
        detail: `Use at least ${minLen} characters (ideal ${idealLen}+).`,
      };
    }
    if (password.length < idealLen) {
      return {
        id: "length",
        label: "Length",
        status: "warn",
        detail: `Good start. ${idealLen}+ characters is stronger.`,
      };
    }
    return {
      id: "length",
      label: "Length",
      status: "pass",
      detail: "Length looks good.",
    };
  }

  private varietyFinding(password: string): PasswordPolicyFinding {
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSymbol = /[^a-zA-Z0-9\s]/.test(password);
    const count = [hasLower, hasUpper, hasDigit, hasSymbol].filter(
      Boolean
    ).length;

    if (count <= 1) {
      return {
        id: "variety",
        label: "Character variety",
        status: "fail",
        detail: "Add a mix of letters, numbers, and symbols.",
      };
    }
    if (count === 2) {
      return {
        id: "variety",
        label: "Character variety",
        status: "warn",
        detail: "Add one more character type to increase strength.",
      };
    }
    return {
      id: "variety",
      label: "Character variety",
      status: "pass",
      detail: "Variety looks good.",
    };
  }

  private contextFinding(
    password: string,
    context?: PasswordContext
  ): PasswordPolicyFinding | null {
    const terms = this.extractTerms(context);
    if (terms.length === 0) return null;
    const lower = password.toLowerCase();
    const matched = terms.find((t) => t.length >= 3 && lower.includes(t));
    if (!matched)
      return {
        id: "context",
        label: "Personal info",
        status: "pass",
        detail: "No obvious context terms.",
      };
    return {
      id: "context",
      label: "Personal info",
      status: "fail",
      detail: "Password contains username/email/site terms.",
    };
  }

  private extractTerms(context?: PasswordContext): string[] {
    const out: string[] = [];
    const username = context?.username?.trim();
    const email = context?.email?.trim();
    const site = context?.site?.trim();

    if (username) out.push(username.toLowerCase());
    if (site) out.push(site.toLowerCase());
    if (email) {
      const lower = email.toLowerCase();
      out.push(lower);
      const localPart = lower.split("@")[0];
      const domain = lower.split("@")[1];
      if (localPart) out.push(localPart);
      if (domain)
        out.push(domain.replace(/\.(com|net|org|io|dev|app|co)$/i, ""));
    }

    return Array.from(
      new Set(out.map((s) => s.replace(/\s+/g, "").trim()).filter(Boolean))
    );
  }
}
