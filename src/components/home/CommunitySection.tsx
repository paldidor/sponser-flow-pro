import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <section 
      id="community"
      className="relative py-16 lg:py-24 overflow-hidden"
      style={{ background: "#CAE5F4" }}
    >
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
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto">
          {/* Left Content */}
          <div 
            className="rounded-2xl p-8 lg:p-10"
            style={{ 
              background: "white",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)"
            }}
          >
            <h2 className="mb-4">
              <span style={{ 
                color: "#545454", 
                fontSize: "42px", 
                fontWeight: 800, 
                lineHeight: "42px" 
              }}>
                Become a{" "}
              </span>
              <span style={{ 
                color: "#00AAFE", 
                fontSize: "42px", 
                fontWeight: 800, 
                lineHeight: "42px" 
              }}>
                Local Champ
              </span>
              <span style={{ 
                color: "#FFB82D", 
                fontSize: "42px", 
                fontWeight: 800, 
                lineHeight: "42px" 
              }}>
                .
              </span>
            </h2>
            
            <p 
              className="mb-8"
              style={{ 
                color: "#545454", 
                fontSize: "17.50px", 
                fontWeight: 400, 
                lineHeight: "28.44px" 
              }}
            >
              Join Sponsa's affiliate and referral program and earn for creating community impact!
            </p>

            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4">
                <div 
                  className="p-3 rounded-full shrink-0"
                  style={{ 
                    background: "rgba(0, 170, 254, 0.1)"
                  }}
                >
                  <img 
                    src="/icons/community-users.svg" 
                    alt="" 
                    className="h-6 w-6"
                  />
                </div>
                <div>
                  <h3 
                    className="mb-1"
                    style={{ 
                      color: "#545454", 
                      fontSize: "14px", 
                      fontWeight: 700, 
                      lineHeight: "21px" 
                    }}
                  >
                    Local Champ Program
                  </h3>
                  <p 
                    style={{ 
                      color: "#545454", 
                      fontSize: "12.25px", 
                      fontWeight: 400, 
                      lineHeight: "17.50px" 
                    }}
                  >
                    Get paid to grow Sponsa in your community and help local teams thrive.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div 
                  className="p-3 rounded-full shrink-0"
                  style={{ 
                    background: "rgba(0, 170, 254, 0.1)"
                  }}
                >
                  <img 
                    src="/icons/community-trending.svg" 
                    alt="" 
                    className="h-6 w-6"
                  />
                </div>
                <div>
                  <h3 
                    className="mb-1"
                    style={{ 
                      color: "#545454", 
                      fontSize: "14px", 
                      fontWeight: 700, 
                      lineHeight: "21px" 
                    }}
                  >
                    Community Impact
                  </h3>
                  <p 
                    style={{ 
                      color: "#545454", 
                      fontSize: "12.25px", 
                      fontWeight: 400, 
                      lineHeight: "17.50px" 
                    }}
                  >
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
                style={{
                  fontSize: "12.25px",
                  fontWeight: 400
                }}
                required
              />
              <Button 
                type="submit" 
                className="w-full h-12"
                style={{
                  background: "#00AAFE",
                  color: "white",
                  fontSize: "12.25px",
                  fontWeight: 500,
                  lineHeight: "17.50px"
                }}
              >
                Learn More
              </Button>
            </form>

            <p 
              className="mt-4"
              style={{ 
                color: "#545454", 
                fontSize: "12.25px", 
                fontStyle: "italic", 
                fontWeight: 400, 
                lineHeight: "17.50px" 
              }}
            >
              Ready to make an impact? Connect with us through the marketplace to learn more about community programs.
            </p>
          </div>

          {/* Right Image */}
          <div className="relative flex justify-center lg:justify-end">
            <img 
              src="/images/community-player-celebrating.png" 
              alt="Community member celebrating" 
              className="w-full max-w-[392px] h-auto"
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
