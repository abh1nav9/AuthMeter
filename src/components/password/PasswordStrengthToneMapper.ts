import type { PasswordStrengthLabel } from "../../domain/password/PasswordAnalysisTypes";
import type { BadgeTone } from "../ui/Badge";

export class PasswordStrengthToneMapper {
  getBadgeTone(label: PasswordStrengthLabel): BadgeTone {
    switch (label) {
      case "Very weak":
        return "danger";
      case "Weak":
        return "warning";
      case "Okay":
        return "neutral";
      case "Strong":
      case "Very strong":
        return "success";
      default:
        return "neutral";
    }
  }

  getProgressBarClassName(label: PasswordStrengthLabel): string {
    switch (label) {
      case "Very weak":
        return "bg-gradient-to-r from-red-500 to-rose-400";
      case "Weak":
        return "bg-gradient-to-r from-amber-500 to-orange-400";
      case "Okay":
        return "bg-gradient-to-r from-white/70 to-white";
      case "Strong":
        return "bg-gradient-to-r from-emerald-500 to-green-400";
      case "Very strong":
        return "bg-gradient-to-r from-emerald-400 to-cyan-300";
      default:
        return "bg-gradient-to-r from-white/70 to-white";
    }
  }
}
