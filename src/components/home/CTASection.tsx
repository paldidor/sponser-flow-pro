import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 lg:py-16 bg-foreground text-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <h2 className="text-3xl lg:text-4xl font-bold text-center md:text-left">
            <span className="text-background">Your Sponsorship </span>
            <span className="text-primary">Journey Starts Here</span>
            <span className="text-accent">!</span>
          </h2>
          <Button 
            size="lg"
            onClick={() => navigate('/select-user-type')}
            className="bg-accent text-foreground hover:bg-accent/90 font-bold text-lg px-12 py-6 h-auto whitespace-nowrap"
          >
            Get Started Free
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
