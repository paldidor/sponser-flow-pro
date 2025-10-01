const HowItWorksSection = () => {
  const steps = [
    {
      number: "1",
      title: "One Place to Manage Sponsorships",
      description: "No more chasing teams one at a time, trying to manage it all. Sponsa centralizes all your youth sports sponsorships in a single, easy-to-use platform.",
      color: "text-accent"
    },
    {
      number: "2",
      title: "Measured Community Impact",
      description: "Get analytics and insights into your sponsorships and the impact they drive. Sponsa makes sponsorships a transparent, trackable marketing channel.",
      color: "text-primary"
    },
    {
      number: "3",
      title: "Local Reach That Builds Loyalty",
      description: "Your brand shows up where it matters most—on the field, in the stands, and across the community—creating lasting loyalty with families.",
      color: "text-primary"
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-foreground">Sponsa Makes It A </span>
            <span className="text-primary">Win-Win</span>
            <span className="text-accent">.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Sponsa makes youth sports sponsorships simple, measurable, and impactful—so teams get funding, brands see results, and communities grow stronger.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="bg-card rounded-xl p-6 lg:p-8 shadow-sm hover:shadow-md transition-shadow border-t-4 border-accent"
            >
              <div className={`text-6xl font-black ${step.color} mb-4 opacity-80`}>
                {step.number}
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">
                {step.title}
              </h3>
              <p className="text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Mascot */}
        <div className="flex justify-center">
          <img 
            src="/images/community-celebrating.png" 
            alt="Sponsa mascot celebrating" 
            className="w-64 h-auto"
          />
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
