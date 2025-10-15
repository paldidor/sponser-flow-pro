import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { SponsorshipOfferWithPackages } from "@/types/dashboard";

const offerSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
});

type OfferFormValues = z.infer<typeof offerSchema>;

interface OfferEditDialogProps {
  offer: SponsorshipOfferWithPackages | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OfferEditDialog = ({ offer, open, onOpenChange }: OfferEditDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  useEffect(() => {
    if (offer) {
      form.reset({
        title: offer.title,
        description: offer.description || "",
      });
    }
  }, [offer, form]);

  const handleSubmit = async (values: OfferFormValues) => {
    if (!offer) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("sponsorship_offers")
        .update({
          title: values.title,
          description: values.description || null,
        })
        .eq("id", offer.id);

      if (error) throw error;

      toast({
        title: "Offer Updated",
        description: "Your sponsorship offer has been updated successfully.",
      });

      queryClient.invalidateQueries({ queryKey: ["sponsorship-offers"] });
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating offer:", error);
      toast({
        title: "Error",
        description: "Failed to update sponsorship offer. Please try again.",
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
          <DialogTitle>Edit Sponsorship Offer</DialogTitle>
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
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
