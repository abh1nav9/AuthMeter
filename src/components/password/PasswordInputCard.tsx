import { Card } from "../ui/Card";
import { Input } from "../ui/Input";

export interface PasswordInputCardProps {
  password: string;
  onPasswordChange: (value: string) => void;
  className?: string;
}

export function PasswordInputCard({
  password,
  onPasswordChange,
  className,
}: PasswordInputCardProps) {
  return (
    <Card className={className}>
      <div className="space-y-2">
        <div>
          <div className="text-sm font-medium text-[color:var(--app-text)]">
            Password
          </div>
          <div className="text-xs text-[color:var(--app-text-subtle)]">
            We never send your password anywhere. This runs in your browser.
          </div>
        </div>
        <Input
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          placeholder="Type a password…"
          autoComplete="off"
          spellCheck={false}
        />
      </div>
    </Card>
  );
}
