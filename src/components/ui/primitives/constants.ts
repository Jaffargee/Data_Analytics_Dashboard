import { BadgeVariant } from "./types";

export const accentMap = {
      gold: {
            text: 'text-accent-gold',
            bg: 'bg-accent-gold/10',
            border: 'border-accent-gold/20',
      },
      teal: {
            text: 'text-accent-teal',
            bg: 'bg-accent-teal/10',
            border: 'border-accent-teal/20',
      },
      red: {
            text: 'text-accent-red',
            bg: 'bg-accent-red/10',
            border: 'border-accent-red/20',
      },
      purple: {
            text: 'text-accent-purple',
            bg: 'bg-accent-purple/10',
            border: 'border-accent-purple/20',
      },
};

export const badgeMap: Record<BadgeVariant, string> = {
      gold: 'bg-accent-gold/15 text-accent-gold border-accent-gold/30',
      teal: 'bg-accent-teal/15 text-accent-teal border-accent-teal/30',
      red: 'bg-accent-red/15 text-accent-red border-accent-red/30',
      purple: 'bg-accent-purple/15 text-accent-purple border-accent-purple/30',
      muted: 'bg-bg-hover text-ink-secondary border-bg-border',
};