import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Check, MapPin, Mail, Globe, Heart, Share2, Instagram, Twitter, Facebook, Linkedin, Youtube, TrendingUp, Trophy, BarChart3, ChevronDown, Users, Star, Target } from "lucide-react";
import { SponsorshipData, TeamProfile } from "@/types/flow";
import { useToast } from "@/hooks/use-toast";
import { StatCard } from "@/components/marketplace/StatCard";

interface SponsorshipMarketplaceProps {
  sponsorshipData: SponsorshipData;
  teamData: TeamProfile | null;
}

const SponsorshipMarketplace = ({ sponsorshipData, teamData }: SponsorshipMarketplaceProps) => {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isDemographicsOpen, setIsDemographicsOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
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
  const totalReach = team.reach || 0;
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

  const handleSaveTeam = () => {
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? "Removed from saved teams" : "Team saved!",
      description: isSaved ? "This team has been removed from your saved list." : "You can view this team later in your saved teams.",
    });
  };

  const socialLinks = [
    { icon: Instagram, url: team.instagram_link, label: "Instagram" },
    { icon: Twitter, url: team.twitter_link, label: "Twitter" },
    { icon: Facebook, url: team.facebook_link, label: "Facebook" },
    { icon: Linkedin, url: team.linkedin_link, label: "LinkedIn" },
    { icon: Youtube, url: team.youtube_link, label: "YouTube" },
  ].filter(link => link.url);

  // Mock demographics data
  const demographics = {
    population: "45,230",
    medianAge: "34",
    medianIncome: "$78,500",
    ageDistribution: "25-54: 42%, Under 18: 28%, 55+: 30%",
    educationLevel: "Bachelor's or higher: 58%"
  };

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
      
      <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Hero / Team Header */}
        <div className="bg-white border-b border-gray-200 mb-6">
          <div className="p-6 sm:p-8">
            <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6 lg:gap-8">
              {/* Left: Team Info */}
              <div className="flex flex-col">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-bold leading-tight mb-2" style={{ color: '#545454' }}>
                      {team.team_name}
                    </h1>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{team.location}</span>
                      </div>
                      {websiteUrl && (
                        <a 
                          href={websiteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-1 text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
                        >
                          <Globe className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">Visit Team Website</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                
                <p className="text-sm sm:text-base text-gray-700" style={{ maxWidth: '65ch', lineHeight: '1.55' }}>
                  {team.team_bio}
                </p>

                {/* Stats Grid - 8 Tiles */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mt-5 mb-5">
                  <StatCard
                    value={
                      sponsorshipData.duration.includes("yr") || 
                      sponsorshipData.duration.toLowerCase().includes("annual") 
                        ? "1 yr" 
                        : sponsorshipData.duration
                    }
                    label="Duration"
                  />

                  <StatCard
                    value={`$${Number(sponsorshipData.fundraisingGoal).toLocaleString()}`}
                    label="Fundraising Goal"
                  />

                  <StatCard
                    value={team.number_of_players}
                    label="Players Supported"
                  />

                  <StatCard
                    value={team.competition_scope.charAt(0).toUpperCase() + team.competition_scope.slice(1)}
                    label="Competition Level"
                    forceAbbreviate={true}
                  />

                  <StatCard
                    value={(team.instagram_followers || 0).toLocaleString()}
                    label="Families Reached"
                  />

                  <StatCard
                    value={24}
                    label="Games Per Season"
                  />

                  <StatCard
                    value={totalReach.toLocaleString()}
                    label="Total Social Reach"
                  />

                  <StatCard
                    value={340}
                    label="Weekly Attendance"
                  />
                </div>

                {/* Demographics Collapsible */}
                <Collapsible open={isDemographicsOpen} onOpenChange={setIsDemographicsOpen} className="mb-5">
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full flex justify-between items-center h-auto py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        <span className="text-sm font-medium">Town Demographics - {team.location.split(",")[0]}</span>
                      </div>
                      <ChevronDown 
                        className={`w-4 h-4 transition-transform duration-200 ${isDemographicsOpen ? 'rotate-180' : ''}`} 
                      />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs sm:text-sm text-gray-600">Population</div>
                          <div className="text-xs sm:text-sm font-medium">{demographics.population}</div>
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm text-gray-600">Median Age</div>
                          <div className="text-xs sm:text-sm font-medium">{demographics.medianAge}</div>
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm text-gray-600">Median Income</div>
                          <div className="text-xs sm:text-sm font-medium">{demographics.medianIncome}</div>
                        </div>
                        <div className="sm:col-span-2">
                          <div className="text-sm font-semibold mb-2" style={{ color: '#545454' }}>Age Distribution</div>
                          <div className="text-xs sm:text-sm">{demographics.ageDistribution}</div>
                        </div>
                        <div className="sm:col-span-2">
                          <div className="text-sm font-semibold mb-2" style={{ color: '#545454' }}>Education Level</div>
                          <div className="text-xs sm:text-sm">{demographics.educationLevel}</div>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Save Team & Share Actions */}
                <div className="flex gap-3 max-w-sm">
                  <Button 
                    variant="outline" 
                    className="px-8 w-auto border-gray-300 hover:border-gray-400"
                    onClick={handleSaveTeam}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isSaved ? 'fill-current text-red-500' : ''}`} />
                    {isSaved ? 'Saved' : 'Save Team'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="px-8 w-auto border-gray-300 hover:border-gray-400"
                    onClick={handleShare}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Right: Images */}
              {team.images && team.images.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:self-start lg:max-h-[500px]">
                  {team.images.slice(0, 2).map((img, idx) => (
                    <div key={idx} className="h-28 sm:h-32 lg:h-40 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 shadow-sm">
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

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Sponsorship Packages */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6" style={{ color: '#545454' }}>
                Sponsorship Packages
              </h2>

              <div className="space-y-4">
                {sponsorshipData.packages.map((pkg, index) => (
                  <div
                    key={pkg.id}
                    className={`relative bg-white rounded-xl p-4 sm:p-6 cursor-pointer transition-all border-2 ${
                      selectedPackage === pkg.id
                        ? "border-blue-500 bg-blue-50"
                        : index === 1
                        ? "border-blue-200 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedPackage(pkg.id)}
                  >
                    {index === 1 && (
                      <div 
                        className="absolute -top-3 left-6 px-3 py-1 rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: '#00aafe' }}
                      >
                        Most Popular
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-semibold mb-1">{pkg.name}</h3>
                        <p className="text-sm text-gray-600">
                          Perfect for {index === 0 ? "small businesses" : index === 1 ? "growing businesses" : "major brands"} wanting to support local youth sports
                        </p>
                      </div>
                      <div className="text-left sm:text-right flex-shrink-0">
                        <div className="text-2xl sm:text-3xl font-bold" style={{ color: '#00aafe' }}>
                          ${pkg.price.toLocaleString()}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">one-time</div>
                      </div>
                    </div>

                    {pkg.placements && pkg.placements.length > 0 && (
                      <div className="space-y-2">
                        {pkg.placements.map((placement, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#ffb82d' }} />
                            <span className="text-sm">{placement}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Why Sponsor Our Team */}
            <div className="bg-white rounded-xl p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-6" style={{ color: '#545454' }}>
                Why Sponsor Our Team?
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <TrendingUp className="w-6 h-6" style={{ color: '#ffb82d' }} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold mb-1">Local Brand Exposure</h3>
                    <p className="text-sm text-gray-600">
                      Get your brand in front of hundreds of local families every week through games and events.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Users className="w-6 h-6" style={{ color: '#ffb82d' }} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold mb-1">Community Impact</h3>
                    <p className="text-sm text-gray-600">
                      Support youth development and give back to your local community in a meaningful way.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Star className="w-6 h-6" style={{ color: '#ffb82d' }} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold mb-1">Positive Association</h3>
                    <p className="text-sm text-gray-600">
                      Align your brand with youth sports, health, and family values that resonate with customers.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Trophy className="w-6 h-6" style={{ color: '#ffb82d' }} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold mb-1">Long-term Partnership</h3>
                    <p className="text-sm text-gray-600">
                      Build lasting relationships with families and become a trusted part of the community.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-white rounded-xl p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-8 text-center" style={{ color: '#545454' }}>
                How It Works
              </h2>
              <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
                <div className="text-center">
                  <div 
                    className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center text-xl font-bold"
                    style={{ backgroundColor: '#ffedcb', color: '#ffb82d' }}
                  >
                    1
                  </div>
                  <h3 className="text-base font-semibold mb-2">Choose Package</h3>
                  <p className="text-sm text-gray-600">
                    Select the sponsorship level that fits your budget and goals.
                  </p>
                </div>
                
                <div className="text-center">
                  <div 
                    className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center text-xl font-bold"
                    style={{ backgroundColor: '#ffedcb', color: '#ffb82d' }}
                  >
                    2
                  </div>
                  <h3 className="text-base font-semibold mb-2">Secure Payment</h3>
                  <p className="text-sm text-gray-600">
                    Complete your sponsorship through our secure Stripe checkout.
                  </p>
                </div>
                
                <div className="text-center">
                  <div 
                    className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center text-xl font-bold"
                    style={{ backgroundColor: '#ffedcb', color: '#ffb82d' }}
                  >
                    3
                  </div>
                  <h3 className="text-base font-semibold mb-2">Start Benefits</h3>
                  <p className="text-sm text-gray-600">
                    We'll contact you to coordinate your sponsorship benefits immediately.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6 space-y-6">
              
              {/* Checkout Card */}
              <div className="bg-white rounded-xl p-6 shadow-lg border-0">
                <h3 className="text-lg sm:text-xl font-bold mb-6">Complete Your Sponsorship</h3>

                {selectedPkg ? (
                  <div className="space-y-4">
                    <div className="mb-4">
                      <div className="w-24 h-24 mx-auto mb-3">
                        <img
                          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='80' font-size='80'%3E😊%3C/text%3E%3C/svg%3E"
                          alt="Happy character"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Package</span>
                        <span className="font-medium">{selectedPkg.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Duration</span>
                        <span className="font-medium">{sponsorshipData.duration}</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-base font-semibold">Total</span>
                        <span className="text-xl font-bold" style={{ color: '#00aafe' }}>
                          ${selectedPkg.price.toLocaleString()}
                        </span>
                      </div>

                      <Button 
                        className="w-full h-12 text-base font-semibold transition-colors"
                        style={{ backgroundColor: '#00aafe' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0099e6'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#00aafe'}
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Proceed to Checkout
                      </Button>

                      <p className="text-xs text-center text-gray-500 mt-4">
                        Secure payment powered by Stripe
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-24 h-24 mx-auto mb-4">
                      <img
                        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='80' font-size='80'%3E🤔%3C/text%3E%3C/svg%3E"
                        alt="Select package"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      Select a sponsorship package to continue
                    </p>
                  </div>
                )}
              </div>

              {/* Questions Card */}
              <div className="bg-white rounded-xl p-6 shadow-lg border-0">
                <h3 className="text-lg font-bold mb-4">Questions?</h3>
                <Button 
                  variant="outline" 
                  className="w-full border-gray-300 hover:border-gray-400" 
                  onClick={handleContactTeam}
                  disabled={!contactEmail}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Team
                </Button>
                
                {socialLinks.length > 0 && (
                  <div className="flex justify-center gap-4 mt-6">
                    {socialLinks.map(({ icon: Icon, url, label }) => (
                      <a 
                        key={label}
                        href={url} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-[#00aafe] transition-colors"
                        aria-label={`Visit ${team.team_name} on ${label}`}
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default SponsorshipMarketplace;
