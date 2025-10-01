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
    <section className="relative w-full overflow-hidden" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Background gradient - full width */}
      <div 
        className="absolute inset-0 w-full" 
        style={{ 
          background: 'linear-gradient(180deg, #B8E6FE 0%, #DFF2FE 50%, #EFF6FF 100%)' 
        }}
      />

      {/* Animated clouds - full width - responsive */}
      <div className="absolute inset-0 w-full pointer-events-none overflow-hidden">
        {/* Desktop clouds */}
        <img 
          src="/images/cloud-animation.png" 
          alt="" 
          className="hidden xl:block absolute animate-[drift-very-slow_60s_linear_infinite]"
          style={{ 
            width: '70px', 
            height: '70px', 
            left: '1332.72px', 
            top: '14px', 
            opacity: 0.60 
          }}
        />
        <img 
          src="/images/cloud-animation.png" 
          alt="" 
          className="hidden xl:block absolute animate-[drift-slow_45s_linear_infinite]"
          style={{ 
            width: '98px', 
            height: '98px', 
            left: '478.70px', 
            top: '28px', 
            opacity: 0.80 
          }}
        />
        <img 
          src="/images/cloud-animation.png" 
          alt="" 
          className="hidden xl:block absolute animate-[drift-moderate_30s_linear_infinite]"
          style={{ 
            width: '126px', 
            height: '126px', 
            left: '118.84px', 
            top: '112px', 
            opacity: 0.90 
          }}
        />

        {/* Tablet/Mobile simplified clouds */}
        <img 
          src="/images/cloud-animation.png" 
          alt="" 
          className="xl:hidden absolute animate-[drift-slow_45s_linear_infinite]"
          style={{ 
            width: '60px', 
            height: '60px', 
            left: '10%', 
            top: '20px', 
            opacity: 0.70 
          }}
        />
        <img 
          src="/images/cloud-animation.png" 
          alt="" 
          className="xl:hidden absolute animate-[drift-moderate_35s_linear_infinite]"
          style={{ 
            width: '80px', 
            height: '80px', 
            right: '15%', 
            top: '40px', 
            opacity: 0.60 
          }}
        />
      </div>

      {/* Grass footer - full width */}
      <div className="absolute left-0 w-full overflow-hidden bottom-0 h-[60px] md:h-[70px] xl:h-[84px]">
        <img 
          src="/images/grass-background.png" 
          alt="" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content container - responsive */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative min-h-[500px] md:min-h-[600px] xl:min-h-[760px]">
        {/* Hero image - coach and players - SINGLE responsive image sitting on grass */}
        <img 
          src="/images/hero-coach-players-banner.png" 
          alt="Coach and youth players with sponsorship banner" 
          className="absolute w-[200px] sm:w-[280px] lg:w-[350px] xl:w-[504px] h-auto bottom-[20px] md:bottom-[25px] xl:bottom-[30px] left-1/2 -translate-x-1/2 sm:left-auto sm:right-8 sm:translate-x-0 xl:right-[63.50px] z-10"
        />

        {/* Main content - responsive layout with proper max-width to accommodate image */}
        <div className="relative pt-16 md:pt-24 xl:pt-[140px] pb-24 md:pb-32 xl:pb-0 w-full flex flex-col items-center sm:items-start sm:max-w-[calc(100%-300px)] lg:max-w-[calc(100%-370px)] xl:max-w-[539px]">
          {/* Heading - responsive typography */}
          <div className="relative mb-4 md:mb-5 xl:mb-[21px] text-center sm:text-left">
            {/* Line 1: Sponsor Youth Teams (single line) */}
<h1 className="whitespace-nowrap text-[28px] leading-[36px] sm:text-[36px] sm:leading-[45px] md:text-[48px] md:leading-[60px] xl:text-[60px] xl:leading-[75px] font-bold mb-0">
  <span style={{ color: '#545454' }}>Sponsor</span>{'\u00A0'}
  <span style={{ color: '#00AAFE' }}>Youth Teams</span>
  <span style={{ color: '#FFB82D' }}>.</span>
</h1>

{/* Line 2: Boost Your Brand (single line) */}
<h2 className="whitespace-nowrap text-[28px] leading-[36px] sm:text-[36px] sm:leading-[45px] md:text-[48px] md:leading-[60px] xl:text-[60px] xl:leading-[75px] font-bold mt-0">
  <span style={{ color: '#545454' }}>Boost</span>{'\u00A0'}
  <span style={{ color: '#00AAFE' }}>Your Brand</span>
  <span style={{ color: '#FFB82D' }}>.</span>
</h2>
          </div>

          {/* Paragraph - responsive typography */}
          <div className="mb-6 md:mb-7 xl:mb-[27px] text-center sm:text-left">
            <p className="text-sm leading-6 sm:text-base sm:leading-7 md:text-lg md:leading-8 xl:text-[20px] xl:leading-[32.5px] font-normal max-w-full xl:max-w-[533px]" 
               style={{ color: '#545454' }}>
              Get and manage all your youth sports sponsorships in one place. Support local communities while driving measurable results for your brand or business.
            </p>
          </div>

          {/* Form - responsive layout */}
          <form onSubmit={handleSubmit} className="w-full max-w-full sm:max-w-[448px]">
            <div className="flex flex-col items-center sm:items-start sm:flex-row gap-3 sm:gap-0 sm:relative">
              {/* Input field */}
              <div className="relative flex-1 sm:flex-none sm:w-[316.88px]">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-[42px] bg-white outline-none pl-[38.50px] pr-[10.50px] py-[3.50px]"
                  style={{ 
                    borderRadius: '12.75px',
                    border: '2px solid #E5E7EB',
                    boxShadow: '0px 1px 2px -1px rgba(0, 0, 0, 0.10)',
                    color: '#717182',
                    fontSize: '12.25px',
                    fontFamily: 'Poppins, sans-serif'
                  }}
                />
                <Mail 
                  className="absolute left-[10.50px] top-[12.25px]"
                  style={{ 
                    width: '17.50px', 
                    height: '17.50px',
                    color: '#0A0A0A'
                  }}
                />
              </div>

              {/* Button */}
              <button
                type="submit"
                className="h-[42px] w-auto sm:absolute sm:left-[327.38px] sm:top-0 transition-opacity"
                style={{ 
                  background: '#00AAFE',
                  opacity: 0.50,
                  borderRadius: '12.75px',
                  boxShadow: '0px 4px 6px -4px rgba(0, 0, 0, 0.10)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 600,
                  lineHeight: '21px',
                  fontFamily: 'Poppins, sans-serif',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '7px 21px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.70';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.50';
                }}
              >
                Learn More
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes drift-very-slow {
          0% {
            transform: translateX(0) translateY(0);
          }
          100% {
            transform: translateX(calc(-1332.72px + 100vw + 70px)) translateY(-10px);
          }
        }
        
        @keyframes drift-slow {
          0% {
            transform: translateX(0) translateY(0);
          }
          100% {
            transform: translateX(calc(100vw + 100px)) translateY(-15px);
          }
        }
        
        @keyframes drift-moderate {
          0% {
            transform: translateX(0) translateY(0);
          }
          100% {
            transform: translateX(calc(100vw + 120px)) translateY(-5px);
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
