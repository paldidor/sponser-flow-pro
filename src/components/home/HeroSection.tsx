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
    { title: "Local Teams & Leagues", description: "Boost fundraising efforts", path: "/local-teams" },
    { title: "Elite Clubs & Leagues", description: "Scale program revenue", path: "/elite-clubs" },
    { title: "Brands & Businesses", description: "Activate youth sponsorships at scale", path: "/brands" },
  ];

  return (
    <section
      className="relative w-full overflow-hidden pt-4 sm:pt-6 lg:pt-8 pb-0 px-4
                 min-h-[900px] sm:min-h-[700px] lg:min-h-[760px]" // NEW: ensure room for overlap
      style={{
        background: "linear-gradient(180deg, #B8E6FE 0%, #DFF2FE 50%, #EFF6FF 100%)",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      {/* Clouds ... (unchanged) */}

      {/* Content Container */}
      <div className="container mx-auto max-w-6xl relative z-20">
        {/* Heading + Subheading (unchanged) */}

        {/* Three Wooden Sign Cards */}
        <div
          className="
            relative z-20
            grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-6
            max-w-4xl md:max-w-4xl lg:max-w-6xl mx-auto
            mb-[-12vh] sm:mb-[-14vh] lg:mb-[-18vh]   /* NEW: pull signs down into grass */
            pb-12 sm:pb-16 lg:pb-24
          "
        >
          {cardData.map((card, index) => (
            <div
              key={index}
              onClick={() => navigate(card.path)}
              className="relative cursor-pointer group transition-transform duration-300
                         hover:-translate-y-1" /* CHANGED: smaller hover lift */
            >
              {/* Mobile Layout */}
              <div className="md:hidden relative">
                <img src="/images/wooden-sign-mobile.png" alt="" className="w-full h-auto drop-shadow-sm" />
                <div className="absolute inset-0 flex flex-col items-center justify-center px-4 py-6">
                  <h3 className="text-sm font-extrabold text-center mb-1.5 leading-tight" style={{ color: "#00AAFE" }}>
                    {card.title}
                  </h3>
                  <p className="text-xs text-center mb-3 leading-snug" style={{ color: "rgba(84, 84, 84, 0.7)" }}>
                    {card.description}
                  </p>
                  <div className="flex items-center gap-1 group-hover:gap-2 transition-all">
                    <span className="text-xs font-medium" style={{ color: "#00AAFE" }}>
                      Learn more
                    </span>
                    <ArrowRight className="w-3 h-3" style={{ color: "#00AAFE" }} />
                  </div>
                </div>
              </div>

              {/* Desktop/Tablet Layout */}
              <div className="hidden md:block relative">
                <img src="/images/wooden-sign.png" alt="" className="w-full h-auto drop-shadow-sm" />
                <div className="absolute inset-0 flex flex-col items-center justify-start pt-[18%] pb-[22%] px-8">
                  <h3
                    className="text-sm lg:text-base xl:text-lg font-extrabold text-center mb-2"
                    style={{ color: "#00AAFE" }}
                  >
                    {card.title}
                  </h3>
                  <p
                    className="text-xs lg:text-sm xl:text-base text-center mb-4"
                    style={{ color: "rgba(84, 84, 84, 0.7)" }}
                  >
                    {card.description}
                  </p>
                  <div className="flex items-center gap-1 group-hover:gap-2 transition-all">
                    <span className="text-xs lg:text-sm xl:text-base" style={{ color: "#00AAFE" }}>
                      Learn more
                    </span>
                    <ArrowRight className="w-3 h-3 lg:w-4 lg:h-4" style={{ color: "#00AAFE" }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GRASS OVERLAY — sits ABOVE signs, with responsive height for ~25–35% cover */}
      <div
        className="absolute bottom-0 left-0 right-0 z-40 overflow-hidden pointer-events-none
                   h-[14vh] sm:h-[16vh] lg:h-[20vh]" /* NEW: tune to taste per breakpoint */
      >
        <img
          src="/images/grass-background.png"
          alt="Grass"
          className="w-full h-full object-cover object-bottom"
          style={{
            objectPosition: "center bottom",
            /* Optional soft top edge if your PNG doesn't have transparency */
            WebkitMaskImage:
              "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,.9) 35%, rgba(0,0,0,1) 55%, rgba(0,0,0,1) 100%)", // NEW
            maskImage:
              "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,.9) 35%, rgba(0,0,0,1) 55%, rgba(0,0,0,1) 100%)",
          }}
        />
      </div>
    </section>
  );
};

export default HeroSection;
