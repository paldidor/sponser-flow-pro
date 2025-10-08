import { DollarSign, Users, ListChecks } from "lucide-react";
import { MetricCard } from "./MetricCard";

interface OverviewSectionProps {
  totalRevenue?: number;
  potentialRevenue?: number;
  activeSponsors?: number;
  openTasks?: number;
}

export const OverviewSection = ({
  totalRevenue = 9000,
  potentialRevenue = 19500,
  activeSponsors = 3,
  openTasks = 3,
}: OverviewSectionProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <section className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Total Revenue"
          value={`${formatCurrency(totalRevenue)} / ${formatCurrency(potentialRevenue)}`}
          icon={DollarSign}
          variant="blue"
        />
        
        <MetricCard
          title="Active Sponsors"
          value={activeSponsors.toString()}
          icon={Users}
          variant="green"
        />
        
        <MetricCard
          title="Open Activation Tasks"
          value={openTasks.toString()}
          icon={ListChecks}
          variant="orange"
        />
      </div>
    </section>
  );
};
