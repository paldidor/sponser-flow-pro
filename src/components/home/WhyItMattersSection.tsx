import { TrendingDown, DollarSign, Clock, Users } from "lucide-react";

const WhyItMattersSection = () => {
  const reasons = [
    {
      icon: TrendingDown,
      title: "Teams Struggle to Raise Funds",
      iconBg: "bg-red-50",
      iconColor: "text-red-500"
    },
    {
      icon: DollarSign,
      title: "Rising Costs Are Pricing Kids Out",
      iconBg: "bg-pink-50",
      iconColor: "text-pink-500"
    },
    {
      icon: Clock,
      title: "Coaches Are Overwhelmed",
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500"
    },
    {
      icon: Users,
      title: "Communities Lose Out",
      iconBg: "bg-purple-50",
      iconColor: "text-purple-500"
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-foreground">Why It </span>
            <span className="text-primary">Matters</span>
            <span className="text-accent">.</span>
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground">
            Youth sports are the backbone of every local community, but funding issues threaten their future. We're on a bold mission to make youth sports free.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Reasons */}
          <div className="space-y-4">
            {reasons.map((reason, index) => (
              <div 
                key={index}
                className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className={`${reason.iconBg} ${reason.iconColor} p-3 rounded-full shrink-0`}>
                  <reason.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {reason.title}
                </h3>
              </div>
            ))}
          </div>

          {/* Right: Image */}
          <div className="relative">
            <img 
              src="/images/player-why-matters.png" 
              alt="Youth sports player" 
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyItMattersSection;
