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
    <section className="relative w-full overflow-hidden" style={{ fontFamily: 'Poppins, sans-serif', minHeight: '760px' }}>
      {/* Full-width background gradient */}
      <div 
        className="absolute inset-0 w-full" 
        style={{ 
          background: 'linear-gradient(180deg, #B8E6FE 0%, #DFF2FE 50%, #EFF6FF 100%)' 
        }}
      />

      {/* Animated clouds - full width */}
      <div className="absolute inset-0 w-full pointer-events-none overflow-hidden">
          <img 
            src="/images/cloud-animation.png" 
            alt="" 
            className="absolute animate-[drift-very-slow_60s_linear_infinite]"
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
            className="absolute animate-[drift-slow_45s_linear_infinite]"
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
            className="absolute animate-[drift-moderate_30s_linear_infinite]"
            style={{ 
              width: '126px', 
              height: '126px', 
              left: '118.84px', 
              top: '112px', 
              opacity: 0.90 
            }}
          />
      </div>

      {/* Grass footer - full width */}
      <div 
        className="absolute left-0 w-full overflow-hidden" 
        style={{ 
          height: '84px', 
          bottom: '0px' 
        }}
      >
        <img 
          src="/images/grass-background.png" 
          alt="" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Centered content container */}
      <div className="container mx-auto px-4 lg:px-8 relative" style={{ maxWidth: '1359px', height: '760px' }}>
        {/* Hero image - coach and players */}
        <img
          src="/images/hero-coach-players-banner.png" 
          alt="Coach and youth players with sponsorship banner" 
          className="absolute"
          style={{ 
            width: '504px', 
            height: '336px', 
            left: '791.50px', 
            top: '392px',
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)'
          }}
        />

        {/* Main content */}
        <div 
          className="absolute" 
          style={{ 
            width: '539px', 
            left: '119.50px', 
            top: '140px' 
          }}
        >
          {/* Heading */}
          <div className="relative" style={{ height: '150px', marginBottom: '21px' }}>
            {/* Line 1: Sponsor Youth Teams. */}
            <div style={{ height: '84px', position: 'relative', marginBottom: '-4.5px' }}>
              <span style={{ 
                color: '#545454', 
                fontSize: '60px', 
                fontWeight: 700, 
                lineHeight: '75px' 
              }}>
                Sponsor{' '}
              </span>
              <span style={{ 
                color: '#00AAFE', 
                fontSize: '60px', 
                fontWeight: 700, 
                lineHeight: '75px' 
              }}>
                Youth Teams
              </span>
              <span style={{ 
                color: '#FFB82D', 
                fontSize: '60px', 
                fontWeight: 700, 
                lineHeight: '75px' 
              }}>
                .
              </span>
            </div>

            {/* Line 2: Boost Your Brand. */}
            <div style={{ height: '84px', position: 'relative' }}>
              <span style={{ 
                color: '#545454', 
                fontSize: '60px', 
                fontWeight: 700, 
                lineHeight: '75px' 
              }}>
                Boost Your{' '}
              </span>
              <span style={{ 
                color: '#00AAFE', 
                fontSize: '60px', 
                fontWeight: 700, 
                lineHeight: '75px' 
              }}>
                Brand
              </span>
              <span style={{ 
                color: '#FFB82D', 
                fontSize: '60px', 
                fontWeight: 700, 
                lineHeight: '75px' 
              }}>
                .
              </span>
            </div>
          </div>

          {/* Paragraph */}
          <div style={{ marginBottom: '27px' }}>
            <p style={{ 
              width: '533px',
              color: '#545454', 
              fontSize: '20px', 
              fontWeight: 400, 
              lineHeight: '32.5px' 
            }}>
              Get and manage all your youth sports sponsorships in one place. Support local communities while driving measurable results for your brand or business.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="relative" style={{ width: '448px', height: '42px' }}>
            {/* Input field */}
            <div 
              className="absolute left-0 top-0"
              style={{ 
                width: '316.88px', 
                height: '42px' 
              }}
            >
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-full bg-white outline-none"
                style={{ 
                  paddingLeft: '38.50px',
                  paddingRight: '10.50px',
                  paddingTop: '3.50px',
                  paddingBottom: '3.50px',
                  borderRadius: '12.75px',
                  border: '2px solid #E5E7EB',
                  boxShadow: '0px 1px 2px -1px rgba(0, 0, 0, 0.10)',
                  color: '#717182',
                  fontSize: '12.25px',
                  fontFamily: 'Poppins, sans-serif'
                }}
              />
              <Mail 
                className="absolute"
                style={{ 
                  width: '17.50px', 
                  height: '17.50px', 
                  left: '10.50px', 
                  top: '12.25px',
                  color: '#0A0A0A'
                }}
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              className="absolute"
              style={{ 
                width: '120.62px',
                height: '42px',
                left: '327.38px',
                top: '0px',
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
            transform: translateX(calc(-478.70px + 100vw + 98px)) translateY(-15px);
          }
        }
        
        @keyframes drift-moderate {
          0% {
            transform: translateX(0) translateY(0);
          }
          100% {
            transform: translateX(calc(-118.84px + 100vw + 126px)) translateY(-5px);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 1400px) {
          section > div {
            transform: scale(0.85);
            transform-origin: top center;
            height: 646px !important;
          }
        }

        @media (max-width: 1200px) {
          section > div {
            transform: scale(0.70);
            transform-origin: top center;
            height: 532px !important;
          }
        }

        @media (max-width: 1000px) {
          section > div {
            transform: scale(0.55);
            transform-origin: top center;
            height: 418px !important;
          }
        }

        @media (max-width: 768px) {
          section > div {
            transform: scale(0.45);
            transform-origin: top center;
            height: 342px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
