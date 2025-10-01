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
    <section className="relative w-full min-h-[700px] overflow-hidden" style={{
      background: 'linear-gradient(180deg, #B8E6FE 0%, #DFF2FE 50%, #EFF6FF 100%)'
    }}>
      {/* Animated clouds moving left to right */}
      <div className="absolute inset-0 pointer-events-none">
        <img 
          src="/images/cloud-animation.png" 
          alt="" 
          className="absolute top-12 w-28 opacity-70 animate-[drift-slow_40s_linear_infinite]"
          style={{ left: '-10%' }}
        />
        <img 
          src="/images/cloud-animation.png" 
          alt="" 
          className="absolute top-24 w-24 opacity-60 animate-[drift-moderate_25s_linear_infinite]"
          style={{ left: '-8%' }}
        />
        <img 
          src="/images/cloud-animation.png" 
          alt="" 
          className="absolute top-16 w-20 opacity-50 animate-[drift-very-slow_60s_linear_infinite]"
          style={{ left: '-5%' }}
        />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="flex items-end justify-between py-16 lg:py-20 min-h-[700px]">
          {/* Left Content */}
          <div className="space-y-6 max-w-2xl">
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight">
              <span className="text-[#5A5A5A]">Sponsor </span>
              <span className="text-[#00A3E0]">Youth Teams</span>
              <span className="text-[#FF9500]">.</span>
              <br />
              <span className="text-[#5A5A5A]">Boost Your </span>
              <span className="text-[#00A3E0]">Brand</span>
              <span className="text-[#FF9500]">.</span>
            </h1>

            <p className="text-base lg:text-lg text-[#5A5A5A] max-w-lg leading-relaxed">
              Get and manage all your youth sports sponsorships in one place. Support local communities while driving measurable results for your brand or business.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md pt-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
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
                className="bg-[#00A3E0] text-white hover:bg-[#0092CC] h-12 px-8 font-medium"
              >
                Learn More
              </Button>
            </form>
          </div>

          {/* Right Image - positioned to stand on grass */}
          <div className="relative hidden lg:block" style={{ 
            width: '504px', 
            height: '336px',
            marginBottom: '-60px' // Overlaps with grass to appear standing on it
          }}>
            <img 
              src="/images/hero-coach-players-banner.png" 
              alt="Coach and youth players with sponsorship banner" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* Grass bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-24 lg:h-28 z-20">
        <img 
          src="/images/grass-background.png" 
          alt="" 
          className="w-full h-full object-cover object-top"
        />
      </div>

      <style>{`
        @keyframes drift-very-slow {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(100vw + 10%));
          }
        }
        
        @keyframes drift-slow {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(100vw + 10%));
          }
        }
        
        @keyframes drift-moderate {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(100vw + 10%));
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
