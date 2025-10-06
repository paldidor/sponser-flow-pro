import { useState } from 'react';

const WhyItMattersSection = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const cardData = [
    {
      icon: "/icons/feature-automated-setup.png",
      title: "Automated Setup",
      description: "Generate team profiles and sponsorship packages from your info automatically."
    },
    {
      icon: "/icons/feature-smart-matching.png",
      title: "Smart Sponsor Matching",
      description: "Get connected with businesses and brands actively looking to support teams like yours."
    },
    {
      icon: "/icons/feature-marketplace.png",
      title: "Marketplace",
      description: "Sponsors can get matched or explore and filter through opportunities."
    },
    {
      icon: "/icons/feature-management.png",
      title: "End-to-End Management",
      description: "Track offers, activations, renewals and deliverables in one place, so nothing falls through the cracks."
    },
    {
      icon: "/icons/feature-tracking.png",
      title: "Track Everything",
      description: "Teams see their funding and details, brands get analytics, reporting and insights."
    },
    {
      icon: "/icons/feature-payments.png",
      title: "Secure Payments",
      description: "Fast, reliable payments directly to your team — no waiting, no hassle."
    }
  ];

  return (
    <section 
      className="w-full py-16 sm:py-20 lg:py-20 px-4 sm:px-6 lg:px-8"
      style={{ background: 'rgba(255, 184, 45, 0.1)' }}
    >
      <div className="max-w-[1280px] mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4"
            style={{ letterSpacing: '-0.05em' }}
          >
            <span style={{ color: '#545454' }}>Youth Sports Sponsorships, </span>
            <span style={{ color: '#00aafe' }}>Simplified</span>
            <span style={{ color: '#ffb82d' }}>.</span>
          </h2>
          <p 
            className="text-base sm:text-lg mx-auto max-w-4xl"
            style={{ color: '#64748b' }}
          >
            Everything youth teams at all levels need to get funding and brands to get and manage sponsorships.
          </p>
        </div>

        {/* 6-Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cardData.map((card, index) => {
            const isHovered = hoveredCard === index;
            
            return (
              <div
                key={index}
                className="relative bg-white rounded-xl border-2 p-6 cursor-pointer transition-all duration-500 ease-out"
                style={{
                  borderColor: isHovered ? 'rgba(0, 170, 254, 0.5)' : 'rgba(0, 0, 0, 0.08)',
                  boxShadow: isHovered 
                    ? '0 12px 24px rgba(0, 170, 254, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08)'
                    : '0 2px 8px rgba(0, 0, 0, 0.04)',
                  transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                  background: isHovered 
                    ? 'linear-gradient(135deg, rgba(0, 170, 254, 0.02) 0%, rgba(0, 170, 254, 0.04) 100%)'
                    : 'white'
                }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Left Accent Bar */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                  style={{ background: 'linear-gradient(180deg, #00aafe 0%, #0088cc 100%)' }}
                />

                {/* Icon */}
                <img 
                  src={card.icon} 
                  alt="" 
                  className="w-10 h-10 mb-4 transition-transform duration-300"
                  style={{ 
                    filter: 'brightness(0) saturate(100%) invert(56%) sepia(91%) saturate(2663%) hue-rotate(175deg) brightness(101%) contrast(101%)',
                    transform: isHovered ? 'scale(1.1)' : 'scale(1)'
                  }}
                />

                {/* Title */}
                <h3 
                  className="text-lg font-semibold mb-3 transition-colors duration-300"
                  style={{ 
                    color: isHovered ? '#00aafe' : '#1a1a2e',
                    lineHeight: '1.4'
                  }}
                >
                  {card.title}
                </h3>

                {/* Description */}
                <p 
                  className="text-sm" 
                  style={{ color: '#545454', lineHeight: '1.6' }}
                >
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyItMattersSection;
