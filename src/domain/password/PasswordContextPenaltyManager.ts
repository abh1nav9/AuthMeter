import type { PasswordContext } from "./PasswordContext";

export interface PasswordContextPenaltyResult {
  readonly warnings: string[];
  readonly suggestions: string[];
}

export interface PasswordContextPenaltyManagerProtocol {
  evaluate(
    password: string,
    context?: PasswordContext
  ): PasswordContextPenaltyResult;
}

export class PasswordContextPenaltyManager
  implements PasswordContextPenaltyManagerProtocol
{
  evaluate(
    password: string,
    context?: PasswordContext
  ): PasswordContextPenaltyResult {
    const trimmed = password.trim();
    if (!trimmed) return { warnings: [], suggestions: [] };

    const terms = this.extractTerms(context);
    if (terms.length === 0) return { warnings: [], suggestions: [] };

    const lowerPassword = trimmed.toLowerCase();
    const matched = terms.filter(
      (t) => t.length >= 3 && lowerPassword.includes(t)
    );

    if (matched.length === 0) return { warnings: [], suggestions: [] };

    return {
      warnings: ["Password contains personal/context info (easy to guess)."],
      suggestions: [
        "Avoid using your username, email, or site name inside passwords.",
      ],
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
