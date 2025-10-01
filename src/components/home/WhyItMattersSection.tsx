const WhyItMattersSection = () => {
  const reasons = [
    {
      icon: "/icons/trending-down.svg",
      title: "Teams Struggle to Raise Funds",
    },
    {
      icon: "/icons/dollar-sign.svg",
      title: "Rising Costs Are Pricing Kids Out",
    },
    {
      icon: "/icons/clock.svg",
      title: "Coaches Are Overwhelmed",
    },
    {
      icon: "/icons/users.svg",
      title: "Communities Lose Out",
    }
  ];

  return (
    <section 
      className="w-full py-16 lg:py-[84px] px-4 sm:px-8 lg:px-[119.50px]"
      style={{
        background: 'linear-gradient(180deg, white 0%, rgba(248.98, 250.15, 251.33, 0.30) 100%)'
      }}
    >
      <div className="max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-[70px]">
          <h2 className="text-3xl lg:text-[42px] font-[800] leading-tight lg:leading-[42px] mb-4 lg:mb-[21px]">
            <span style={{ color: '#545454' }}>Why It </span>
            <span style={{ color: '#00AAFE' }}>Matters</span>
            <span style={{ color: '#FFB82D' }}>.</span>
          </h2>
          <p 
            className="text-base lg:text-[17.50px] font-normal leading-relaxed lg:leading-[28.44px] max-w-full lg:max-w-[672px] mx-auto px-4"
            style={{ color: '#545454' }}
          >
            Youth sports are the backbone of every local community, but funding issues threatens their future. We're on a bold mission to make youth sports free.
          </p>
        </div>

        {/* Content Grid */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center lg:items-start">
          {/* Left: Cards */}
          <div className="w-full lg:w-[532px] flex flex-col gap-[21px]">
            {reasons.map((reason, index) => (
              <div 
                key={index}
                className="w-full h-[100px] bg-white rounded-[14px] border border-[#F3F4F6] px-[29px] py-[29px] flex items-start hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-1 hover:border-gray-300 transition-all duration-300 ease-out cursor-pointer"
              >
                <div className="flex items-center gap-[14px]">
                  {/* Icon Container */}
                  <div 
                    className="w-[42px] h-[42px] flex items-center justify-center rounded-[12.75px] shrink-0"
                    style={{ backgroundColor: '#FEF2F2' }}
                  >
                    <img 
                      src={reason.icon} 
                      alt="" 
                      className="w-[21px] h-[21px]"
                    />
                  </div>
                  
                  {/* Title */}
                  <h3 
                    className="text-[17.50px] font-medium leading-[24.50px]"
                    style={{ color: '#545454' }}
                  >
                    {reason.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Image */}
          <div className="flex-1 flex justify-center lg:justify-end">
            <img 
              src="/images/player-why-matters.png" 
              alt="Youth sports player" 
              className="w-full max-w-[205.80px] h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyItMattersSection;
