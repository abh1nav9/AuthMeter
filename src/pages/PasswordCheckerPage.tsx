import { GradientTitle } from "../components/aceternity/GradientTitle";
import { SpotlightBackground } from "../components/aceternity/SpotlightBackground";
import { AdviceCard } from "../components/password/AdviceCard";
import { CrackTimeCard } from "../components/password/CrackTimeCard";
import { PasswordInputCard } from "../components/password/PasswordInputCard";
import { StrengthResultCard } from "../components/password/StrengthResultCard";
import { ThemeToggleButton } from "../components/theme/ThemeToggleButton";
import { usePasswordAnalyzerViewModel } from "../viewmodels/usePasswordAnalyzerViewModel";
import { useThemeViewModel } from "../viewmodels/useThemeViewModel";
import { usePwnedPasswordViewModel } from "../viewmodels/usePwnedPasswordViewModel";

export function PasswordCheckerPage() {
  const vm = usePasswordAnalyzerViewModel();
  const themeVm = useThemeViewModel();
  const pwnedVm = usePwnedPasswordViewModel(vm.password);

  return (
    <SpotlightBackground>
      <div className="mx-auto flex h-dvh w-full max-w-6xl flex-col px-4 py-5 sm:py-6">
        <header className="shrink-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="space-y-2">
              <GradientTitle>
                AuthMeter - Password strength & Crack Time Estimator
              </GradientTitle>
              <p className="max-w-3xl text-sm text-[color:var(--app-text-muted)]">
                Strength is shown as a percentage and crack-time is shown as a
                range across common attack scenarios. No tool can model every
                attacker or leak—use this as a guide, not a guarantee.
              </p>
            </div>
            <div className="self-start pt-1">
              <ThemeToggleButton
                theme={themeVm.theme}
                onToggle={themeVm.toggleTheme}
              />
            </div>
          </div>
        </header>

        <main className="mt-4 min-h-0 flex-1 overflow-auto lg:overflow-hidden">
          <div className="grid grid-cols-12 gap-4 md:grid-rows-2 md:auto-rows-fr lg:h-full">
            <PasswordInputCard
              password={vm.password}
              onPasswordChange={vm.setPassword}
              className="col-span-12 md:col-span-5 lg:col-span-4"
            />
            <StrengthResultCard
              analysis={vm.analysis}
              className="col-span-12 md:col-span-7 lg:col-span-8"
              pwnedEnabled={pwnedVm.enabled}
              pwnedStatus={pwnedVm.status}
            />
            <CrackTimeCard
              analysis={vm.analysis}
              className="col-span-12 md:col-span-7 md:row-start-2 lg:col-span-7"
            />
            <AdviceCard
              analysis={vm.analysis}
              password={vm.password}
              className="col-span-12 md:col-span-5 md:row-start-2 lg:col-span-5"
            />
          </div>
        </main>

        <footer className="mt-4 shrink-0 text-xs text-[color:var(--app-text-subtle)]">
          Tip: Use a password manager and unique passwords per site. For
          high-risk accounts, enable MFA.
        </footer>
      </div>
    </SpotlightBackground>
  );
}
