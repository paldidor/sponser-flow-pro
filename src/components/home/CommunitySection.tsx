import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const CommunitySection = () => {
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
      description: "Thanks for joining our community program!",
    });
    setEmail("");
  };

  return (
    <section className="relative py-16 lg:py-24 bg-gradient-to-b from-primary/10 via-primary/5 to-background overflow-hidden">
      {/* Animated clouds */}
      <div className="absolute inset-0 pointer-events-none">
        <img 
          src="/images/cloud-animation.png" 
          alt="" 
          className="absolute top-10 right-10 w-32 opacity-40 animate-[float_7s_ease-in-out_infinite]"
        />
        <img 
          src="/images/cloud-animation.png" 
          alt="" 
          className="absolute top-40 left-20 w-24 opacity-30 animate-[float_9s_ease-in-out_infinite_2s]"
        />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="bg-card rounded-2xl p-8 lg:p-10 shadow-lg">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-foreground">Become a </span>
              <span className="text-primary">Local Champ</span>
              <span className="text-accent">.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join Sponsa's affiliate and referral program and earn for creating community impact!
            </p>

            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="bg-accent/10 text-accent p-3 rounded-full shrink-0">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Local Champ Program</h3>
                  <p className="text-muted-foreground">
                    Get paid to grow Sponsa in your community and help local teams thrive.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 text-primary p-3 rounded-full shrink-0">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Community Impact</h3>
                  <p className="text-muted-foreground">
                    Help more kids play sports while building stronger local business connections.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
                required
              />
              <Button 
                type="submit" 
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Learn More
              </Button>
            </form>

            <p className="text-sm text-muted-foreground mt-4">
              Ready to make an impact? Connect with us through the marketplace to learn more about community programs.
            </p>
          </div>

          {/* Right Image */}
          <div className="relative">
            <img 
              src="/images/community-player-celebrating.png" 
              alt="Community member celebrating" 
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

export default CommunitySection;
