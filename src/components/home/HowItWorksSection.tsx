const HowItWorksSection = () => {
  const steps = [
    {
      number: "1",
      title: "One Place to Manage Sponsorships",
      description: "No more chasing teams one at a time, trying to manage it all. Sponsa centralizes all your youth sports sponsorships in a single, easy-to-use platform.",
    },
    {
      number: "2",
      title: "Measured Community Impact",
      description: "Get analytics and insights into your sponsorships and the impact they drive. Sponsa makes sponsorships a transparent, trackable marketing channel.",
    },
    {
      number: "3",
      title: "Local Reach That Builds Loyalty",
      description: "Your brand shows up where it matters most—on the field, in the stands, and across the community—creating lasting loyalty with families.",
    }
  ];

  return (
    <section 
      className="w-full py-16 lg:py-24 px-4 sm:px-8"
      style={{ background: 'rgba(255, 184, 45, 0.10)' }}
    >
      <div className="max-w-[1120px] mx-auto">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-[43.50px]">
          <h2 className="text-3xl lg:text-[42px] font-[800] leading-tight lg:leading-[42px] mb-4 lg:mb-[21px]">
            <span style={{ color: '#545454' }}>Sponsa Makes It A </span>
            <span style={{ color: '#00AAFE' }}>Win-Win</span>
            <span style={{ color: '#FFB82D' }}>.</span>
          </h2>
          <p 
            className="text-base lg:text-[17.50px] font-normal leading-relaxed lg:leading-[24.50px] max-w-full lg:max-w-[672px] mx-auto px-4 opacity-80"
            style={{ color: '#545454' }}
          >
            Sponsa makes youth sports sponsorships simple, measurable, and impactful—so teams get funding, brands see results, and communities grow stronger.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-[27px] mb-12 lg:mb-[56px]">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="bg-white overflow-hidden flex flex-col"
              style={{ 
                borderRadius: '8.75px',
                border: '1px solid #E5E7EB',
                width: '100%',
                maxWidth: '354.66px',
                margin: '0 auto'
              }}
            >
              {/* Orange top stripe */}
              <div 
                style={{ 
                  width: '100%',
                  height: '3.50px',
                  background: '#FFB82D'
                }}
              />
              
              {/* Card content */}
              <div 
                className="flex flex-col gap-[14px]"
                style={{ padding: '28px' }}
              >
                {/* Title with step number */}
                <div className="relative flex items-start gap-[14px]">
                  {/* Transparent step number as watermark */}
                  <div 
                    className="font-[900] leading-[42px] shrink-0"
                    style={{ 
                      fontSize: '42px',
                      color: 'rgba(0, 0, 0, 0)',
                      WebkitTextStroke: '1px rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    {step.number}
                  </div>
                  
                  <h3 
                    className="font-[700] leading-[21.88px] pt-[3.50px]"
                    style={{ 
                      color: '#545454',
                      fontSize: '17.50px'
                    }}
                  >
                    {step.title}
                  </h3>
                </div>
                
                {/* Description */}
                <p 
                  className="font-normal leading-[22.75px] opacity-75"
                  style={{ 
                    color: '#545454',
                    fontSize: '14px'
                  }}
                >
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Mascot */}
        <div className="flex justify-center">
          <img 
            src="/images/community-player-celebrating.png" 
            alt="Happy youth sports player celebrating with Sponsa cap and water bottle" 
            className="w-full max-w-[252px] h-auto"
          />
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
