import { calculateProgress, formatCurrency } from "@/lib/marketplaceUtils";

interface ProgressBarProps {
  raised: number;
  goal: number;
}

export const ProgressBar = ({ raised, goal }: ProgressBarProps) => {
  const progress = calculateProgress(raised, goal);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-[#4A5565]">Total Amount</span>
        <span className="text-[12px] font-semibold text-[#00AAFE]">
          {formatCurrency(raised)} / {formatCurrency(goal)}
        </span>
      </div>
      <div className="relative h-[6px] w-full overflow-hidden rounded-full bg-[#E5E7EB]">
        <div
          className="h-full rounded-full bg-[#FFB82D] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
