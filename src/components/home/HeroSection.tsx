import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface CardData {
  title: string;
  description: string;
  path: string;
}

const HeroSection = () => {
  const navigate = useNavigate();

  const cardData: CardData[] = [
    {
      title: "Local Teams & Leagues",
      description: "Boost fundraising efforts",
      path: "/select-user-type"
    },
    {
      title: "Elite Clubs & Leagues",
      description: "Scale program revenue",
      path: "/select-user-type"
    },
    {
      title: "Brands & Businesses",
      description: "Grow community engagement",
      path: "/select-user-type"
    }
  ];

  return (
    <section 
      className="relative w-full overflow-hidden pt-4 sm:pt-6 lg:pt-8 pb-0 px-4 min-h-[650px] sm:min-h-[700px] lg:min-h-[760px]"
      style={{
        background: 'linear-gradient(180deg, #B8E6FE 0%, #DFF2FE 50%, #EFF6FF 100%)',
        fontFamily: 'Poppins, sans-serif'
      }}
    >
      {/* Animated clouds - Left to Right at different speeds */}
      <img
        src="/images/clouds/slow-cloud.png"
        alt=""
        className="absolute top-[10%] left-[5%] w-32 sm:w-40 lg:w-48 h-auto opacity-70 xl:block hidden"
        style={{ animation: 'drift-slow 80s linear infinite', willChange: 'transform' }}
      />
      <img
        src="/images/clouds/medium-cloud.png"
        alt=""
        className="absolute top-[20%] right-[10%] w-28 sm:w-36 lg:w-44 h-auto opacity-60"
        style={{ animation: 'drift-medium 60s linear infinite', willChange: 'transform' }}
      />
      <img
        src="/images/clouds/moderate-cloud.png"
        alt=""
        className="absolute top-[35%] left-[15%] w-36 sm:w-44 lg:w-52 h-auto opacity-50 xl:hidden"
        style={{ animation: 'drift-moderate 50s linear infinite', willChange: 'transform' }}
      />

      {/* Content Container */}
      <div className="container mx-auto max-w-6xl relative z-20">
        {/* Heading + Subheading */}
        <div className="text-center pt-12 sm:pt-16 lg:pt-20 mb-4 sm:mb-6 lg:mb-8">
          <h1 
            className="font-extrabold leading-tight drop-shadow-sm mb-4 text-[28px] sm:text-[36px] md:text-[40px] lg:text-[48px] xl:text-[54px]"
            style={{ 
              color: '#545454',
              letterSpacing: '-0.02em'
            }}
          >
            The <span style={{ color: '#00AAFE' }}>#1</span> Way Youth Teams Get Funded<span style={{ color: '#FFB82D' }}>.</span>
          </h1>
          <p 
            className="text-base sm:text-lg lg:text-xl max-w-3xl mx-auto"
            style={{ color: '#545454' }}
          >
            Connecting youth sports orgs and brands at every level through measurable end-to-end sponsorships.
          </p>
        </div>

        {/* Three Wooden Sign Cards */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-6 max-w-4xl md:max-w-4xl lg:max-w-6xl mx-auto mb-[-80px] sm:mb-[-96px] lg:mb-[-120px]">
          {cardData.map((card, index) => (
            <div 
              key={index}
              onClick={() => navigate(card.path)}
              className="relative cursor-pointer group transition-all duration-300 hover:-translate-y-2"
            >
              {/* Mobile Layout */}
              <div className="md:hidden relative">
                <img 
                  src="/images/wooden-sign.png" 
                  alt="" 
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center px-6 py-8">
                  <h3 className="text-lg font-extrabold text-center mb-2" style={{ color: '#00AAFE' }}>
                    {card.title}
                  </h3>
                  <p className="text-base text-center mb-4" style={{ color: 'rgba(84, 84, 84, 0.7)' }}>
                    {card.description}
                  </p>
                  <div className="flex items-center gap-1 group-hover:gap-2 transition-all">
                    <span className="text-base" style={{ color: '#00AAFE' }}>Learn more</span>
                    <ArrowRight className="w-4 h-4" style={{ color: '#00AAFE' }} />
                  </div>
                </div>
              </div>

              {/* Desktop/Tablet Layout */}
              <div className="hidden md:block relative">
                <img 
                  src="/images/wooden-sign.png" 
                  alt="" 
                  className="w-full h-auto scale-125 origin-center"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-start pt-[18%] pb-[22%] px-8">
                  <h3 className="text-sm lg:text-base xl:text-lg font-extrabold text-center mb-2" style={{ color: '#00AAFE' }}>
                    {card.title}
                  </h3>
                  <p className="text-xs lg:text-sm xl:text-base text-center mb-4" style={{ color: 'rgba(84, 84, 84, 0.7)' }}>
                    {card.description}
                  </p>
                  <div className="flex items-center gap-1 group-hover:gap-2 transition-all">
                    <span className="text-xs lg:text-sm xl:text-base" style={{ color: '#00AAFE' }}>Learn more</span>
                    <ArrowRight className="w-3 h-3 lg:w-4 lg:h-4" style={{ color: '#00AAFE' }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grass ground strip */}
      <div className="absolute bottom-0 left-0 right-0 z-10 overflow-hidden h-12 sm:h-16 lg:h-24">
        <img
          src="/images/grass-background.png"
          alt="Grass ground"
          className="w-full h-full object-cover object-bottom min-w-[100vw]"
          style={{ objectPosition: 'center bottom' }}
        />
      </div>

    </section>
  );
};

export default HeroSection;
