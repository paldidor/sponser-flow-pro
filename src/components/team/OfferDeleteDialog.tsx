import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface OfferDeleteDialogProps {
  offerId: string | null;
  offerTitle: string;
  packageCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OfferDeleteDialog = ({
  offerId,
  offerTitle,
  packageCount,
  open,
  onOpenChange,
}: OfferDeleteDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!offerId) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("sponsorship_offers")
        .delete()
        .eq("id", offerId);

      if (error) throw error;

      toast({
        title: "Offer Deleted",
        description: `"${offerTitle}" and all its packages have been deleted.`,
      });

      queryClient.invalidateQueries({ queryKey: ["sponsorship-offers"] });
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting offer:", error);
      toast({
        title: "Error",
        description: "Failed to delete sponsorship offer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Sponsorship Offer?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to delete <strong>"{offerTitle}"</strong>?
            </p>
            <p className="text-destructive font-medium">
              This will permanently delete the offer and all {packageCount}{" "}
              {packageCount === 1 ? "package" : "packages"} inside it.
            </p>
            <p>This action cannot be undone.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete Offer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
