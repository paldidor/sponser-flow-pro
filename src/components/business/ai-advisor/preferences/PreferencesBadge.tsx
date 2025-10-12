import { motion } from 'framer-motion';
import type { SavedPreferences } from '@/hooks/useAIAdvisor';

interface PreferencesBadgeProps {
  preferences: SavedPreferences;
}

export const PreferencesBadge = ({ preferences }: PreferencesBadgeProps) => {
  if (!preferences || Object.keys(preferences).length === 0) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="bg-gradient-to-r from-accent/30 via-accent/20 to-accent/30 px-4 py-3 border-b border-border/50"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
        <p className="text-xs font-semibold text-foreground">Your Preferences</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {preferences.sports && preferences.sports.length > 0 && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/30"
          >
            🏆 {preferences.sports.join(', ')}
          </motion.span>
        )}
        {preferences.budgetMin && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-success/15 text-success border border-success/30"
          >
            💰 ${preferences.budgetMin.toLocaleString()}{preferences.budgetMax ? ` - $${preferences.budgetMax.toLocaleString()}` : '+'}
          </motion.span>
        )}
        {preferences.radiusKm && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-card border border-border"
          >
            📍 {preferences.radiusKm}km
          </motion.span>
        )}
      </div>
    </motion.div>
  );
};
