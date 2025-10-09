import { Bell, User, Settings, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatLocation } from "@/lib/statAbbreviations";
import { useIsMobile } from "@/hooks/use-mobile";
import { InlineLogoUploader } from "../team/InlineLogoUploader";

interface BusinessDashboardHeaderProps {
  businessName?: string;
  location?: string;
  industry?: string;
  logoUrl?: string;
  notificationCount?: number;
  onEditProfile?: () => void;
  onLogoUpdated?: () => void;
}

export const BusinessDashboardHeader = ({ 
  businessName = "Your Business",
  location,
  industry,
  logoUrl,
  notificationCount = 0,
  onEditProfile,
  onLogoUpdated
}: BusinessDashboardHeaderProps) => {
  const isMobile = useIsMobile();
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
      <div className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 mx-auto max-w-7xl">
        {/* Left: Logo + Branding */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Business Logo - Inline Uploader */}
          <InlineLogoUploader
            teamName={businessName}
            currentLogo={logoUrl}
            onUploaded={onLogoUpdated}
          />
          
          <div className="flex flex-col min-w-0">
            <h1 className="text-base sm:text-xl font-semibold text-foreground truncate">
              {businessName}
            </h1>
            {(industry || location) && (
              <p className="text-xs text-muted-foreground font-medium truncate">
                {industry}
                {industry && location && " • "}
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

          {/* Settings Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 sm:h-9 sm:w-9 touch-manipulation">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-background" align="end">
              <DropdownMenuItem 
                className="cursor-pointer h-10 touch-manipulation" 
                onClick={onEditProfile}
              >
                <User className="mr-2 h-4 w-4" />
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer h-10 touch-manipulation text-muted-foreground"
                disabled
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Bank Account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
