import { format } from "date-fns";
import { memo, useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ActivationTask } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface TaskRowProps {
  task: ActivationTask;
  onStatusChange: (taskId: string, status: string) => void;
}

const TaskRowComponent = ({ task, onStatusChange }: TaskRowProps) => {
  const statusConfig = useMemo(() => ({
    "in-progress": { label: "In Progress", color: "bg-dashboard-orange text-white" },
    stuck: { label: "Stuck", color: "bg-destructive text-white" },
    complete: { label: "Complete", color: "bg-dashboard-green text-white" },
  }), []);

  const status = statusConfig[task.status];

  const formattedDate = useMemo(() => 
    format(new Date(task.due_date), "MMM dd, yyyy"),
    [task.due_date]
  );

  const handleStatusChange = useCallback((value: string) => {
    onStatusChange(task.id, value);
  }, [onStatusChange, task.id]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-3 sm:gap-4 p-3 sm:p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors">
      {/* Task Name */}
      <div className="md:col-span-1">
        <div className="text-xs text-muted-foreground md:hidden mb-1">Task Name</div>
        <div className="font-medium text-sm sm:text-base text-foreground">{task.task_name}</div>
      </div>

      {/* Due Date */}
      <div className="md:col-span-1">
        <div className="text-xs text-muted-foreground md:hidden mb-1">Due Date</div>
        <div className="text-sm text-foreground">
          {formattedDate}
        </div>
      </div>

      {/* Package */}
      <div className="md:col-span-1">
        <div className="text-xs text-muted-foreground md:hidden mb-1">Package</div>
        <div className="text-sm text-foreground">{task.package_name}</div>
      </div>

      {/* Sponsor */}
      <div className="md:col-span-1">
        <div className="text-xs text-muted-foreground md:hidden mb-1">Sponsor</div>
        <div className="text-sm text-foreground">{task.sponsor_name}</div>
      </div>

      {/* Description */}
      <div className="md:col-span-1">
        <div className="text-xs text-muted-foreground md:hidden mb-1">Description</div>
        <div className="text-sm text-muted-foreground truncate">{task.description}</div>
      </div>

      {/* Status */}
      <div className="md:col-span-1">
        <div className="text-xs text-muted-foreground md:hidden mb-1">Status</div>
        <Select value={task.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full h-10 touch-manipulation">
            <SelectValue>
              <Badge className={cn("font-medium", status.color)}>
                {status.label}
              </Badge>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="z-50">
            <SelectItem value="in-progress" className="h-10 touch-manipulation">
              <Badge className="bg-dashboard-orange text-white font-medium">In Progress</Badge>
            </SelectItem>
            <SelectItem value="stuck" className="h-10 touch-manipulation">
              <Badge className="bg-destructive text-white font-medium">Stuck</Badge>
            </SelectItem>
            <SelectItem value="complete" className="h-10 touch-manipulation">
              <Badge className="bg-dashboard-green text-white font-medium">Complete</Badge>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export const TaskRow = memo(TaskRowComponent, (prevProps, nextProps) => {
  return (
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.status === nextProps.task.status &&
    prevProps.task.task_name === nextProps.task.task_name &&
    prevProps.task.due_date === nextProps.task.due_date
  );
});
