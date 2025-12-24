export class HumanDurationFormatter {
  formatSeconds(totalSeconds: number): string {
    if (!Number.isFinite(totalSeconds)) return "∞";
    if (totalSeconds <= 0) return "0s";

    const seconds = Math.floor(totalSeconds);
    const minute = 60;
    const hour = 60 * minute;
    const day = 24 * hour;
    const year = 365 * day;

    if (seconds < minute) return `${seconds}s`;
    if (seconds < hour) return `${Math.floor(seconds / minute)}m`;
    if (seconds < day) return `${Math.floor(seconds / hour)}h`;
    if (seconds < year) return `${Math.floor(seconds / day)}d`;

    const years = Math.floor(seconds / year);
    if (years > 1_000_000_000) return "> 1B years";
    if (years > 1_000_000) return "> 1M years";
    if (years > 1_000) return "> 1K years";
    return `${years}y`;
  }
}
