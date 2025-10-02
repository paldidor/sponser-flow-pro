import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, MapPin, Users, DollarSign, Calendar, Target } from "lucide-react";
import ProgressIndicator from "./ProgressIndicator";
import LoadingState from "./LoadingState";
import { SponsorshipData, TeamProfile } from "@/types/flow";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { validateSponsorshipData } from "@/lib/validationUtils";
import { useToast } from "@/hooks/use-toast";

interface SponsorshipReviewProps {
  sponsorshipData: SponsorshipData;
  teamData: TeamProfile | null;
  onApprove: () => void;
  onBack: () => void;
}

const SponsorshipReview = ({ sponsorshipData, teamData, onApprove, onBack }: SponsorshipReviewProps) => {
  const [team, setTeam] = useState<TeamProfile | null>(teamData);
  const [isLoading, setIsLoading] = useState(!teamData);
  const { toast } = useToast();

  const handleApprove = () => {
    const validation = validateSponsorshipData(sponsorshipData);
    
    if (!validation.isValid) {
      toast({
        title: "Validation Error",
        description: validation.errors[0],
        variant: "destructive",
      });
      return;
    }

    onApprove();
  };

  useEffect(() => {
    const fetchTeamProfile = async () => {
      if (teamData) {
        setTeam(teamData);
        setIsLoading(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('team_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching team profile:', error);
        } else if (data) {
          setTeam(data as TeamProfile);
        }
      } catch (error) {
        console.error('Error fetching team profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamProfile();
  }, [teamData]);
  const totalReach = team ? (
    (team.instagram_followers || 0) + 
    (team.facebook_followers || 0) + 
    (team.twitter_followers || 0) + 
    (team.linkedin_followers || 0) + 
    (team.youtube_followers || 0) + 
    (team.email_list_size || 0)
  ) : 0;
  const totalPotential = sponsorshipData.packages.reduce((sum, pkg) => sum + pkg.price, 0);

  if (isLoading) {
    return (
      <LoadingState 
        variant="page"
        size="lg"
        message="Loading Team Profile"
        submessage="Gathering all the information for your sponsorship offer..."
      />
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Review Sponsorship Offer</h1>
          <p className="text-muted-foreground">
            Review the details we've extracted and make any necessary adjustments before launching your campaign.
          </p>
          {sponsorshipData.source !== "form" && (
            <Badge variant="secondary" className="mt-2">
              Extracted from {sponsorshipData.source === "pdf" ? "PDF" : "Website"}
            </Badge>
          )}
        </div>

        <ProgressIndicator currentStep={3} />

        {(sponsorshipData.sourceUrl || sponsorshipData.fileName) && (
          <Card className="p-4 flex items-center gap-2 bg-muted">
            <Target className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              Source: {sponsorshipData.fileName || sponsorshipData.sourceUrl}
            </span>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Campaign Details</h2>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Fundraising Goal</h3>
                  <Button variant="ghost" size="sm">
                    <Pencil className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">
                    ${Number(sponsorshipData.fundraisingGoal).toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Campaign Duration</h3>
                  <Button variant="ghost" size="sm">
                    <Pencil className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="text-lg font-semibold">{sponsorshipData.duration}</span>
                </div>
              </div>

              {sponsorshipData.description && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                    <Button variant="ghost" size="sm">
                      <Pencil className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-sm">{sponsorshipData.description}</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Team Overview</h2>
            
            {team ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <p className="font-semibold">{team.team_name || "Team Name"}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {team.location || "Location"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm">{team.number_of_players || "0"} Players</span>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-center py-4">
                    <div className="text-3xl font-bold text-primary">{totalReach.toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground mt-1">Total Audience Reach</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No team profile found</p>
                <p className="text-xs mt-2">Please create a team profile first</p>
              </div>
            )}
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Sponsorship Packages</h2>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Potential</p>
              <p className="text-2xl font-bold text-green-600">
                ${totalPotential.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {sponsorshipData.packages.map((pkg) => (
              <Card key={pkg.id} className="p-6 bg-secondary/30">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{pkg.name}</h3>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      ${pkg.price.toLocaleString()}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>

                {pkg.benefits.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Benefits Included:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {pkg.benefits.map((benefit, idx) => (
                        <Badge key={idx} variant="secondary">
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {pkg.placements.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Sponsorship Placements:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {pkg.placements.map((placement, idx) => (
                        <Badge key={idx} variant="outline">
                          {placement}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </Card>

        <div className="flex justify-center gap-4">
          <Button variant="outline" size="lg" onClick={onBack}>
            Back
          </Button>
          <Button size="lg" className="px-12" onClick={handleApprove}>
            Launch Campaign
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SponsorshipReview;
