import { useNavigate } from "react-router-dom";
import CreateOfferFlow from "@/components/team/CreateOfferFlow";

const CreateOffer = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate("/team/dashboard");
  };

  const handleCancel = () => {
    navigate("/team/dashboard");
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <CreateOfferFlow onComplete={handleComplete} onCancel={handleCancel} />
      </div>
    </div>
  );
};

export default CreateOffer;
