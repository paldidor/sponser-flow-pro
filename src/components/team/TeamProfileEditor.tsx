import { useState, useEffect, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Users,
  Trophy,
  Instagram,
  Image as ImageIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TeamProfile } from "@/types/flow";
import { validateSocialMediaURL } from "@/lib/validationUtils";

// Lazy load tab components for better performance
const BasicInfoTab = lazy(() => import("./profile-editor/BasicInfoTab").then(m => ({ default: m.BasicInfoTab })));
const CompetitionTab = lazy(() => import("./profile-editor/CompetitionTab").then(m => ({ default: m.CompetitionTab })));
const SocialMediaTab = lazy(() => import("./profile-editor/SocialMediaTab").then(m => ({ default: m.SocialMediaTab })));
const PhotosTab = lazy(() => import("./profile-editor/PhotosTab").then(m => ({ default: m.PhotosTab })));

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
    images: [],
    logo: undefined,
  });

  useEffect(() => {
    if (open && profileData) {
      // Helper function to ensure main_values is always an array
      const parseMainValues = (values: any): string[] => {
        if (!values) return [];
        if (Array.isArray(values)) return values;
        if (typeof values === 'string') {
          try {
            const parsed = JSON.parse(values);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        }
        return [];
      };

      setFormData({
        team_name: profileData.team_name || "",
        main_values: parseMainValues(profileData.main_values),
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
        images: profileData.images || [],
        logo: profileData.logo || undefined,
      });
    }
  }, [open, profileData]);

  const updateField = (field: keyof TeamProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
            images: formData.images || [],
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
          <TabsList className="grid w-full grid-cols-4">
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
            <TabsTrigger value="photos">
              <ImageIcon className="w-4 h-4 mr-2" />
              Photos
            </TabsTrigger>
          </TabsList>

          <Suspense fallback={<div className="p-4 text-center text-muted-foreground">Loading...</div>}>
            <TabsContent value="basic">
              <BasicInfoTab formData={formData} updateField={updateField} />
            </TabsContent>

            <TabsContent value="competition">
              <CompetitionTab formData={formData} updateField={updateField} />
            </TabsContent>

            <TabsContent value="social">
              <SocialMediaTab formData={formData} updateField={updateField} />
            </TabsContent>

            <TabsContent value="photos">
              <PhotosTab 
                profileData={profileData}
                formData={formData} 
                updateField={updateField} 
              />
            </TabsContent>
          </Suspense>
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
