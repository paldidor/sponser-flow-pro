import { ReactNode, useState } from "react";
import { ChevronDown, ChevronUp, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  title: string;
  icon: LucideIcon;
  badge?: string;
  badgeVariant?: "blue" | "green" | "orange";
  children: ReactNode;
  defaultOpen?: boolean;
  borderColor?: "blue" | "green" | "orange";
  actionButton?: ReactNode;
}

export const CollapsibleSection = ({
  title,
  icon: Icon,
  badge,
  badgeVariant = "blue",
  children,
  defaultOpen = true,
  borderColor = "blue",
  actionButton,
}: CollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const borderColors = {
    blue: "border-l-primary",
    green: "border-l-dashboard-green",
    orange: "border-l-dashboard-orange",
  };

  const badgeColors = {
    blue: "bg-primary/10 text-primary",
    green: "bg-dashboard-green/10 text-dashboard-green",
    orange: "bg-dashboard-orange/10 text-dashboard-orange",
  };

  return (
    <section className={cn("border-l-4 rounded-lg bg-card p-6 shadow-sm mb-8", borderColors[borderColor])}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Icon className={cn("h-5 w-5", 
            borderColor === "blue" && "text-primary",
            borderColor === "green" && "text-dashboard-green",
            borderColor === "orange" && "text-dashboard-orange"
          )} />
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {badge && (
            <span className={cn("px-3 py-1 rounded-full text-xs font-medium", badgeColors[badgeVariant])}>
              {badge}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {actionButton}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="h-8 w-8 p-0"
          >
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            <span className="sr-only">{isOpen ? "Collapse" : "Expand"}</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      {isOpen && <div className="animate-accordion-down">{children}</div>}
    </section>
  );
};
