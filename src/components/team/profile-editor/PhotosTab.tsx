import { TeamPhotoUploader } from "../TeamPhotoUploader";
import { TeamProfile } from "@/types/flow";

interface PhotosTabProps {
  profileData?: TeamProfile | null;
  formData: TeamProfile;
  updateField: (field: keyof TeamProfile, value: any) => void;
}

export const PhotosTab = ({ profileData, formData, updateField }: PhotosTabProps) => {
  return (
    <div className="space-y-4 mt-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Team Photos</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upload photos of your team, players, and events. These will be displayed on your marketplace listing.
        </p>
      </div>
      
      <TeamPhotoUploader
        teamProfileId={profileData?.id || ""}
        currentImages={formData.images || []}
        onImagesUpdate={(updatedImages) => updateField("images", updatedImages)}
        maxPhotos={6}
      />
    </div>
  );
};
