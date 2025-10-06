import { useState } from "react";
import { UserPlus, Search, Rocket, Award, BarChart3, Settings } from "lucide-react";
import { motion } from 'framer-motion';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

interface HowItWorksProps {
  defaultView?: 'teams' | 'brands';
  showToggle?: boolean;
}

const ProductSection = ({ defaultView = 'brands', showToggle = true }: HowItWorksProps = {}) => {
  const contentData = {
    teams: {
      title: "How It Works",
      subtitle: "Get started in minutes and start securing sponsorships for your team",
      steps: [
        {
          number: "1",
          title: "Create Your Team Profile", 
          description: "Automatically create a profile with your website URL.",
          icon: UserPlus
        },
        {
          number: "2", 
          title: "Upload Sponsorship Packages",
          description: "Have Sponsa analyze sponsorship PDFs, URLs or answer a few questions to automatically build your packages.",
          icon: Settings
        },
        {
          number: "3",
          title: "Track & Manage", 
          description: "Manage sponsors, activations and admin from your portal.",
          icon: BarChart3
        }
      ]
    },
    brands: {
      title: "How It Works",
      subtitle: "Launch authentic youth sports sponsorships in three simple steps",
      steps: [
        {
          number: "1",
          title: "Get Matched or Explore",
          description: "Allow Sponsa to match you or browse youth teams by sport, location or offer type.",
          icon: Search
        },
        {
          number: "2",
          title: "Select Sponsorship Package", 
          description: "Choose the sponsorship packages that align with your goals.",
          icon: Award
        },
        {
          number: "3",
          title: "Track & Report",
          description: "Manage activations and get analytics on sponsorship performance and impact.",
          icon: BarChart3
        }
      ]
    }
  };

  const [activeTab, setActiveTab] = useState<'teams' | 'brands'>(defaultView);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: stepsRef, isVisible: stepsVisible } = useScrollAnimation();

  const currentContent = contentData[activeTab];

  return (
    <section 
      id="product"
      className="py-12 sm:py-16 lg:py-20 px-4" 
      style={{ backgroundColor: 'rgba(255, 184, 45, 0.1)' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headerVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-8 lg:mb-10"
        >
          <h2 
            className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-[#545454] mb-4"
            style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.05em' }}
          >
            How It <span style={{ color: '#00aafe' }}>Works</span><span style={{ color: '#ffb82d' }}>.</span>
          </h2>
          <p 
            className="max-w-3xl mx-auto mb-8"
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: 'clamp(16px, 3vw, 18px)',
              color: '#64748b',
              fontWeight: 400
            }}
          >
            {currentContent.subtitle}
          </p>
        </motion.div>

        {/* Toggle Section */}
        {showToggle && (
          <div className="flex justify-center mb-12 lg:mb-14">
            <div className="inline-flex items-center bg-white rounded-full p-1.5 shadow-md border border-gray-100">
              <button
                onClick={() => setActiveTab('brands')}
                className={`px-6 sm:px-8 py-2.5 sm:py-3 rounded-full transition-all duration-300 ${
                  activeTab === 'brands'
                    ? 'bg-[#00aafe] text-white shadow-lg'
                    : 'text-[#545454] hover:text-[#00aafe]'
                }`}
                style={{ 
                  fontFamily: 'Poppins', 
                  fontWeight: activeTab === 'brands' ? 600 : 500,
                  fontSize: '15px'
                }}
              >
                Brands
              </button>
              <button
                onClick={() => setActiveTab('teams')}
                className={`px-6 sm:px-8 py-2.5 sm:py-3 rounded-full transition-all duration-300 ${
                  activeTab === 'teams'
                    ? 'bg-[#00aafe] text-white shadow-lg'
                    : 'text-[#545454] hover:text-[#00aafe]'
                }`}
                style={{ 
                  fontFamily: 'Poppins', 
                  fontWeight: activeTab === 'teams' ? 600 : 500,
                  fontSize: '15px'
                }}
              >
                Youth Sports
              </button>
            </div>
          </div>
        )}
        {!showToggle && <div className="mb-12 lg:mb-14" />}

        {/* Steps Grid Section */}
        <div ref={stepsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {currentContent.steps.map((step, index) => {
            const isHovered = hoveredIndex === index;
            return (
              <motion.div
                key={`${activeTab}-${index}`}
                initial={{ opacity: 0, y: 40 }}
                animate={stepsVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.15,
                  ease: "easeOut" 
                }}
                className="group relative bg-white rounded-2xl overflow-hidden transition-all duration-500 ease-out cursor-pointer"
                style={{
                  boxShadow: isHovered 
                    ? '0 20px 40px rgba(0, 170, 254, 0.2), 0 0 0 2px rgba(0, 170, 254, 0.15)' 
                    : '0 4px 12px rgba(0, 0, 0, 0.08)',
                  transform: isHovered ? 'translateY(-8px)' : 'translateY(0)'
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Left Accent Bar */}
                <div 
                  className="absolute top-0 left-0 bottom-0 w-1 transition-all duration-500"
                  style={{ background: '#00aafe' }}
                />

                {/* Background Gradient Overlay */}
                <div 
                  className="absolute inset-0 transition-opacity duration-500"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 170, 254, 0.03) 0%, rgba(255, 184, 45, 0.03) 100%)',
                    opacity: isHovered ? 1 : 0
                  }}
                />

                {/* Card Content */}
                <div className="relative p-6 lg:p-8">
                  {/* Number Badge */}
                  <div className="mb-5">
                    <div 
                      className="flex items-center justify-center w-12 h-12 rounded-full transition-all duration-500"
                      style={{
                        background: isHovered
                          ? 'linear-gradient(135deg, #00aafe 0%, #0088cc 100%)'
                          : 'rgba(0, 170, 254, 0.1)',
                      }}
                    >
                      <span 
                        className="transition-all duration-500"
                        style={{
                          fontFamily: 'Poppins',
                          fontSize: '18px',
                          fontWeight: 700,
                          color: isHovered ? '#ffffff' : '#00aafe'
                        }}
                      >
                        {step.number}
                      </span>
                    </div>
                  </div>

                  {/* Step Title */}
                  <h3 
                    className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 transition-colors duration-300"
                    style={{
                      color: isHovered ? '#00aafe' : '#545454',
                      lineHeight: '1.3'
                    }}
                  >
                    {step.title}
                  </h3>

                  {/* Step Description */}
                  <p 
                    className="text-sm sm:text-base leading-relaxed" 
                    style={{ color: '#545454', opacity: 0.75 }}
                  >
                    {step.description}
                  </p>

                  {/* Decorative Element */}
                  <div 
                    className="absolute bottom-0 right-0 w-24 h-24 transition-opacity duration-500"
                    style={{
                      background: 'radial-gradient(circle at center, rgba(0, 170, 254, 0.08) 0%, transparent 70%)',
                      opacity: isHovered ? 1 : 0
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
