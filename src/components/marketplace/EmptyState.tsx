import { Search } from "lucide-react";

interface EmptyStateProps {
  message?: string;
  submessage?: string;
}

export const EmptyState = ({
  message = "No opportunities found",
  submessage = "Try adjusting your filters or check back later.",
}: EmptyStateProps) => {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-lg bg-muted/50 p-12 text-center">
      <div className="rounded-full bg-muted p-4">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <p className="text-lg font-medium text-[#101828]">{message}</p>
        <p className="text-sm text-[#6A7282]">{submessage}</p>
      </div>
    </div>
  );
};
