import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LucideIcon } from "lucide-react";

interface SocialMediaCardProps {
  platform: string;
  icon: LucideIcon;
  iconColor: string;
  linkValue: string;
  followersValue: number;
  linkPlaceholder: string;
  linkLabel?: string;
  followersLabel?: string;
  onLinkChange: (value: string) => void;
  onFollowersChange: (value: number) => void;
}

export const SocialMediaCard = ({
  platform,
  icon: Icon,
  iconColor,
  linkValue,
  followersValue,
  linkPlaceholder,
  linkLabel = "Profile URL",
  followersLabel = "Followers",
  onLinkChange,
  onFollowersChange,
}: SocialMediaCardProps) => {
  return (
    <Card className="p-4 bg-muted/30">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <Label className="text-sm font-medium">{platform}</Label>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${platform.toLowerCase()}_link`}>{linkLabel}</Label>
          <Input
            id={`${platform.toLowerCase()}_link`}
            value={linkValue}
            onChange={(e) => onLinkChange(e.target.value)}
            placeholder={linkPlaceholder}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${platform.toLowerCase()}_followers`}>{followersLabel}</Label>
          <Input
            id={`${platform.toLowerCase()}_followers`}
            type="number"
            value={followersValue || ""}
            onChange={(e) => onFollowersChange(Number(e.target.value))}
            placeholder="0"
          />
        </div>
      </div>
    </Card>
  );
};
