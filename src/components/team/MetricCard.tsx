import { memo, useMemo } from "react";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  variant: "blue" | "green" | "orange";
}

const MetricCardComponent = ({ title, value, icon: Icon, variant }: MetricCardProps) => {
  const variantStyles = useMemo(() => ({
    blue: {
      bg: "bg-primary/5",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      textColor: "text-foreground",
    },
    green: {
      bg: "bg-dashboard-green/5",
      iconBg: "bg-dashboard-green/10",
      iconColor: "text-dashboard-green",
      textColor: "text-foreground",
    },
    orange: {
      bg: "bg-dashboard-orange/5",
      iconBg: "bg-dashboard-orange/10",
      iconColor: "text-dashboard-orange",
      textColor: "text-foreground",
    },
  }), []);

  const styles = variantStyles[variant];

  return (
    <Card className={cn("p-4 sm:p-6 border-0 shadow-sm", styles.bg)}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn("text-xl sm:text-2xl font-semibold break-words", styles.textColor)}>{value}</p>
        </div>
        <div className={cn("rounded-full p-2.5 sm:p-3 flex-shrink-0", styles.iconBg)}>
          <Icon className={cn("h-5 w-5 sm:h-6 sm:w-6", styles.iconColor)} />
        </div>
      </div>
    </Card>
  );
};

// Memoize to prevent unnecessary re-renders when metrics don't change
export const MetricCard = memo(MetricCardComponent);
