import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";
import { TeamProfile } from "@/types/flow";

interface CompetitionTabProps {
  formData: TeamProfile;
  updateField: (field: keyof TeamProfile, value: any) => void;
}

export const CompetitionTab = ({ formData, updateField }: CompetitionTabProps) => {
  return (
    <div className="space-y-4 mt-4">
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
    </div>
  );
};
