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
    <section className={cn("border-l-4 rounded-lg bg-card p-4 sm:p-6 shadow-sm mb-6 sm:mb-8", borderColors[borderColor])}>
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
          <Icon className={cn("h-5 w-5 flex-shrink-0", 
            borderColor === "blue" && "text-primary",
            borderColor === "green" && "text-dashboard-green",
            borderColor === "orange" && "text-dashboard-orange"
          )} />
          <h3 className="text-base sm:text-lg font-semibold text-foreground">{title}</h3>
          {badge && (
            <span className={cn("px-2 sm:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap", badgeColors[badgeVariant])}>
              {badge}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {actionButton && <div className="hidden sm:block">{actionButton}</div>}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="h-9 w-9 p-0 touch-manipulation"
          >
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            <span className="sr-only">{isOpen ? "Collapse" : "Expand"}</span>
          </Button>
        </div>
      </div>

      {/* Action button for mobile - shown below header */}
      {actionButton && isOpen && (
        <div className="sm:hidden mb-4">
          {actionButton}
        </div>
      )}

      {/* Content */}
      {isOpen && <div className="animate-accordion-down">{children}</div>}
    </section>
  );
};
