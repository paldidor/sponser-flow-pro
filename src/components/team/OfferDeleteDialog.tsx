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
      // Step 1: Update offer status to 'deleted'
      const { error: offerError } = await supabase
        .from("sponsorship_offers")
        .update({ 
          status: "deleted",
          updated_at: new Date().toISOString()
        })
        .eq("id", offerId);

      if (offerError) throw offerError;

      // Step 2: Update all packages in this offer to 'deleted'
      const { error: packagesError } = await supabase
        .from("sponsorship_packages")
        .update({ 
          status: "deleted",
          updated_at: new Date().toISOString()
        })
        .eq("sponsorship_offer_id", offerId);

      if (packagesError) throw packagesError;

      toast({
        title: "Offer Archived",
        description: `"${offerTitle}" and all its packages have been archived.`,
      });

      queryClient.invalidateQueries({ queryKey: ["sponsorship-offers"] });
      onOpenChange(false);
    } catch (error) {
      console.error("Error archiving offer:", error);
      toast({
        title: "Error",
        description: "Failed to archive sponsorship offer. Please try again.",
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
              This will archive the offer and all {packageCount}{" "}
              {packageCount === 1 ? "package" : "packages"} inside it.
            </p>
            <p>You can restore it later if needed.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Archiving..." : "Archive Offer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
