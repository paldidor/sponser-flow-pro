import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Rocket className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-5xl font-bold text-foreground">
            Welcome to Sponsorship Flow
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            Create professional sponsorship offers in minutes. Connect with sponsors and grow your team.
          </p>
        </div>
        <Button
          size="lg"
          className="px-12 py-6 text-lg font-semibold"
          onClick={() => navigate('/select-user-type')}
        >
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default Home;
