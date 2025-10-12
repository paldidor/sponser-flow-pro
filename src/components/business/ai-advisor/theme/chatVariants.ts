import { cva } from 'class-variance-authority';

/**
 * Chat Component Variants using CVA
 * Provides type-safe variant configurations for chat UI elements
 */

export const chatWindowVariants = cva(
  'flex flex-col shadow-2xl border-2 overflow-y-hidden min-w-0 min-h-0 backdrop-blur-xl bg-card/95',
  {
    variants: {
      platform: {
        mobile: 'h-full rounded-none border-0',
        desktop: 'h-full rounded-none',
      },
    },
    defaultVariants: {
      platform: 'desktop',
    },
  }
);

export const messageRowVariants = cva('flex gap-2 min-w-0', {
  variants: {
    role: {
      user: 'justify-end',
      assistant: 'justify-start',
    },
  },
  defaultVariants: {
    role: 'assistant',
  },
});

export const messageBubbleVariants = cva('rounded-2xl px-4 py-3 shadow-sm min-w-0', {
  variants: {
    role: {
      user: 'bg-gradient-to-br from-primary to-primary-dark text-primary-foreground rounded-br-sm max-w-[85%]',
      assistant: 'bg-card border border-border rounded-bl-sm w-full',
    },
  },
  defaultVariants: {
    role: 'assistant',
  },
});

export const floatingButtonVariants = cva(
  'h-16 w-16 rounded-full shadow-2xl hover:shadow-[0_20px_50px_rgba(0,170,254,0.4)] transition-all duration-300 relative group',
  {
    variants: {
      state: {
        default: 'bg-gradient-to-br from-primary to-primary-dark',
        pulsing: 'bg-gradient-to-br from-primary to-primary-dark',
      },
    },
    defaultVariants: {
      state: 'default',
    },
  }
);
