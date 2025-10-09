import { Instagram, Facebook, Twitter, Linkedin, Youtube } from "lucide-react";
import { SocialMediaCard } from "../SocialMediaCard";
import { TeamProfile } from "@/types/flow";

interface SocialMediaTabProps {
  formData: TeamProfile;
  updateField: (field: keyof TeamProfile, value: any) => void;
}

export const SocialMediaTab = ({ formData, updateField }: SocialMediaTabProps) => {
  return (
    <div className="space-y-4 mt-4">
      <SocialMediaCard
        platform="Instagram"
        icon={Instagram}
        iconColor="text-pink-600"
        linkValue={formData.instagram_link}
        followersValue={formData.instagram_followers}
        linkPlaceholder="https://instagram.com/yourteam"
        onLinkChange={(value) => updateField("instagram_link", value)}
        onFollowersChange={(value) => updateField("instagram_followers", value)}
      />

      <SocialMediaCard
        platform="Facebook"
        icon={Facebook}
        iconColor="text-blue-600"
        linkValue={formData.facebook_link}
        followersValue={formData.facebook_followers}
        linkPlaceholder="https://facebook.com/yourteam"
        linkLabel="Page URL"
        onLinkChange={(value) => updateField("facebook_link", value)}
        onFollowersChange={(value) => updateField("facebook_followers", value)}
      />

      <SocialMediaCard
        platform="Twitter / X"
        icon={Twitter}
        iconColor="text-blue-400"
        linkValue={formData.twitter_link}
        followersValue={formData.twitter_followers}
        linkPlaceholder="https://twitter.com/yourteam"
        onLinkChange={(value) => updateField("twitter_link", value)}
        onFollowersChange={(value) => updateField("twitter_followers", value)}
      />

      <SocialMediaCard
        platform="LinkedIn"
        icon={Linkedin}
        iconColor="text-blue-700"
        linkValue={formData.linkedin_link}
        followersValue={formData.linkedin_followers}
        linkPlaceholder="https://linkedin.com/company/yourteam"
        linkLabel="Company URL"
        onLinkChange={(value) => updateField("linkedin_link", value)}
        onFollowersChange={(value) => updateField("linkedin_followers", value)}
      />

      <SocialMediaCard
        platform="YouTube"
        icon={Youtube}
        iconColor="text-red-600"
        linkValue={formData.youtube_link}
        followersValue={formData.youtube_followers}
        linkPlaceholder="https://youtube.com/@yourteam"
        linkLabel="Channel URL"
        followersLabel="Subscribers"
        onLinkChange={(value) => updateField("youtube_link", value)}
        onFollowersChange={(value) => updateField("youtube_followers", value)}
      />
    </div>
  );
};
