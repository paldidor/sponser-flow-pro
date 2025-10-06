import { useState } from "react";
import { ArrowRight } from "lucide-react";

const HowItWorksSection = () => {
  const [hoveredButton, setHoveredButton] = useState<number | null>(null);

  const sections = [
    {
      badge: "For Local Teams & Leagues",
      title: (
        <>
          Create your <span style={{ color: '#00aafe' }}>team profile</span>, launch offers & get <span style={{ color: '#00aafe' }}>funded</span><span style={{ color: '#ffb82d' }}>.</span>
        </>
      ),
      description: "The all in one platform designed to make sponsorships simple. Build your profile, launch offers & get funded—all in just a few clicks.",
      bullets: [
        "Create your profile & launch offers in minutes",
        "Manage sponsors & track funding progress",
        "Automate sponsor payments & renewals",
        "Track activation tasks & deliverables",
        "Access reporting & analytics",
        "Receive payments directly to your bank"
      ],
      ctaText: "Get Started Free",
      imageUrl: "/images/how-it-works-local-teams.png",
      imagePosition: "right"
    },
    {
      badge: "For Competitive Clubs & Facilities",
      title: (
        <>
          Maximize your <span style={{ color: '#00aafe' }}>revenue</span> & streamline sponsorship <span style={{ color: '#00aafe' }}>operations</span><span style={{ color: '#ffb82d' }}>.</span>
        </>
      ),
      description: "Scale your sponsorship program with enterprise-grade tools. Manage multiple teams, automate workflows, and unlock new revenue streams.",
      bullets: [
        "Multi-team management dashboard",
        "White-label sponsorship marketplace",
        "Advanced analytics & revenue tracking",
        "Automated sponsor onboarding & contracts",
        "Custom branding & sponsor tiers",
        "Dedicated account support"
      ],
      ctaText: "Learn more",
      imageUrl: "/images/how-it-works-competitive-clubs.png",
      imagePosition: "left"
    },
    {
      badge: "For Brands & Businesses",
      title: (
        <>
          Discover teams, manage all your <span style={{ color: '#00aafe' }}>sponsorships</span> in one place<span style={{ color: '#ffb82d' }}>.</span>
        </>
      ),
      description: "Find the perfect youth sports sponsorship opportunities. Connect with teams, track ROI, and build lasting community relationships.",
      bullets: [
        "Browse verified teams & opportunities",
        "Compare packages & pricing instantly",
        "Manage all sponsorships in one dashboard",
        "Track deliverables & campaign performance",
        "Automated billing & renewals",
        "Measure community impact & engagement"
      ],
      ctaText: "Get Started Free",
      imageUrl: "/images/how-it-works-brands.png",
      imagePosition: "right"
    }
  ];

  return (
    <section 
      id="how-it-works"
      className="py-12 sm:py-16 lg:py-20 px-4 bg-white"
    >
      <div className="max-w-7xl mx-auto">
        {/* Main Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 
            className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold mb-4"
            style={{ 
              fontFamily: 'Poppins, sans-serif', 
              letterSpacing: '-0.05em' 
            }}
          >
            <span style={{ color: '#545454' }}>Sponsa Makes It </span>
            <span style={{ color: '#00aafe' }}>Easy</span>
            <span style={{ color: '#ffb82d' }}>.</span>
          </h2>
          <p 
            className="max-w-3xl mx-auto"
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: 'clamp(16px, 3vw, 18px)',
              color: '#64748b',
              fontWeight: 400
            }}
          >
            From setup to payouts, Sponsa handles the hard parts so you can focus on the game.
          </p>
        </div>

        {/* Three Subsections */}
        <div className="space-y-16 lg:space-y-24">
          {sections.map((section, index) => (
            <div 
              key={index}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center ${
                section.imagePosition === 'left' ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Text Content */}
              <div className={`${section.imagePosition === 'left' ? 'lg:order-2' : 'lg:order-1'}`}>
                {/* Yellow Badge */}
                <div className="mb-4">
                  <span 
                    className="inline-block px-4 py-2 rounded-full text-sm font-semibold text-white"
                    style={{ 
                      backgroundColor: '#ffb82d',
                      fontFamily: 'Poppins, sans-serif'
                    }}
                  >
                    {section.badge}
                  </span>
                </div>

                {/* Title */}
                <h3 
                  className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4"
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    color: '#545454',
                    lineHeight: '1.3'
                  }}
                >
                  {section.title}
                </h3>

                {/* Description */}
                <p 
                  className="mb-6"
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 'clamp(15px, 2.5vw, 16px)',
                    color: '#64748b',
                    fontWeight: 400,
                    lineHeight: '1.6'
                  }}
                >
                  {section.description}
                </p>

                {/* Bullet List */}
                <ul className="space-y-3 mb-8">
                  {section.bullets.map((bullet, bulletIndex) => (
                    <li key={bulletIndex} className="flex items-start gap-3">
                      {/* Custom Checkmark */}
                      <div 
                        className="flex-shrink-0 mt-0.5"
                        style={{
                          width: '24px',
                          height: '24px',
                          backgroundColor: '#ffb82d',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <svg
                          width="14"
                          height="10"
                          viewBox="0 0 14 10"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M5 13l4 4L19 7"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            transform="translate(-4, -6)"
                          />
                        </svg>
                      </div>
                      <span 
                        style={{
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '15px',
                          color: '#545454',
                          fontWeight: 400,
                          lineHeight: '1.6'
                        }}
                      >
                        {bullet}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onMouseEnter={() => setHoveredButton(index)}
                  onMouseLeave={() => setHoveredButton(null)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                  style={{
                    backgroundColor: '#00aafe',
                    color: 'white',
                    fontFamily: 'Poppins, sans-serif',
                    transform: hoveredButton === index ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: hoveredButton === index 
                      ? '0 8px 24px rgba(0, 170, 254, 0.3)' 
                      : '0 4px 12px rgba(0, 170, 254, 0.2)'
                  }}
                >
                  {section.ctaText}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {/* Image */}
              <div className={`${section.imagePosition === 'left' ? 'lg:order-1' : 'lg:order-2'}`}>
                <img
                  src={section.imageUrl}
                  alt={section.badge}
                  className="w-full rounded-2xl shadow-lg"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
