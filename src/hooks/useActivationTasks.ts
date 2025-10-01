import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ActivationTask } from "@/types/dashboard";
import { toast } from "sonner";

export const useActivationTasks = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["activation-tasks"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("activation_tasks")
        .select(`
          *,
          sponsorship_packages (
            name,
            sponsorship_offer_id
          )
        `)
        .eq("user_id", user.id)
        .order("due_date", { ascending: true });

      if (error) throw error;

      return (data || []).map((task: any) => ({
        id: task.id,
        task_name: task.task_name,
        due_date: task.due_date,
        package_name: task.sponsorship_packages?.name || "N/A",
        sponsor_name: task.sponsor_name || "N/A",
        description: task.description || "",
        status: task.status as "in-progress" | "stuck" | "complete",
        created_at: task.created_at,
      })) as ActivationTask[];
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("activation_tasks")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activation-tasks"] });
      toast.success("Task status updated");
    },
    onError: (error) => {
      toast.error("Failed to update task status");
      console.error(error);
    },
  });

  return {
    ...query,
    updateTaskStatus: updateTaskMutation.mutate,
  };
};
