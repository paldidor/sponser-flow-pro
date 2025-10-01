import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DashboardHeaderProps {
  teamName?: string;
  notificationCount?: number;
}

export const DashboardHeader = ({ 
  teamName = "Thunder Youth Soccer",
  notificationCount = 0 
}: DashboardHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 mx-auto max-w-7xl">
        {/* Left: Logo + Branding */}
        <div className="flex items-center gap-3">
          {/* Sponsa Logo - Blue gradient circle with S */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold text-foreground">Sponsa</h1>
            <p className="text-xs text-muted-foreground font-medium">Team Dashboard</p>
          </div>
        </div>

        {/* Right: Notifications + Profile */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
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
            <PopoverContent className="w-80" align="end">
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
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={teamName} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {teamName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">User menu</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="end">
              <div className="space-y-2">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{teamName}</p>
                  <p className="text-xs text-muted-foreground">Team Account</p>
                </div>
                <div className="border-t pt-2">
                  <Button variant="ghost" className="w-full justify-start text-sm" size="sm">
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
