import { cn } from "@/lib/utils";

interface TagProps {
  label: string;
  className?: string;
}

export const Tag = ({ label, className }: TagProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-[#F3F4F6] px-2 py-[3px] text-[12px] leading-4 text-[#4A5565]",
        className
      )}
    >
      {label}
    </span>
  );
};
