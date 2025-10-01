import { ClipboardList, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CollapsibleSection } from "./CollapsibleSection";
import { TaskRow } from "./TaskRow";
import { useActivationTasks } from "@/hooks/useActivationTasks";
import { toast } from "sonner";

export const ActivationTasksSection = () => {
  const { data: tasks, isLoading, error, updateTaskStatus } = useActivationTasks();

  const handleAddTask = () => {
    toast.info("Add task dialog coming soon");
  };

  const handleStatusChange = (taskId: string, status: string) => {
    updateTaskStatus({ id: taskId, status });
  };

  if (isLoading) {
    return (
      <CollapsibleSection
        title="Activation Tasks"
        icon={ClipboardList}
        badge="Loading..."
        badgeVariant="orange"
        borderColor="orange"
      >
        <div className="text-center py-8 text-muted-foreground">
          Loading activation tasks...
        </div>
      </CollapsibleSection>
    );
  }

  if (error) {
    return (
      <CollapsibleSection
        title="Activation Tasks"
        icon={ClipboardList}
        borderColor="orange"
      >
        <div className="text-center py-8 text-destructive">
          Error loading tasks. Please try again.
        </div>
      </CollapsibleSection>
    );
  }

  const taskCount = tasks?.length || 0;

  return (
    <CollapsibleSection
      title="Activation Tasks"
      icon={ClipboardList}
      badge={`${taskCount} Total`}
      badgeVariant="orange"
      borderColor="orange"
      actionButton={
        <Button 
          onClick={handleAddTask}
          className="bg-dashboard-orange hover:bg-dashboard-orange/90 text-white h-10 sm:h-9 touch-manipulation"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="hidden xs:inline">Add New Task</span>
          <span className="xs:hidden">Add</span>
        </Button>
      }
    >
      {tasks && tasks.length > 0 ? (
        <div className="bg-card rounded-lg border">
          {/* Table Header - Hidden on mobile */}
          <div className="hidden md:grid md:grid-cols-6 gap-4 p-4 border-b bg-muted/50 font-medium text-sm text-muted-foreground">
            <div>Task Name</div>
            <div>Due Date</div>
            <div>Package</div>
            <div>Sponsor</div>
            <div>Description</div>
            <div>Status</div>
          </div>
          
          {/* Task Rows */}
          <div>
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 px-4">
          <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No activation tasks yet</p>
          <Button 
            onClick={handleAddTask}
            className="bg-dashboard-orange hover:bg-dashboard-orange/90 text-white h-11 touch-manipulation"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create your first task
          </Button>
        </div>
      )}
    </CollapsibleSection>
  );
};
