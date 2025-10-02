import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, MapPin, Mail, Globe, Heart, Share2, Instagram, Twitter, Facebook, Linkedin, Youtube, TrendingUp } from "lucide-react";
import { SponsorshipData, TeamProfile } from "@/types/flow";
import { useToast } from "@/hooks/use-toast";

interface SponsorshipMarketplaceProps {
  sponsorshipData: SponsorshipData;
  teamData: TeamProfile | null;
}

const SponsorshipMarketplace = ({ sponsorshipData, teamData }: SponsorshipMarketplaceProps) => {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const { toast } = useToast();

  const defaultTeam: TeamProfile = {
    team_name: "Community Youth Team",
    main_values: ["Community", "Excellence", "Growth"],
    team_bio: "A passionate youth sports team dedicated to developing young athletes and building community spirit through competitive sports.",
    location: "Your Town, USA",
    sport: "soccer",
    number_of_players: "24",
    level_of_play: "Competitive",
    competition_scope: "Local",
    organization_status: "nonprofit",
    instagram_followers: 0,
    facebook_followers: 0,
    twitter_followers: 0,
    email_list_size: 0,
    images: [
      "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=400",
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400",
    ],
  };

  const team = teamData || defaultTeam;
  const totalReach = (team.instagram_followers || 0) + (team.facebook_followers || 0) + (team.twitter_followers || 0) + (team.email_list_size || 0);
  const selectedPkg = sponsorshipData.packages.find(pkg => pkg.id === selectedPackage);

  const contactEmail = sponsorshipData.contact?.email;
  const websiteUrl = sponsorshipData.contact?.website;

  const handleContactTeam = () => {
    if (contactEmail) {
      window.location.href = `mailto:${contactEmail}?subject=Sponsorship Inquiry for ${team.team_name}`;
    } else {
      toast({
        title: "Contact information unavailable",
        description: "Please try again later or use the social media links.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `Support ${team.team_name}`,
      text: `Check out this sponsorship opportunity for ${team.team_name}!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Share link has been copied to clipboard.",
      });
    }
  };

  const socialLinks = [
    { icon: Instagram, url: team.instagram_link, label: "Instagram" },
    { icon: Twitter, url: team.twitter_link, label: "Twitter" },
    { icon: Facebook, url: team.facebook_link, label: "Facebook" },
    { icon: Linkedin, url: team.linkedin_link, label: "LinkedIn" },
    { icon: Youtube, url: team.youtube_link, label: "YouTube" },
  ].filter(link => link.url);

  return (
    <>
      <Helmet>
        <title>{`Sponsor ${team.team_name} - Youth Sports Sponsorship`}</title>
        <meta 
          name="description" 
          content={`Support ${team.team_name} through sponsorship. ${team.team_bio?.substring(0, 150)}...`} 
        />
        <meta property="og:title" content={`Sponsor ${team.team_name}`} />
        <meta property="og:description" content={team.team_bio} />
        <meta property="og:type" content="website" />
        {team.images?.[0] && <meta property="og:image" content={team.images[0]} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Sponsor ${team.team_name}`} />
        <meta name="twitter:description" content={team.team_bio} />
        {team.images?.[0] && <meta name="twitter:image" content={team.images[0]} />}
      </Helmet>
      
      <div className="min-h-screen py-12 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="bg-card rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">🏆</span>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{team.team_name}</h1>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                        <span>{team.location}</span>
                      </div>
                      {websiteUrl && (
                        <a 
                          href={websiteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          <Globe className="w-4 h-4" />
                          Visit Team Website
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6">{team.team_bio}</p>

                {team.images && team.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {team.images.slice(0, 2).map((img, idx) => (
                      <div key={idx} className="aspect-video rounded-lg overflow-hidden bg-muted">
                        <img 
                          src={img} 
                          alt={`${team.team_name} - Team photo ${idx + 1}`} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-1">
              {sponsorshipData.duration.includes("yr") || sponsorshipData.duration.toLowerCase().includes("annual") ? "1 yr" : sponsorshipData.duration}
            </div>
            <div className="text-sm text-muted-foreground">Sponsorship Duration</div>
          </Card>

          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-1">
              ${Number(sponsorshipData.fundraisingGoal).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Fundraising Goal</div>
          </Card>

          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-1">{team.number_of_players}</div>
            <div className="text-sm text-muted-foreground">Players Supported</div>
          </Card>

          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-1">
              {team.competition_scope.charAt(0).toUpperCase() + team.competition_scope.slice(1)}
            </div>
            <div className="text-sm text-muted-foreground">Competition Level</div>
          </Card>
        </div>

        {/* Engagement Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 text-center">
            <div className="text-2xl font-bold mb-1">{(team.instagram_followers || 0).toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Families Reached</div>
          </Card>

          <Card className="p-6 text-center">
            <div className="text-2xl font-bold mb-1">24</div>
            <div className="text-sm text-muted-foreground">Games Per Season</div>
          </Card>

          <Card className="p-6 text-center">
            <div className="text-2xl font-bold mb-1">{totalReach.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Social Reach</div>
          </Card>

          <Card className="p-6 text-center">
            <div className="text-2xl font-bold mb-1">340</div>
            <div className="text-sm text-muted-foreground">Weekly Attendance</div>
          </Card>
        </div>

        {/* Demographics Section */}
        <Card className="p-6 mb-8">
          <button className="w-full flex items-center justify-between text-left">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Town Demographics - {team.location.split(",")[0]}</h2>
            </div>
            <span className="text-sm text-muted-foreground">▼</span>
          </button>
        </Card>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Packages Section */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold">Sponsorship Packages</h2>

            {sponsorshipData.packages.map((pkg, index) => (
              <Card
                key={pkg.id}
                className={`p-6 cursor-pointer transition-all ${
                  selectedPackage === pkg.id
                    ? "ring-2 ring-primary"
                    : "hover:shadow-lg"
                }`}
                onClick={() => setSelectedPackage(pkg.id)}
              >
                {index === 1 && (
                  <Badge className="mb-4 bg-accent text-accent-foreground">
                    Most Popular
                  </Badge>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">{pkg.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Perfect for {index === 0 ? "small businesses" : index === 1 ? "growing businesses" : "major brands"} wanting to support local youth sports
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">
                      ${pkg.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">one-time</div>
                  </div>
                </div>

                {pkg.benefits.length > 0 && (
                  <div className="space-y-2">
                    {pkg.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Checkout Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-6">Complete Your Sponsorship</h3>

                {selectedPkg ? (
                  <div className="space-y-6">
                    <div className="p-4 bg-secondary/30 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Selected Package</p>
                      <p className="font-semibold">{selectedPkg.name}</p>
                      <p className="text-2xl font-bold text-primary mt-2">
                        ${selectedPkg.price.toLocaleString()}
                      </p>
                    </div>

                    <Button className="w-full py-6 text-lg">
                      Proceed to Checkout
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Secure payment powered by Stripe
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-4">
                      <img
                        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='80' font-size='80'%3E🤔%3C/text%3E%3C/svg%3E"
                        alt="Select package"
                        className="w-full h-full"
                      />
                    </div>
                    <p className="text-muted-foreground">
                      Select a sponsorship package to continue
                    </p>
                  </div>
                )}
              </Card>

              <Card className="p-6 mt-6">
                <h3 className="font-semibold mb-4">Questions?</h3>
                <Button 
                  variant="outline" 
                  className="w-full mb-3" 
                  onClick={handleContactTeam}
                  disabled={!contactEmail}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Team
                </Button>
                {socialLinks.length > 0 && (
                  <div className="flex justify-center gap-4 mt-4">
                    {socialLinks.map(({ icon: Icon, url, label }) => (
                      <a 
                        key={label}
                        href={url} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        aria-label={`Visit ${team.team_name} on ${label}`}
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default SponsorshipMarketplace;
