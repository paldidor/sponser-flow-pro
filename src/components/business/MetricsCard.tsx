import { DollarSign, Users, Eye, Target, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  color: 'blue' | 'yellow' | 'green' | 'purple';
  icon: 'dollar' | 'users' | 'eye' | 'target' | 'trending';
}

const iconMap = {
  dollar: DollarSign,
  users: Users,
  eye: Eye,
  target: Target,
  trending: TrendingUp,
};

const colorConfig = {
  blue: {
    border: 'border-t-[#00aafe]',
    iconBg: 'bg-[#00aafe]/10',
    iconColor: 'text-[#00aafe]',
  },
  yellow: {
    border: 'border-t-[#ffb82d]',
    iconBg: 'bg-[#ffb82d]/10',
    iconColor: 'text-[#ffb82d]',
  },
  green: {
    border: 'border-t-green-500',
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-500',
  },
  purple: {
    border: 'border-t-purple-500',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-500',
  },
};

export const MetricsCard = ({ title, value, subtitle, color, icon }: MetricsCardProps) => {
  const Icon = iconMap[icon];
  const colors = colorConfig[color];

  return (
    <article 
      className={cn(
        "relative bg-white border border-gray-200 rounded-lg shadow-sm p-4 border-t-4 transition-shadow hover:shadow-md",
        colors.border
      )}
    >
      {/* Icon - Top Right */}
      <div className={cn(
        "absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center",
        colors.iconBg
      )}>
        <Icon className={cn("w-4 h-4", colors.iconColor)} aria-hidden="true" />
      </div>

      {/* Content - Top Left */}
      <div className="pr-12">
        <h3 className="text-sm font-medium text-gray-600 mb-2">
          {title}
        </h3>
        <p className="text-2xl font-bold text-gray-900 mb-1">
          {value}
        </p>
        {subtitle && (
          <p className="text-sm text-gray-500">
            {subtitle}
          </p>
        )}
      </div>
    </article>
  );
};
