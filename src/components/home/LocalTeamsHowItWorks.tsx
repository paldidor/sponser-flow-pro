import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import profileSetupImage from "@/assets/images/how-it-works-profile.png";
import launchOffersImage from "@/assets/images/how-it-works-launch.png";
import trackManageImage from "@/assets/images/how-it-works-track.png";
import characterImage from "@/assets/images/mascot-character.png";

interface Step {
  number: string;
  title: string;
  description: string;
  imageUrl: string;
}

const defaultSteps: Step[] = [
  {
    number: "1",
    title: "Create Your Team Profile", 
    description: "Enter your website URL & Sponsa will automatically build your profile.",
    imageUrl: profileSetupImage
  },
  {
    number: "2", 
    title: "Launch Sponsorship Offers",
    description: "Upload your sponsorship PDF, URL or answer a few Qs — Sponsa builds and publishes packages fast.",
    imageUrl: launchOffersImage
  },
  {
    number: "3",
    title: "Track & Manage Everything", 
    description: "Track funding, sponsors, activations, and payments in your team portal — no spreadsheets, no stress.",
    imageUrl: trackManageImage
  }
];

export function LocalTeamsHowItWorks() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation();
  const { ref: characterRef, isVisible: characterVisible } = useScrollAnimation();

  return (
    <section className="py-16 sm:py-20 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white">
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
            Sponsa Makes It <span style={{ color: '#00aafe' }}>Easy</span><span style={{ color: '#ffb82d' }}>.</span>
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
            From setup to payment, everything is streamlined so you can focus on what matters most.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div 
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 sm:mb-16"
        >
          {defaultSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={gridVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: index * 0.15, ease: "easeOut" }}
              className="group bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl"
              style={{
                border: '1px solid #e5e7eb',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Image Section */}
              <div className="relative h-48 sm:h-56 overflow-hidden bg-gradient-to-br from-blue-50 to-yellow-50">
                <img 
                  src={step.imageUrl}
                  alt={step.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Content Section */}
              <div className="p-6">
                {/* Step Number Badge */}
                <div 
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-4"
                  style={{ backgroundColor: '#00aafe', color: '#ffffff', fontFamily: 'Poppins', fontWeight: 700, fontSize: '18px' }}
                >
                  {step.number}
                </div>

                {/* Title */}
                <h3 
                  className="mb-3" 
                  style={{ 
                    fontFamily: 'Poppins', 
                    fontWeight: 600, 
                    fontSize: '20px', 
                    color: '#545454',
                    lineHeight: '1.3'
                  }}
                >
                  {step.title}
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
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Character Image */}
        <motion.div
          ref={characterRef}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={characterVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          className="flex justify-center"
        >
          <img 
            src={characterImage} 
            alt="Sponsa mascot character" 
            className="w-full max-w-[180px] sm:max-w-[250px] lg:max-w-[300px] h-auto"
          />
        </motion.div>
      </div>
    </section>
  );
}
