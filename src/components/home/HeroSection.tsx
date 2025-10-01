import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const HeroSection = () => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Success!",
      description: "We'll be in touch soon!",
    });
    setEmail("");
  };

  return (
    <section className="relative min-h-[600px] lg:min-h-[700px] bg-gradient-to-b from-primary/10 via-primary/5 to-background overflow-hidden">
      {/* Animated clouds */}
      <div className="absolute inset-0 pointer-events-none">
        <img 
          src="/images/cloud-animation.png" 
          alt="" 
          className="absolute top-20 left-10 w-24 lg:w-32 opacity-60 animate-[float_6s_ease-in-out_infinite]"
        />
        <img 
          src="/images/cloud-animation.png" 
          alt="" 
          className="absolute top-32 right-20 w-20 lg:w-28 opacity-50 animate-[float_8s_ease-in-out_infinite_2s]"
        />
        <img 
          src="/images/cloud-animation.png" 
          alt="" 
          className="absolute top-10 right-1/4 w-16 lg:w-24 opacity-40 animate-[float_7s_ease-in-out_infinite_1s]"
        />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center py-12 lg:py-20">
          {/* Left Content */}
          <div className="space-y-6 lg:space-y-8">
            <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight">
              <span className="text-foreground">Sponsor </span>
              <span className="text-primary">Youth Teams</span>
              <span className="text-accent">.</span>
              <br />
              <span className="text-foreground">Boost Your </span>
              <span className="text-primary">Brand</span>
              <span className="text-accent">.</span>
            </h1>

            <p className="text-lg lg:text-xl text-muted-foreground max-w-xl">
              Get and manage all your youth sports sponsorships in one place. Support local communities while driving measurable results for your brand or business.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
              <Button 
                type="submit" 
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8"
              >
                Learn More
              </Button>
            </form>
          </div>

          {/* Right Image */}
          <div className="relative">
            <img 
              src="/images/hero-coach-players-banner.png" 
              alt="Coach and youth players with sponsorship banner" 
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>

      {/* Grass bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-16 lg:h-20">
        <img 
          src="/images/grass-background.png" 
          alt="" 
          className="w-full h-full object-cover object-top"
        />
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
