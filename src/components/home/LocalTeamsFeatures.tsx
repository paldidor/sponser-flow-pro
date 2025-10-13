import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Zap, Target, FileCheck, Shield, LucideIcon } from 'lucide-react';
import characterImage from "@/assets/images/mascot-celebrating.png";

interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
}

interface LocalTeamsFeaturesProps {
  headerText?: string;
  subheaderText?: string;
  features?: Feature[];
  highlightWord?: string;
  gridCols?: 'three' | 'four';
  customCharacterImage?: string;
}

const defaultFeatures: Feature[] = [
  {
    title: "Automated Setup",
    description: "Generate team profiles and sponsorship packages from your info automatically.",
    icon: Zap
  },
  {
    title: "Smart Sponsor Matching",
    description: "Get connected with businesses and brands actively looking to support teams like yours.",
    icon: Target
  },
  {
    title: "End-to-End Management",
    description: "Track offers, activations, and sponsor deliverables in one place, so nothing falls through the cracks.",
    icon: FileCheck
  },
  {
    title: "Secure Payments",
    description: "Fast, reliable payments directly to your team — no waiting, no hassle.",
    icon: Shield
  }
];

export function LocalTeamsFeatures({ 
  headerText = "Enhance Fundraising with Sponsorships.",
  subheaderText = "Built to ease fundraising, Sponsa streamlines sponsorships so your team spends less time chasing dollars and more time playing.",
  features = defaultFeatures,
  highlightWord = "Sponsorships",
  gridCols = 'four',
  customCharacterImage
}: LocalTeamsFeaturesProps = {}) {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation();
  const { ref: characterRef, isVisible: characterVisible } = useScrollAnimation();

  const renderHighlightedText = (text: string, highlight: string) => {
    if (!text.includes(highlight)) {
      return text;
    }

    const parts = text.split(highlight);
    return (
      <>
        {parts[0]}
        <span style={{ color: '#00aafe' }}>{highlight}</span>
        {parts[1]}
      </>
    );
  };

  return (
    <section className="py-16 sm:py-20 lg:py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'rgba(255, 184, 45, 0.1)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={headerVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 
            className="mb-4" 
            style={{ 
              fontFamily: 'Poppins', 
              fontWeight: 700, 
              fontSize: 'clamp(28px, 5vw, 40px)', 
              color: '#545454', 
              lineHeight: '1.2' 
            }}
          >
            {renderHighlightedText(headerText, highlightWord)}
          </h2>
          <p 
            className="max-w-3xl mx-auto" 
            style={{ 
              fontFamily: 'Poppins', 
              fontWeight: 400, 
              fontSize: '16px', 
              color: '#64748b', 
              lineHeight: '1.6' 
            }}
          >
            {subheaderText}
          </p>
        </motion.div>

        {/* Features Grid */}
        <div 
          ref={gridRef} 
          className={`grid grid-cols-1 sm:grid-cols-2 ${gridCols === 'three' ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-6`}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={gridVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                className="group relative bg-white rounded-xl p-6 transition-all duration-300 hover:shadow-xl"
                style={{
                  border: '1px solid #e5e7eb',
                  borderLeft: '4px solid #00aafe',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderLeftColor = '#ffb82d';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderLeftColor = '#00aafe';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Icon */}
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-all duration-300"
                  style={{ backgroundColor: 'rgba(0, 170, 254, 0.1)' }}
                >
                  <Icon size={24} style={{ color: '#00aafe' }} />
                </div>

                {/* Title */}
                <h3 
                  className="mb-2" 
                  style={{ 
                    fontFamily: 'Poppins', 
                    fontWeight: 600, 
                    fontSize: '18px', 
                    color: '#545454' 
                  }}
                >
                  {feature.title}
                </h3>

                {/* Description */}
                <p 
                  style={{ 
                    fontFamily: 'Poppins', 
                    fontWeight: 400, 
                    fontSize: '14px', 
                    color: '#64748b', 
                    lineHeight: '1.6' 
                  }}
                >
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Character Image */}
        <motion.div
          ref={characterRef}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={characterVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="flex justify-center mt-12 sm:mt-16"
        >
          <img 
            src={customCharacterImage || characterImage} 
            alt="Sponsa mascot celebrating" 
            className="w-full max-w-[200px] sm:max-w-[280px] lg:max-w-[350px] h-auto"
          />
        </motion.div>
      </div>
    </section>
  );
}
