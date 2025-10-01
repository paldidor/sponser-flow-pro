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
    <section className="relative min-h-[700px] lg:min-h-[800px] overflow-hidden" style={{
      background: 'linear-gradient(180deg, #B8E6FE 0%, #DFF2FE 50%, #EFF6FF 100%)'
    }}>
      {/* Animated clouds - moving left to right */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <img 
          src="/images/cloud-animation.png" 
          alt="" 
          className="absolute top-12 w-24 lg:w-32 opacity-60 animate-[drift-very-slow_60s_linear_infinite]"
          style={{ left: '-100px' }}
        />
        <img 
          src="/images/cloud-animation.png" 
          alt="" 
          className="absolute top-24 w-20 lg:w-28 opacity-50 animate-[drift-slow_45s_linear_infinite]"
          style={{ left: '-80px' }}
        />
        <img 
          src="/images/cloud-animation.png" 
          alt="" 
          className="absolute top-8 w-16 lg:w-24 opacity-40 animate-[drift-moderate_30s_linear_infinite]"
          style={{ left: '-60px' }}
        />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center py-16 lg:py-24">
          {/* Left Content */}
          <div className="space-y-5 lg:space-y-6">
            <h1 className="text-3xl lg:text-5xl font-bold leading-tight">
              <span style={{ color: '#4A5568' }}>Sponsor </span>
              <span style={{ color: '#3B82F6' }}>Youth Teams</span>
              <span style={{ color: '#F59E0B' }}>.</span>
              <br />
              <span style={{ color: '#4A5568' }}>Boost Your </span>
              <span style={{ color: '#3B82F6' }}>Brand</span>
              <span style={{ color: '#F59E0B' }}>.</span>
            </h1>

            <p className="text-base lg:text-lg max-w-xl" style={{ color: '#6B7280' }}>
              Get and manage all your youth sports sponsorships in one place. Support local communities while driving measurable results for your brand or business.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: '#9CA3AF' }} />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-white border-gray-200"
                  required
                />
              </div>
              <Button 
                type="submit" 
                size="lg"
                className="h-12 px-8"
                style={{ backgroundColor: '#3B82F6', color: 'white' }}
              >
                Learn More
              </Button>
            </form>
          </div>

          {/* Right Image - Positioned precisely */}
          <div className="relative lg:absolute lg:right-[calc((100vw-1280px)/2+80px)] lg:bottom-20 flex justify-center lg:justify-end">
            <img 
              src="/images/hero-coach-players-banner.png" 
              alt="Coach and youth players with sponsorship banner" 
              className="w-full lg:w-[504px] h-auto lg:h-[336px] object-contain"
            />
          </div>
        </div>
      </div>

      {/* Grass bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-20 lg:h-24 z-0">
        <img 
          src="/images/grass-background.png" 
          alt="" 
          className="w-full h-full object-cover object-top"
        />
      </div>

      <style>{`
        @keyframes drift-very-slow {
          0% {
            transform: translateX(0) translateY(0);
          }
          100% {
            transform: translateX(calc(100vw + 200px)) translateY(-10px);
          }
        }
        
        @keyframes drift-slow {
          0% {
            transform: translateX(0) translateY(0);
          }
          100% {
            transform: translateX(calc(100vw + 200px)) translateY(-15px);
          }
        }
        
        @keyframes drift-moderate {
          0% {
            transform: translateX(0) translateY(0);
          }
          100% {
            transform: translateX(calc(100vw + 200px)) translateY(-5px);
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
