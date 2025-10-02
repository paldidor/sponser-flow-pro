import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Mail,
  X,
  Plus,
  Users,
  Trophy,
  Calendar,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TeamProfile } from "@/types/flow";
import { validateSocialMediaURL } from "@/lib/validationUtils";

interface TeamProfileEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileData?: TeamProfile | null;
  onSave: (updatedProfile: TeamProfile) => void;
}

export const TeamProfileEditor = ({
  open,
  onOpenChange,
  profileData,
  onSave,
}: TeamProfileEditorProps) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [newTagValue, setNewTagValue] = useState("");

  // Form state
  const [formData, setFormData] = useState<TeamProfile>({
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
    linkedin_followers: 0,
    twitter_followers: 0,
    youtube_followers: 0,
    email_list_size: 0,
  });

  useEffect(() => {
    if (open && profileData) {
      setFormData({
        team_name: profileData.team_name || "",
        main_values: profileData.main_values || [],
        location: profileData.location || "",
        team_bio: profileData.team_bio || "",
        sport: profileData.sport || "",
        number_of_players: profileData.number_of_players || "",
        level_of_play: profileData.level_of_play || "",
        competition_scope: profileData.competition_scope || "Local",
        season_start_date: profileData.season_start_date || "",
        season_end_date: profileData.season_end_date || "",
        organization_status: profileData.organization_status || "",
        instagram_link: profileData.instagram_link || "",
        facebook_link: profileData.facebook_link || "",
        linkedin_link: profileData.linkedin_link || "",
        youtube_link: profileData.youtube_link || "",
        twitter_link: profileData.twitter_link || "",
        instagram_followers: profileData.instagram_followers || 0,
        facebook_followers: profileData.facebook_followers || 0,
        linkedin_followers: profileData.linkedin_followers || 0,
        twitter_followers: profileData.twitter_followers || 0,
        youtube_followers: profileData.youtube_followers || 0,
        email_list_size: profileData.email_list_size || 0,
      });
    }
  }, [open, profileData]);

  const updateField = (field: keyof TeamProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    const trimmed = newTagValue.trim();
    if (!trimmed) {
      toast({
        title: "Empty Value",
        description: "Please enter a value to add",
        variant: "destructive",
      });
      return;
    }

    if (formData.main_values.includes(trimmed)) {
      toast({
        title: "Duplicate Value",
        description: "This value already exists",
        variant: "destructive",
      });
      return;
    }

    updateField("main_values", [...formData.main_values, trimmed]);
    setNewTagValue("");
  };

  const handleRemoveTag = (tag: string) => {
    updateField(
      "main_values",
      formData.main_values.filter((v) => v !== tag)
    );
  };

  const validateForm = (): boolean => {
    // Required fields
    if (!formData.team_name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Team name is required",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.sport?.trim()) {
      toast({
        title: "Validation Error",
        description: "Sport is required",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.location?.trim()) {
      toast({
        title: "Validation Error",
        description: "Location is required",
        variant: "destructive",
      });
      return false;
    }

    // Validate social media URLs
    const socialFields: Array<keyof TeamProfile> = [
      "instagram_link",
      "facebook_link",
      "linkedin_link",
      "youtube_link",
      "twitter_link",
    ];

    for (const field of socialFields) {
      const url = formData[field] as string;
      if (url) {
        const platform = field.replace("_link", "");
        const validation = validateSocialMediaURL(url, platform);
        if (!validation.isValid) {
          toast({
            title: "Invalid URL",
            description: `${platform}: ${validation.error}`,
            variant: "destructive",
          });
          return false;
        }
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Authentication Required",
          description: "You must be logged in to save changes. Please refresh and try again.",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      // Check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from("team_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      let error: any = null;

      if (!existingProfile) {
        // Insert new profile with all required fields
        const { error: insertError } = await supabase
          .from("team_profiles")
          .insert({ 
            user_id: user.id, 
            ...formData,
            // Ensure arrays are properly formatted
            main_values: formData.main_values || [],
          });
        error = insertError;
      } else {
        // Update existing profile
        const { error: updateError } = await supabase
          .from("team_profiles")
          .update({
            ...formData,
            // Ensure arrays are properly formatted
            main_values: formData.main_values || [],
          })
          .eq("user_id", user.id);
        error = updateError;
      }

      if (error) {
        console.error("Error saving profile:", error);
        
        let errorMessage = "Failed to save profile changes. Please try again.";
        
        if (error.code === "23505") {
          errorMessage = "A profile already exists. Please refresh and try again.";
        } else if (error.code === "42501") {
          errorMessage = "Permission denied. Please check your access rights.";
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        toast({
          title: "Failed to Save",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Profile Saved",
        description: "Your team profile has been updated successfully",
      });

      onSave(formData);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving profile:", error);
      
      toast({
        title: "Unexpected Error",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Team Profile</DialogTitle>
          <DialogDescription>
            Update your team information and social media presence
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">
              <Users className="w-4 h-4 mr-2" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="competition">
              <Trophy className="w-4 h-4 mr-2" />
              Competition
            </TabsTrigger>
            <TabsTrigger value="social">
              <Instagram className="w-4 h-4 mr-2" />
              Social Media
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="team_name">
                  Team Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="team_name"
                  value={formData.team_name}
                  onChange={(e) => updateField("team_name", e.target.value)}
                  placeholder="Enter team name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sport">
                  Sport <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="sport"
                  value={formData.sport}
                  onChange={(e) => updateField("sport", e.target.value)}
                  placeholder="e.g., Soccer, Basketball"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">
                  Location <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="City, State/Country"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="number_of_players">Number of Players</Label>
                <Input
                  id="number_of_players"
                  value={formData.number_of_players}
                  onChange={(e) => updateField("number_of_players", e.target.value)}
                  placeholder="e.g., 15-20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="team_bio">Team Bio</Label>
              <Textarea
                id="team_bio"
                value={formData.team_bio}
                onChange={(e) => updateField("team_bio", e.target.value)}
                placeholder="Tell us about your team..."
                rows={4}
              />
            </div>

            <div className="space-y-3">
              <Label>Team Values</Label>
              <div className="flex flex-wrap gap-2 min-h-[40px] p-3 border rounded-md bg-muted/30">
                {formData.main_values.map((tag) => (
                  <Badge key={tag} variant="secondary" className="px-3 py-1">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTagValue}
                  onChange={(e) => setNewTagValue(e.target.value)}
                  placeholder="Add a team value (e.g., Teamwork, Excellence)"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="competition" className="space-y-4 mt-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level_of_play">Level of Play</Label>
                <Select
                  value={formData.level_of_play}
                  onValueChange={(value) => updateField("level_of_play", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Youth">Youth</SelectItem>
                    <SelectItem value="High School">High School</SelectItem>
                    <SelectItem value="College">College</SelectItem>
                    <SelectItem value="Semi-Professional">Semi-Professional</SelectItem>
                    <SelectItem value="Professional">Professional</SelectItem>
                    <SelectItem value="Amateur">Amateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="competition_scope">Competition Scope</Label>
                <Select
                  value={formData.competition_scope}
                  onValueChange={(value) => updateField("competition_scope", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Local">Local</SelectItem>
                    <SelectItem value="Regional">Regional</SelectItem>
                    <SelectItem value="National">National</SelectItem>
                    <SelectItem value="International">International</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization_status">Organization Status</Label>
                <Select
                  value={formData.organization_status}
                  onValueChange={(value) => updateField("organization_status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Non-Profit">Non-Profit</SelectItem>
                    <SelectItem value="For-Profit">For-Profit</SelectItem>
                    <SelectItem value="School-Based">School-Based</SelectItem>
                    <SelectItem value="Community">Community</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email_list_size">Email List Size</Label>
                <Input
                  id="email_list_size"
                  type="number"
                  value={formData.email_list_size || ""}
                  onChange={(e) =>
                    updateField("email_list_size", Number(e.target.value))
                  }
                  placeholder="0"
                />
              </div>
            </div>

            <Card className="p-4 bg-muted/30">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-primary" />
                <Label className="text-sm font-medium">Season Dates</Label>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="season_start_date">Start Date</Label>
                  <Input
                    id="season_start_date"
                    type="date"
                    value={formData.season_start_date}
                    onChange={(e) => updateField("season_start_date", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="season_end_date">End Date</Label>
                  <Input
                    id="season_end_date"
                    type="date"
                    value={formData.season_end_date}
                    onChange={(e) => updateField("season_end_date", e.target.value)}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-4 mt-4">
            <div className="space-y-4">
              {/* Instagram */}
              <Card className="p-4 bg-muted/30">
                <div className="flex items-center gap-2 mb-3">
                  <Instagram className="w-4 h-4 text-pink-600" />
                  <Label className="text-sm font-medium">Instagram</Label>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="instagram_link">Profile URL</Label>
                    <Input
                      id="instagram_link"
                      value={formData.instagram_link}
                      onChange={(e) => updateField("instagram_link", e.target.value)}
                      placeholder="https://instagram.com/yourteam"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram_followers">Followers</Label>
                    <Input
                      id="instagram_followers"
                      type="number"
                      value={formData.instagram_followers || ""}
                      onChange={(e) =>
                        updateField("instagram_followers", Number(e.target.value))
                      }
                      placeholder="0"
                    />
                  </div>
                </div>
              </Card>

              {/* Facebook */}
              <Card className="p-4 bg-muted/30">
                <div className="flex items-center gap-2 mb-3">
                  <Facebook className="w-4 h-4 text-blue-600" />
                  <Label className="text-sm font-medium">Facebook</Label>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebook_link">Page URL</Label>
                    <Input
                      id="facebook_link"
                      value={formData.facebook_link}
                      onChange={(e) => updateField("facebook_link", e.target.value)}
                      placeholder="https://facebook.com/yourteam"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facebook_followers">Followers</Label>
                    <Input
                      id="facebook_followers"
                      type="number"
                      value={formData.facebook_followers || ""}
                      onChange={(e) =>
                        updateField("facebook_followers", Number(e.target.value))
                      }
                      placeholder="0"
                    />
                  </div>
                </div>
              </Card>

              {/* Twitter */}
              <Card className="p-4 bg-muted/30">
                <div className="flex items-center gap-2 mb-3">
                  <Twitter className="w-4 h-4 text-blue-400" />
                  <Label className="text-sm font-medium">Twitter / X</Label>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="twitter_link">Profile URL</Label>
                    <Input
                      id="twitter_link"
                      value={formData.twitter_link}
                      onChange={(e) => updateField("twitter_link", e.target.value)}
                      placeholder="https://twitter.com/yourteam"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter_followers">Followers</Label>
                    <Input
                      id="twitter_followers"
                      type="number"
                      value={formData.twitter_followers || ""}
                      onChange={(e) =>
                        updateField("twitter_followers", Number(e.target.value))
                      }
                      placeholder="0"
                    />
                  </div>
                </div>
              </Card>

              {/* LinkedIn */}
              <Card className="p-4 bg-muted/30">
                <div className="flex items-center gap-2 mb-3">
                  <Linkedin className="w-4 h-4 text-blue-700" />
                  <Label className="text-sm font-medium">LinkedIn</Label>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="linkedin_link">Company URL</Label>
                    <Input
                      id="linkedin_link"
                      value={formData.linkedin_link}
                      onChange={(e) => updateField("linkedin_link", e.target.value)}
                      placeholder="https://linkedin.com/company/yourteam"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin_followers">Followers</Label>
                    <Input
                      id="linkedin_followers"
                      type="number"
                      value={formData.linkedin_followers || ""}
                      onChange={(e) =>
                        updateField("linkedin_followers", Number(e.target.value))
                      }
                      placeholder="0"
                    />
                  </div>
                </div>
              </Card>

              {/* YouTube */}
              <Card className="p-4 bg-muted/30">
                <div className="flex items-center gap-2 mb-3">
                  <Youtube className="w-4 h-4 text-red-600" />
                  <Label className="text-sm font-medium">YouTube</Label>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="youtube_link">Channel URL</Label>
                    <Input
                      id="youtube_link"
                      value={formData.youtube_link}
                      onChange={(e) => updateField("youtube_link", e.target.value)}
                      placeholder="https://youtube.com/@yourteam"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="youtube_followers">Subscribers</Label>
                    <Input
                      id="youtube_followers"
                      type="number"
                      value={formData.youtube_followers || ""}
                      onChange={(e) =>
                        updateField("youtube_followers", Number(e.target.value))
                      }
                      placeholder="0"
                    />
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
