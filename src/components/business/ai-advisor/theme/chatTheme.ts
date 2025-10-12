/**
 * Chat Theme Configuration
 * Centralized styling constants for AI Advisor Chat
 */

export const chatTheme = {
  // Layout dimensions
  layout: {
    desktop: {
      width: 520,
      position: 'right-0 top-0 bottom-0' as const,
    },
    mobile: {
      position: 'inset-0' as const,
    },
  },

  // Animation timings
  animations: {
    messageDelay: 0.05,
    recommendationDelay: 0.1,
    shimmerDuration: 2,
  },

  // Z-index layers
  zIndex: {
    floatingButton: 50,
    chatWindow: 50,
  },

  // Message bubble styles
  messageBubble: {
    user: {
      base: 'rounded-2xl px-4 py-3 shadow-sm min-w-0 rounded-br-sm max-w-[85%]',
      background: 'bg-gradient-to-br from-primary to-primary-dark',
      text: 'text-primary-foreground',
    },
    assistant: {
      base: 'rounded-2xl px-4 py-3 shadow-sm min-w-0 rounded-bl-sm w-full',
      background: 'bg-card border border-border',
      text: 'text-foreground',
    },
  },

  // Recommendation cards
  recommendations: {
    desktop: {
      cardWidth: 220,
      scrollHint: true,
    },
    mobile: {
      showFirst: true,
      viewAllButton: true,
    },
  },
} as const;

export type ChatTheme = typeof chatTheme;
