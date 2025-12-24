import { useState } from "react";
import { Eye, EyeOff, SlidersHorizontal } from "lucide-react";
import type { PasswordContext } from "../../domain/password/PasswordContext";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

export interface PasswordInputCardProps {
  password: string;
  onPasswordChange: (value: string) => void;
  context: PasswordContext;
  onContextChange: (next: PasswordContext) => void;
  className?: string;
}

export function PasswordInputCard({
  password,
  onPasswordChange,
  context,
  onContextChange,
  className,
}: PasswordInputCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showContext, setShowContext] = useState(false);

  return (
    <Card className={className}>
      <div className="flex h-full min-h-0 flex-col">
        <div className="shrink-0 space-y-2">
          <div>
            <div className="text-sm font-medium text-[var(--app-text)]">
              Password
            </div>
            <div className="text-xs text-[var(--app-text-subtle)]">
              We never send your password anywhere. This runs in your browser.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Input
              type={isVisible ? "text" : "password"}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="Type a password…"
              autoComplete="off"
              spellCheck={false}
            />
            <Button
              variant="ghost"
              className="shrink-0 border border-[var(--app-border)] p-0"
              onClick={() => setIsVisible((v) => !v)}
              aria-label={isVisible ? "Hide password" : "Show password"}
              title={isVisible ? "Hide password" : "Show password"}
            >
              {isVisible ? <EyeOff size={12} /> : <Eye size={12} />}
            </Button>
            <Button
              variant="ghost"
              className="shrink-0 border border-[var(--app-border)] p-0"
              onClick={() => setShowContext((v) => !v)}
              aria-label={
                showContext ? "Hide context fields" : "Show context fields"
              }
              title={
                showContext ? "Hide context fields" : "Show context fields"
              }
            >
              <SlidersHorizontal size={12} />
            </Button>
          </div>
        </div>

        {showContext ? (
          <div className="mt-3 min-h-0 flex-1 overflow-auto rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-2)] p-3">
            <div className="text-xs font-medium text-[var(--app-text-muted)]">
              Optional context (helps detect guessable passwords)
            </div>
            <div className="mt-2 grid gap-2 pr-1">
              <Input
                value={context.username ?? ""}
                onChange={(e) =>
                  onContextChange({ ...context, username: e.target.value })
                }
                placeholder="Username (optional)"
                autoComplete="off"
                className="h-9"
              />
              <Input
                value={context.email ?? ""}
                onChange={(e) =>
                  onContextChange({ ...context, email: e.target.value })
                }
                placeholder="Email (optional)"
                autoComplete="off"
                className="h-9"
              />
              <Input
                value={context.site ?? ""}
                onChange={(e) =>
                  onContextChange({ ...context, site: e.target.value })
                }
                placeholder="Site/app name (optional)"
                autoComplete="off"
                className="h-9"
              />
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
