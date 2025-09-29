import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, MapPin, Users, Instagram, Facebook, Twitter, Mail, AlertCircle, Calendar, Trophy, Target, Linkedin, Youtube, ExternalLink } from "lucide-react";
import ProgressIndicator from "./ProgressIndicator";
import { TeamProfile } from "@/types/flow";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProfileReviewProps {
  teamData: TeamProfile | null;
  onApprove: () => void;
  isManualEntry?: boolean;
}

const ProfileReview = ({ teamData, onApprove, isManualEntry = false }: ProfileReviewProps) => {
  const [team, setTeam] = useState<TeamProfile | null>(teamData);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const defaultTeam: TeamProfile = {
    team_name: "",
    main_values: [],
    location: "",
    team_bio: "",
    sport: "",
    number_of_players: "",
    level_of_play: "",
    competition_scope: "Local",
    season_start_date: "",
    season_end_date: "",
    organization_status: "",
    instagram_link: "",
    facebook_link: "",
    linkedin_link: "",
    youtube_link: "",
    twitter_link: "",
    instagram_followers: 0,
    facebook_followers: 0,
    twitter_followers: 0,
    email_list_size: 0,
    images: [],
  };

  useEffect(() => {
    const fetchTeamProfile = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log('No authenticated user');
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('team_profiles')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error fetching team profile:', error);
          toast({
            title: "Error loading profile",
            description: error.message,
            variant: "destructive",
          });
        } else if (data) {
          console.log('Fetched team profile:', data);
          setTeam({
            team_name: data.team_name || "",
            main_values: (data.main_values as string[]) || [],
            location: data.location || "",
            team_bio: data.team_bio || "",
            sport: data.sport || "",
            number_of_players: data.number_of_players || "",
            level_of_play: data.level_of_play || "",
            competition_scope: data.competition_scope || "Local",
            season_start_date: data.season_start_date || "",
            season_end_date: data.season_end_date || "",
            organization_status: data.organization_status || "",
            instagram_link: data.instagram_link || "",
            facebook_link: data.facebook_link || "",
            linkedin_link: data.linkedin_link || "",
            youtube_link: data.youtube_link || "",
            twitter_link: data.twitter_link || "",
            instagram_followers: data.instagram_followers || 0,
            facebook_followers: data.facebook_followers || 0,
            twitter_followers: data.twitter_followers || 0,
            email_list_size: data.email_list_size || 0,
            images: [],
          });
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (!teamData) {
      fetchTeamProfile();
    }
  }, [teamData, toast]);

  const currentTeam = team || defaultTeam;
  const totalReach = (currentTeam.instagram_followers || 0) + (currentTeam.facebook_followers || 0) + (currentTeam.twitter_followers || 0) + (currentTeam.email_list_size || 0);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Review Your Team Profile</h1>
          <p className="text-muted-foreground">
            {isManualEntry 
              ? "Fill in your team details below. All fields are editable."
              : "We've automatically filled in your team details. Review and edit any details before continuing."}
          </p>
        </div>

        <ProgressIndicator currentStep={2} />

        {!isManualEntry && (
          <Card className="p-6 bg-secondary/30 border-secondary">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
              <div className="space-y-1 text-sm">
                <p className="font-medium">💡 Maximize your profile appeal to sponsors:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>📸 Add photos to showcase your team better</li>
                  <li>📧 Add your email subscriber count to show sponsors your reach</li>
                </ul>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Team Photos</h2>
            <Button variant="ghost" size="sm">
              <Pencil className="w-4 h-4 mr-2" />
              Edit Photos
            </Button>
          </div>
          
          {isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              Loading profile data...
            </div>
          )}
          
          {!isLoading && currentTeam.images && currentTeam.images.length > 0 && (
            <div className="mb-4 p-3 bg-accent/10 rounded-lg border border-accent/20">
              <p className="text-sm text-accent-foreground">
                💡 Add more photos to make your profile more appealing to sponsors
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            {currentTeam.images?.map((img, idx) => (
              <div key={idx} className="aspect-video rounded-lg overflow-hidden bg-muted">
                <img src={img} alt={`Team ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
            <div className="aspect-video rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-2 flex items-center justify-center">
                  <span className="text-2xl">📷</span>
                </div>
                <p className="text-sm text-muted-foreground">Add Photo</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Team Information</h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Team Name</h3>
                  <Button variant="ghost" size="sm">
                    <Pencil className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-foreground">{currentTeam.team_name || "Enter team name"}</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Main Values</h3>
                  <Button variant="ghost" size="sm">
                    <Pencil className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentTeam.main_values && currentTeam.main_values.length > 0 ? (
                    currentTeam.main_values.map((value, idx) => (
                      <Badge key={idx} variant="secondary">{value}</Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">Add team values</span>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Location</h3>
                  <Button variant="ghost" size="sm">
                    <Pencil className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{currentTeam.location || "Enter location"}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Team Bio</h3>
                  <Button variant="ghost" size="sm">
                    <Pencil className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">{currentTeam.team_bio || "Enter team bio"}</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Sport</h3>
                  <Button variant="ghost" size="sm">
                    <Pencil className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-foreground">{currentTeam.sport || "Enter sport"}</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Number of Players</h3>
                  <Button variant="ghost" size="sm">
                    <Pencil className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Users className="w-4 h-4" />
                  <span>{currentTeam.number_of_players || "Enter number of players"}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Level of Play</h3>
                  <Button variant="ghost" size="sm">
                    <Pencil className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Trophy className="w-4 h-4" />
                  <span>{currentTeam.level_of_play || "Enter level of play"}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Competition Scope</h3>
                  <Button variant="ghost" size="sm">
                    <Pencil className="w-3 h-3" />
                  </Button>
                </div>
                <Badge variant="outline">{currentTeam.competition_scope || "Local"}</Badge>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Season Dates</h3>
                  <Button variant="ghost" size="sm">
                    <Pencil className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {currentTeam.season_start_date && currentTeam.season_end_date
                      ? `${currentTeam.season_start_date} - ${currentTeam.season_end_date}`
                      : "Enter season dates"}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Organization Status</h3>
                  <Button variant="ghost" size="sm">
                    <Pencil className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Target className="w-4 h-4" />
                  <span>{currentTeam.organization_status || "Enter organization status"}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Social Media Presence</h2>
            
            <div className="space-y-4">
              {currentTeam.instagram_link && (
                <div className="flex items-center justify-between p-3 rounded-lg border bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Instagram className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium">Instagram</div>
                      <a 
                        href={currentTeam.instagram_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                      >
                        View Profile <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{(currentTeam.instagram_followers || 0).toLocaleString()} followers</span>
                    <Button variant="ghost" size="sm">
                      <Pencil className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}

              {currentTeam.facebook_link && (
                <div className="flex items-center justify-between p-3 rounded-lg border bg-blue-50 dark:bg-blue-950/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                      <Facebook className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium">Facebook</div>
                      <a 
                        href={currentTeam.facebook_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                      >
                        View Profile <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{(currentTeam.facebook_followers || 0).toLocaleString()} followers</span>
                    <Button variant="ghost" size="sm">
                      <Pencil className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}

              {currentTeam.twitter_link && (
                <div className="flex items-center justify-between p-3 rounded-lg border bg-sky-50 dark:bg-sky-950/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center">
                      <Twitter className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium">Twitter</div>
                      <a 
                        href={currentTeam.twitter_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                      >
                        View Profile <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{(currentTeam.twitter_followers || 0).toLocaleString()} followers</span>
                    <Button variant="ghost" size="sm">
                      <Pencil className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}

              {currentTeam.linkedin_link && (
                <div className="flex items-center justify-between p-3 rounded-lg border bg-blue-50 dark:bg-blue-950/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center">
                      <Linkedin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium">LinkedIn</div>
                      <a 
                        href={currentTeam.linkedin_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                      >
                        View Profile <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm">
                      <Pencil className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}

              {currentTeam.youtube_link && (
                <div className="flex items-center justify-between p-3 rounded-lg border bg-red-50 dark:bg-red-950/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                      <Youtube className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium">YouTube</div>
                      <a 
                        href={currentTeam.youtube_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                      >
                        View Channel <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm">
                      <Pencil className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-3 rounded-lg border bg-green-50 dark:bg-green-950/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium">Email List</span>
                </div>
                <div className="flex items-center gap-3">
                  {currentTeam.email_list_size && currentTeam.email_list_size > 0 ? (
                    <>
                      <span className="font-semibold">{currentTeam.email_list_size.toLocaleString()} subscribers</span>
                      <Button variant="ghost" size="sm">
                        <Pencil className="w-3 h-3" />
                      </Button>
                    </>
                  ) : (
                    <Button variant="ghost" size="sm" className="text-primary">
                      <Pencil className="w-3 h-3 mr-2" />
                      Add
                    </Button>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">
                  💡 Adding your email subscriber count shows sponsors your direct reach
                </p>
                <div className="text-center py-6">
                  <div className="text-4xl font-bold text-primary">{totalReach.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground mt-1">Total Audience Reach</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex justify-center">
          <Button size="lg" className="px-12" onClick={onApprove}>
            Approve & Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileReview;
