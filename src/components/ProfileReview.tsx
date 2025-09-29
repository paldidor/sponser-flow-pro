import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, MapPin, Users, Instagram, Facebook, Twitter, Mail, AlertCircle } from "lucide-react";
import ProgressIndicator from "./ProgressIndicator";
import { TeamProfile } from "@/types/flow";

interface ProfileReviewProps {
  teamData: TeamProfile | null;
  onApprove: () => void;
}

const ProfileReview = ({ teamData, onApprove }: ProfileReviewProps) => {
  const defaultTeam: TeamProfile = {
    name: "Lightning Bolts Soccer Club",
    bio: "The Lightning Bolts Soccer Club is a competitive youth soccer team based in downtown. We compete in the regional youth league and focus on developing both athletic skills and character in our players aged 10-14.",
    location: "San Francisco, CA",
    images: [
      "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=400",
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400",
    ],
    socialStats: {
      instagram: 1250,
      facebook: 890,
      twitter: 420,
    },
    playerCount: 18,
    sport: "Soccer",
    emailListSize: 0,
    competitionLevel: "regional",
    organizationStatus: "nonprofit",
  };

  const team = teamData || defaultTeam;
  const totalReach = team.socialStats.instagram + team.socialStats.facebook + team.socialStats.twitter + (team.emailListSize || 0);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Review Your Team Profile</h1>
          <p className="text-muted-foreground">
            We've automatically filled in your team details from https://www.sponsa.ai. Review and edit any details before continuing.
          </p>
        </div>

        <ProgressIndicator currentStep={2} />

        <Card className="p-6 bg-secondary/30 border-secondary">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
            <div className="space-y-1 text-sm">
              <p className="font-medium">💡 Maximize your profile appeal to sponsors:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>📸 Add 1 more photo to showcase your team better</li>
                <li>📧 Add your email subscriber count to show sponsors your reach</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Team Photos</h2>
            <Button variant="ghost" size="sm">
              <Pencil className="w-4 h-4 mr-2" />
              Edit Photos
            </Button>
          </div>
          
          <div className="mb-4 p-3 bg-accent/10 rounded-lg border border-accent/20">
            <p className="text-sm text-accent-foreground">
              ⚠️ Add 1 more photo to make your profile more appealing to sponsors
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {team.images.map((img, idx) => (
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
                <p className="text-foreground">{team.name}</p>
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
                  <span>{team.location}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Team Bio</h3>
                  <Button variant="ghost" size="sm">
                    <Pencil className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">{team.bio}</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Sport</h3>
                  <Button variant="ghost" size="sm">
                    <Pencil className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-foreground">{team.sport}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Social Media Presence</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Instagram className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium">Instagram</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{team.socialStats.instagram.toLocaleString()} followers</span>
                  <Button variant="ghost" size="sm">
                    <Pencil className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <Facebook className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium">Facebook</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{team.socialStats.facebook.toLocaleString()} followers</span>
                  <Button variant="ghost" size="sm">
                    <Pencil className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center">
                    <Twitter className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium">Twitter</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{team.socialStats.twitter.toLocaleString()} followers</span>
                  <Button variant="ghost" size="sm">
                    <Pencil className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium">Email List</span>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" className="text-primary">
                    <Pencil className="w-3 h-3 mr-2" />
                    Add
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">
                  ⚠️ Adding your email subscriber count shows sponsors your direct reach
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
