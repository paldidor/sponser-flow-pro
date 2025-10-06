import { useNavigate } from "react-router-dom";
import { Users, Briefcase, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const SelectUserType = () => {
  const navigate = useNavigate();

  const handleSelectType = (type: 'team' | 'business') => {
    navigate(`/auth?type=${type}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl">
        {/* Back to Home Link */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-8 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-foreground">Welcome to </span>
            <span className="text-primary">Sponsa</span>
            <span className="text-accent">!</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose how you'd like to get started. Whether you're raising funds for your team or looking to sponsor youth sports, we've got you covered.
          </p>
        </div>

        {/* Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Team Card */}
          <Card 
            className="group relative overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] border-2 hover:border-primary bg-card"
            onClick={() => handleSelectType('team')}
          >
            <div className="p-8 lg:p-10 flex flex-col items-center text-center h-full">
              {/* Icon */}
              <div className="mb-6 p-6 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Users className="h-16 w-16 text-primary" strokeWidth={1.5} />
              </div>

              {/* Title */}
              <h2 className="text-2xl lg:text-3xl font-bold mb-4 text-foreground">
                I'm a Team
              </h2>

              {/* Description */}
              <p className="text-muted-foreground mb-6 flex-1">
                Raise funds and find sponsors for your youth sports team. Create sponsorship packages and connect with businesses looking to support local communities.
              </p>

              {/* Features List */}
              <ul className="text-sm text-muted-foreground space-y-2 mb-8 text-left w-full">
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Create custom sponsorship packages</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Reach local and national businesses</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Manage sponsors in one dashboard</span>
                </li>
              </ul>

              {/* Button */}
              <Button 
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectType('team');
                }}
              >
                Continue as Team
              </Button>
            </div>
          </Card>

          {/* Business Card */}
          <Card 
            className="group relative overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] border-2 hover:border-accent bg-card"
            onClick={() => handleSelectType('business')}
          >
            <div className="p-8 lg:p-10 flex flex-col items-center text-center h-full">
              {/* Icon */}
              <div className="mb-6 p-6 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
                <Briefcase className="h-16 w-16 text-accent" strokeWidth={1.5} />
              </div>

              {/* Title */}
              <h2 className="text-2xl lg:text-3xl font-bold mb-4 text-foreground">
                I'm a Business
              </h2>

              {/* Description */}
              <p className="text-muted-foreground mb-6 flex-1">
                Find sponsorship opportunities and connect with youth sports teams. Support local communities while building brand awareness and driving measurable results.
              </p>

              {/* Features List */}
              <ul className="text-sm text-muted-foreground space-y-2 mb-8 text-left w-full">
                <li className="flex items-start">
                  <span className="text-accent mr-2">✓</span>
                  <span>Browse verified sponsorship opportunities</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">✓</span>
                  <span>Connect with local youth teams</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">✓</span>
                  <span>Track ROI and community impact</span>
                </li>
              </ul>

              {/* Button */}
              <Button 
                size="lg"
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectType('business');
                }}
              >
                Continue as Business
              </Button>
            </div>
          </Card>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/sign-in')}
            className="text-primary hover:underline font-medium"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
};

export default SelectUserType;
