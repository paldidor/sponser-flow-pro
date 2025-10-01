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
      <div className="container mx-auto px-4 lg:px-8 max-w-[1120px]">
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

        {/* Features */}
        <div className="flex flex-col gap-24 lg:gap-[98px]">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`flex flex-col lg:flex-row gap-8 lg:gap-10 items-center ${
                feature.reverse ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Text Content */}
              <div className="w-full lg:w-[441px] flex flex-col gap-3.5">
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

              {/* Image Card */}
              <div className="w-full lg:w-[539px] relative">
                <div 
                  className="relative overflow-hidden rounded-[14px]"
                  style={{
                    boxShadow: '0px 4px 6px -4px rgba(0, 0, 0, 0.10)',
                    outline: '1px solid #E5E7EB',
                    outlineOffset: '-1px'
                  }}
                >
                  <img 
                    src={feature.image} 
                    alt={feature.title} 
                    className="w-full h-auto"
                  />
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0) 100%)'
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
