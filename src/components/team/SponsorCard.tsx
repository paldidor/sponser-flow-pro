import { ExternalLink, Facebook, Twitter, Instagram, Linkedin, Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ActiveSponsor } from "@/types/dashboard";

interface SponsorCardProps {
  sponsor: ActiveSponsor;
}

export const SponsorCard = ({ sponsor }: SponsorCardProps) => {
  const handleAssetClick = (assetUrl: string) => {
    window.open(assetUrl, "_blank");
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-all">
      {/* Logo and Name */}
      <div className="flex items-start gap-4 mb-4">
        <Avatar className="h-16 w-16 border-2 border-muted">
          <AvatarImage src={sponsor.logo_url} alt={sponsor.name} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {sponsor.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h4 className="font-semibold text-lg text-foreground mb-1">{sponsor.name}</h4>
          <Badge variant="secondary" className="bg-dashboard-green/10 text-dashboard-green">
            {sponsor.package_type}
          </Badge>
        </div>
      </div>

      {/* Bio */}
      {sponsor.bio && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {sponsor.bio}
        </p>
      )}

      {/* Website */}
      {sponsor.website && (
        <a
          href={sponsor.website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-primary hover:underline mb-4"
        >
          <ExternalLink className="h-4 w-4" />
          <span>Visit Website</span>
        </a>
      )}

      {/* Social Links */}
      <div className="flex items-center gap-2 mb-4">
        {sponsor.social_links.facebook && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => window.open(sponsor.social_links.facebook, "_blank")}
          >
            <Facebook className="h-4 w-4" />
            <span className="sr-only">Facebook</span>
          </Button>
        )}
        {sponsor.social_links.twitter && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => window.open(sponsor.social_links.twitter, "_blank")}
          >
            <Twitter className="h-4 w-4" />
            <span className="sr-only">Twitter</span>
          </Button>
        )}
        {sponsor.social_links.instagram && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => window.open(sponsor.social_links.instagram, "_blank")}
          >
            <Instagram className="h-4 w-4" />
            <span className="sr-only">Instagram</span>
          </Button>
        )}
        {sponsor.social_links.linkedin && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => window.open(sponsor.social_links.linkedin, "_blank")}
          >
            <Linkedin className="h-4 w-4" />
            <span className="sr-only">LinkedIn</span>
          </Button>
        )}
      </div>

      {/* Creative Assets */}
      {sponsor.creative_assets.length > 0 && (
        <div className="pt-4 border-t">
          <p className="text-xs font-medium text-muted-foreground mb-2">Creative Assets</p>
          <div className="flex gap-2">
            {sponsor.creative_assets.slice(0, 3).map((asset, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => handleAssetClick(asset)}
              >
                Asset {index + 1}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state for creative assets */}
      {sponsor.creative_assets.length === 0 && (
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center py-2">
            No creative assets uploaded yet
          </p>
        </div>
      )}
    </Card>
  );
};
