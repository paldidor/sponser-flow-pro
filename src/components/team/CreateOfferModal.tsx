import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CreateOfferFlow from "./CreateOfferFlow";

interface CreateOfferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const CreateOfferModal = ({ open, onOpenChange, onComplete }: CreateOfferModalProps) => {
  const handleComplete = () => {
    onComplete();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Create Sponsorship Offer</DialogTitle>
        </DialogHeader>
        <CreateOfferFlow onComplete={handleComplete} onCancel={handleCancel} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateOfferModal;
