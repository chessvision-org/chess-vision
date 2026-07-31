import { html } from "../helpers/html";
import { Crown, Gem, Heart, ShieldAlert, Sparkles } from "./icons";

type MembershipTone = "muted" | "gold" | "platinum" | "diamond" | "patron";

export interface MembershipTier {
  id: "none" | "gold" | "platinum" | "diamond" | "patron";
  tone: MembershipTone;
  label: string;
  description: string;
}

interface MembershipBadgeProps {
  tier: MembershipTier;
  variant?: "badge" | "plain";
}

const TONE_BADGE: Record<MembershipTone, string> = {
  muted: "",
  gold: "badge-tone-gold",
  platinum: "badge-tone-platinum",
  diamond: "badge-tone-diamond",
  patron: "badge-tone-patron",
};

const TONE_TEXT: Record<MembershipTone, string> = {
  muted: "",
  gold: "badge-text-gold",
  platinum: "badge-text-platinum",
  diamond: "badge-text-diamond",
  patron: "badge-text-patron",
};

const TONE_ICON: Record<MembershipTone, (className?: string) => string> = {
  muted: Heart,
  gold: Sparkles,
  platinum: ShieldAlert,
  diamond: Gem,
  patron: Crown,
};

export const NONE_TIER: MembershipTier = {
  id: "none",
  tone: "muted",
  label: "Free",
  description: "Free ChessViewer user",
};

const DONATE_URL = "https://github.com/chessviewer-org/chess-viewer";

export function MembershipBadge({ tier, variant = "badge" }: MembershipBadgeProps) {
  if (tier.id === "none") {
    return html`<a
      href="${DONATE_URL}"
      target="_blank"
      rel="noopener noreferrer"
      class="donate-link"
      >Donate now</a
    >`;
  }

  const Icon = TONE_ICON[tier.tone];

  if (variant === "plain") {
    return html`<span class="membership-badge-plain ${TONE_TEXT[tier.tone]}"
      >${Icon("w-3-5 h-3-5")}${tier.label}</span
    >`;
  }

  return html`<span title="${tier.description}" class="membership-badge ${TONE_BADGE[tier.tone]}"
    >${Icon("w-3-5 h-3-5")}${tier.label}</span
  >`;
}
