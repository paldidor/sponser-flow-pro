import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const offerSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  duration: z.string().min(1, "Duration is required"),
});

type OfferFormValues = z.infer<typeof offerSchema>;

interface AddOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddOfferDialog = ({ open, onOpenChange }: AddOfferDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      title: "",
      description: "",
      duration: "1 year",
    },
  });

  const handleSubmit = async (values: OfferFormValues) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get team profile
      const { data: teamProfile } = await supabase
        .from("team_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!teamProfile) throw new Error("Team profile not found");

      // Create sponsorship offer
      const { error } = await supabase
        .from("sponsorship_offers")
        .insert({
          user_id: user.id,
          team_profile_id: teamProfile.id,
          title: values.title,
          description: values.description || null,
          duration: values.duration,
          impact: "Community support",
          fundraising_goal: 0,
          supported_players: 0,
          status: "published",
        });

      if (error) throw error;

      toast({
        title: "Offer Created",
        description: "Your sponsorship offer has been created successfully.",
      });

      queryClient.invalidateQueries({ queryKey: ["sponsorship-offers"] });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error creating offer:", error);
      toast({
        title: "Error",
        description: "Failed to create sponsorship offer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Sponsorship Offer</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Offer Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 2025 Season Sponsorship" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Briefly describe this sponsorship opportunity..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="3 months">3 months</SelectItem>
                      <SelectItem value="6 months">6 months</SelectItem>
                      <SelectItem value="1 year">1 year</SelectItem>
                      <SelectItem value="2 years">2 years</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Offer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
