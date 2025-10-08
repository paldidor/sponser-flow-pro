import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatLocation } from "@/lib/statAbbreviations";
import { useIsMobile } from "@/hooks/use-mobile";
import { InlineLogoUploader } from "./InlineLogoUploader";

interface DashboardHeaderProps {
  teamName?: string;
  location?: string;
  sport?: string;
  logoUrl?: string;
  notificationCount?: number;
  onEditProfile?: () => void;
  onLogoUpdated?: () => void;
}

export const DashboardHeader = ({ 
  teamName = "Thunder Youth Soccer",
  location,
  sport,
  logoUrl,
  notificationCount = 0,
  onEditProfile,
  onLogoUpdated
}: DashboardHeaderProps) => {
  const isMobile = useIsMobile();
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
      <div className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 mx-auto max-w-7xl">
        {/* Left: Logo + Branding */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Team Logo - Inline Uploader */}
          <InlineLogoUploader
            teamName={teamName}
            currentLogo={logoUrl}
            onUploaded={onLogoUpdated}
          />
          
          <div className="flex flex-col min-w-0">
            <h1 className="text-base sm:text-xl font-semibold text-foreground truncate">
              {teamName}
            </h1>
            {(sport || location) && (
              <p className="text-xs text-muted-foreground font-medium truncate">
                {sport}
                {sport && location && " • "}
                {location && formatLocation(location, isMobile)}
              </p>
            )}
          </div>
        </div>

        {/* Right: Notifications + Profile */}
        <div className="flex items-center gap-1 sm:gap-3">
          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-10 w-10 sm:h-9 sm:w-9 touch-manipulation">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {notificationCount}
                  </Badge>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 sm:w-96" align="end">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Notifications</h4>
                {notificationCount > 0 ? (
                  <div className="text-sm text-muted-foreground">
                    You have {notificationCount} new notification{notificationCount !== 1 ? 's' : ''}.
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No new notifications.
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Profile Button */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 sm:h-9 sm:w-9 touch-manipulation">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={logoUrl || ""} alt={teamName} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {teamName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">User menu</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 sm:w-72" align="end">
              <div className="space-y-2">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium truncate">{teamName}</p>
                  <p className="text-xs text-muted-foreground">Team Account</p>
                </div>
                <div className="border-t pt-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-sm h-10 touch-manipulation" 
                    size="sm"
                    onClick={onEditProfile}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
};
