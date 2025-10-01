import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  variant: "blue" | "green" | "orange";
}

export const MetricCard = ({ title, value, icon: Icon, variant }: MetricCardProps) => {
  const variantStyles = {
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
  };

  const styles = variantStyles[variant];

  return (
    <Card className={cn("p-6 border-0 shadow-sm", styles.bg)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn("text-2xl font-semibold", styles.textColor)}>{value}</p>
        </div>
        <div className={cn("rounded-full p-3", styles.iconBg)}>
          <Icon className={cn("h-6 w-6", styles.iconColor)} />
        </div>
      </div>
    </Card>
  );
};
