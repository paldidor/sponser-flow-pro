import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { TeamLogoUploader } from "../TeamLogoUploader";
import { TeamProfile } from "@/types/flow";

interface BasicInfoTabProps {
  formData: TeamProfile;
  updateField: (field: keyof TeamProfile, value: any) => void;
}

export const BasicInfoTab = ({ formData, updateField }: BasicInfoTabProps) => {
  const { toast } = useToast();
  const [newTagValue, setNewTagValue] = useState("");

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

  return (
    <div className="space-y-4 mt-4">
      <TeamLogoUploader
        currentLogo={formData.logo}
        onLogoUpdate={(newLogo) => updateField("logo", newLogo)}
      />

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
    </div>
  );
};
