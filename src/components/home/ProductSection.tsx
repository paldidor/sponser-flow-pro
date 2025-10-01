const ProductSection = () => {
  const features = [
    {
      title: "Get Matched or Explore",
      description: "Get matched with or explore youth sports team communities that fit your goals then select the available placements you want your business logo and messaging to go.",
      image: "/images/marketplace-cards.png",
      reverse: false
    },
    {
      title: "Manage Sponsorships with Ease",
      description: "Manage activation, brand elements and partnership docs from a single point. Get team approval and complete the required tasks like uploading logos, creative assets and content to complete activations.",
      image: "/images/activation-tasks.png",
      reverse: true
    },
    {
      title: "Get Reporting & Insights",
      description: "Get a complete overview of and breakdown into your sponsorships, manage relationships and renewals - all from your portal.",
      image: "/images/dashboard-analytics-product.png",
      reverse: false
    }
  ];

  return (
    <section id="product" className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 lg:px-8 max-w-[1200px]">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="mb-4">
            <span style={{ color: '#545454', fontSize: '42px', fontWeight: 800, lineHeight: '42px' }}>
              Sponsa Makes It{' '}
            </span>
            <span style={{ color: '#00AAFE', fontSize: '42px', fontWeight: 800, lineHeight: '42px' }}>
              Easy
            </span>
            <span style={{ color: '#FFB82D', fontSize: '42px', fontWeight: 800, lineHeight: '42px' }}>
              .
            </span>
          </h2>
          <p 
            className="max-w-[672px] mx-auto opacity-80" 
            style={{ color: '#545454', fontSize: '17.50px', fontWeight: 400, lineHeight: '24.50px' }}
          >
            Get started free and have everything you need to find, manage and scale your youth sports sponsorships.
          </p>
        </div>

        {/* Features - Desktop Layout with Absolute Positioning */}
        <div className="hidden lg:block">
          {/* Section 1 - Get Matched or Explore */}
          <div className="relative" style={{ height: '289.17px', marginBottom: '98px' }}>
            {/* Text Block */}
            <div 
              className="absolute"
              style={{ 
                left: 0, 
                top: '70.65px',
                width: '441px',
                height: '147.88px'
              }}
            >
              <h3 
                style={{ 
                  color: '#545454', 
                  fontSize: '26.25px', 
                  fontWeight: 700, 
                  lineHeight: '31.50px',
                  marginTop: '1.5px',
                  marginBottom: '14px'
                }}
              >
                {features[0].title}
              </h3>
              <p 
                className="opacity-80" 
                style={{ 
                  color: '#545454', 
                  fontSize: '15.75px', 
                  fontWeight: 400, 
                  lineHeight: '25.59px',
                  marginTop: '1.5px',
                  width: '436px'
                }}
              >
                {features[0].description}
              </p>
            </div>

            {/* Media Card */}
            <div 
              className="absolute overflow-hidden rounded-[14px]"
              style={{
                left: '581px',
                top: 0,
                width: '539px',
                height: '289.17px',
                boxShadow: '0px 4px 6px -4px rgba(0, 0, 0, 0.10)',
                outline: '1px solid #E5E7EB',
                outlineOffset: '-1px'
              }}
            >
              <img 
                src={features[0].image} 
                alt={features[0].title}
                style={{
                  position: 'absolute',
                  left: '1px',
                  top: '1px',
                  width: '537px',
                  height: '287.17px'
                }}
              />
              <div 
                className="absolute pointer-events-none"
                style={{
                  left: '1px',
                  top: '1px',
                  width: '537px',
                  height: '287.17px',
                  background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0) 100%)'
                }}
              />
            </div>
          </div>

          {/* Section 2 - Manage Sponsorships with Ease */}
          <div className="relative" style={{ height: '294.85px', marginBottom: '98px' }}>
            {/* Media Card */}
            <div 
              className="absolute overflow-hidden rounded-[14px]"
              style={{
                left: 0,
                top: 0,
                width: '539px',
                height: '294.85px',
                boxShadow: '0px 4px 6px -4px rgba(0, 0, 0, 0.10)',
                outline: '1px solid #E5E7EB',
                outlineOffset: '-1px'
              }}
            >
              <img 
                src={features[1].image} 
                alt={features[1].title}
                style={{
                  position: 'absolute',
                  left: '1px',
                  top: '1px',
                  width: '537px',
                  height: '292.85px'
                }}
              />
              <div 
                className="absolute pointer-events-none"
                style={{
                  left: '1px',
                  top: '1px',
                  width: '537px',
                  height: '292.85px',
                  background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0) 100%)'
                }}
              />
            </div>

            {/* Text Block */}
            <div 
              className="absolute"
              style={{ 
                left: '679px', 
                top: '73.48px',
                width: '441px',
                height: '147.88px'
              }}
            >
              <h3 
                style={{ 
                  color: '#545454', 
                  fontSize: '26.25px', 
                  fontWeight: 700, 
                  lineHeight: '31.50px',
                  marginTop: '1.5px',
                  marginBottom: '14px'
                }}
              >
                {features[1].title}
              </h3>
              <p 
                className="opacity-80" 
                style={{ 
                  color: '#545454', 
                  fontSize: '15.75px', 
                  fontWeight: 400, 
                  lineHeight: '25.59px',
                  marginTop: '1.5px',
                  width: '415px'
                }}
              >
                {features[1].description}
              </p>
            </div>
          </div>

          {/* Section 3 - Get Reporting & Insights */}
          <div className="relative" style={{ height: '294.85px' }}>
            {/* Text Block */}
            <div 
              className="absolute"
              style={{ 
                left: 0, 
                top: '86.28px',
                width: '441px',
                height: '122.28px'
              }}
            >
              <h3 
                style={{ 
                  color: '#545454', 
                  fontSize: '26.25px', 
                  fontWeight: 700, 
                  lineHeight: '31.50px',
                  marginTop: '1.5px',
                  marginBottom: '14px'
                }}
              >
                {features[2].title}
              </h3>
              <p 
                className="opacity-80" 
                style={{ 
                  color: '#545454', 
                  fontSize: '15.75px', 
                  fontWeight: 400, 
                  lineHeight: '25.59px',
                  marginTop: '1.5px',
                  width: '432px'
                }}
              >
                {features[2].description}
              </p>
            </div>

            {/* Media Card */}
            <div 
              className="absolute overflow-hidden rounded-[14px]"
              style={{
                left: '581px',
                top: 0,
                width: '539px',
                height: '294.85px',
                boxShadow: '0px 4px 6px -4px rgba(0, 0, 0, 0.10)',
                outline: '1px solid #E5E7EB',
                outlineOffset: '-1px'
              }}
            >
              <img 
                src={features[2].image} 
                alt={features[2].title}
                style={{
                  position: 'absolute',
                  left: '1px',
                  top: '1px',
                  width: '537px',
                  height: '292.85px'
                }}
              />
              <div 
                className="absolute pointer-events-none"
                style={{
                  left: '1px',
                  top: '1px',
                  width: '537px',
                  height: '292.85px',
                  background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0) 100%)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Fallback Layout */}
        <div className="flex flex-col gap-24 lg:hidden">
          {features.map((feature, index) => (
            <div 
              key={index}
            className="flex flex-col gap-8 items-center"
            >
              <div className="w-full flex flex-col gap-3.5">
                <h3 style={{ color: '#545454', fontSize: '26.25px', fontWeight: 700, lineHeight: '31.50px' }}>
                  {feature.title}
                </h3>
                <p 
                  className="opacity-80" 
                  style={{ color: '#545454', fontSize: '15.75px', fontWeight: 400, lineHeight: '25.59px' }}
                >
                  {feature.description}
                </p>
              </div>

              <div className="w-full flex justify-center">
                <img 
                  src={feature.image} 
                  alt={feature.title} 
                  className="w-full max-w-sm md:max-w-md h-auto"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
