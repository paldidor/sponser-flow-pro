const ProductSection = () => {
  const features = [
    {
      title: "Get Matched or Explore",
      description: "Get matched with or explore youth sports team communities that fit your goals then select the available placements you want your business logo and messaging to go.",
      image: "/images/product-marketplace.png",
      reverse: false
    },
    {
      title: "Manage Sponsorships with Ease",
      description: "Manage activation, brand elements and partnership docs from a single point. Get team approval and complete the required tasks like uploading logos, creative assets and content to complete activations.",
      image: "/images/product-tasks.png",
      reverse: true
    },
    {
      title: "Get Reporting & Insights",
      description: "Get a complete overview of and breakdown into your sponsorships, manage relationships and renewals - all from your portal.",
      image: "/images/product-placeholder.png",
      reverse: false
    }
  ];

  return (
    <section id="product" className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-20">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-foreground">Sponsa Makes It </span>
            <span className="text-primary">Easy</span>
            <span className="text-accent">.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Get started free and have everything you need to find, manage and scale your youth sports sponsorships.
          </p>
        </div>

        <div className="space-y-16 lg:space-y-24">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`grid lg:grid-cols-2 gap-8 lg:gap-16 items-center ${
                feature.reverse ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className={`${feature.reverse ? 'lg:order-2' : 'lg:order-1'} space-y-4`}>
                <h3 className="text-3xl lg:text-4xl font-bold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-lg text-muted-foreground">
                  {feature.description}
                </p>
              </div>
              <div className={`${feature.reverse ? 'lg:order-1' : 'lg:order-2'}`}>
                <div className="relative rounded-xl overflow-hidden shadow-2xl">
                  <img 
                    src={feature.image} 
                    alt={feature.title} 
                    className="w-full h-auto"
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
