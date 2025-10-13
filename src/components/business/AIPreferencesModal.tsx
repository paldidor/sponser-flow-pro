import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Loader2, Target, TrendingUp, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  businessProfile?: {
    city?: string;
    state?: string;
    industry?: string;
  };
}

const AVAILABLE_SPORTS = [
  'Soccer',
  'Basketball',
  'Baseball',
  'Softball',
  'Volleyball',
  'Football',
  'Hockey',
  'Lacrosse',
  'Tennis',
  'Swimming',
  'Track & Field',
  'Wrestling',
];

export const AIPreferencesModal = ({ 
  isOpen, 
  onClose, 
  onComplete,
  businessProfile 
}: AIPreferencesModalProps) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [budgetMin, setBudgetMin] = useState<string>('1000');
  const [budgetMax, setBudgetMax] = useState<string>('5000');
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [searchRadius, setSearchRadius] = useState<number>(50); // miles

  const toggleSport = (sport: string) => {
    setSelectedSports(prev => 
      prev.includes(sport) 
        ? prev.filter(s => s !== sport)
        : [...prev, sport]
    );
  };

  const validateStep = () => {
    if (currentStep === 1) {
      const min = parseInt(budgetMin);
      const max = parseInt(budgetMax);
      if (isNaN(min) || isNaN(max) || min < 0 || max < 0) {
        toast({
          title: "Invalid Budget",
          description: "Please enter valid budget amounts.",
          variant: "destructive",
        });
        return false;
      }
      if (min > max) {
        toast({
          title: "Invalid Range",
          description: "Minimum budget must be less than maximum budget.",
          variant: "destructive",
        });
        return false;
      }
    }
    
    if (currentStep === 2 && selectedSports.length === 0) {
      toast({
        title: "Select at least one sport",
        description: "Please choose the sports you're interested in sponsoring.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSave = async (skipConfirm = false) => {
    if (!skipConfirm && !validateStep()) return;

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const min = parseInt(budgetMin) || 0;
      const max = parseInt(budgetMax) || 999999;
      const radiusKm = Math.round(searchRadius * 1.60934); // Convert miles to km

      const { error } = await supabase
        .from('ai_user_preferences')
        .upsert({
          user_id: user.id,
          preferred_sports: selectedSports.length > 0 ? selectedSports : null,
          budget_range: `[${min},${max}]`,
          interaction_patterns: {
            last_radius_km: radiusKm,
            last_updated: new Date().toISOString(),
            preferences_completed: true,
          },
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "Preferences Saved",
        description: "Your AI advisor is now configured with your preferences!",
      });

      onComplete();
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error Saving Preferences",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    if (selectedSports.length === 0 && budgetMin === '1000' && budgetMax === '5000') {
      // No data entered, just close
      onClose();
    } else {
      // Partial data entered, offer to save
      if (confirm("Save your preferences before leaving? This will help your AI advisor give better recommendations.")) {
        handleSave(true);
      } else {
        onClose();
      }
    }
  };

  const estimatedReach = Math.round((parseInt(budgetMax) || 5000) / 10); // Simple estimate

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleSkip()}>
      <DialogContent className="sm:max-w-[600px] bg-background" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {currentStep === 1 && "Set Your Sponsorship Budget"}
            {currentStep === 2 && "Choose Your Preferred Sports"}
            {currentStep === 3 && "Set Your Search Radius"}
            {currentStep === 4 && "Review Your Preferences"}
          </DialogTitle>
          <DialogDescription>
            {currentStep === 1 && "What's your typical sponsorship budget range? This helps us find teams that fit your investment level."}
            {currentStep === 2 && "Select the sports you're most interested in sponsoring. You can always change this later."}
            {currentStep === 3 && "How far are you willing to sponsor teams from your location?"}
            {currentStep === 4 && "Review your preferences before we find matching teams."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress Indicator */}
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(step => (
              <div 
                key={step}
                className={cn(
                  "h-2 flex-1 rounded-full transition-colors",
                  step <= currentStep ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>

          {/* Step 1: Budget */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budgetMin">Minimum Budget</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="budgetMin"
                      type="number"
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(e.target.value)}
                      className="pl-7"
                      placeholder="1,000"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budgetMax">Maximum Budget</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="budgetMax"
                      type="number"
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(e.target.value)}
                      className="pl-7"
                      placeholder="5,000"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Target className="h-4 w-4 text-primary" />
                  <span>Estimated Impact</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  With a budget of ${parseInt(budgetMin).toLocaleString()} - ${parseInt(budgetMax).toLocaleString()}, 
                  you could reach approximately {estimatedReach.toLocaleString()} people weekly.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Sports */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {AVAILABLE_SPORTS.map(sport => (
                  <Badge
                    key={sport}
                    variant={selectedSports.includes(sport) ? "default" : "outline"}
                    className="cursor-pointer justify-center py-2 hover:scale-105 transition-transform"
                    onClick={() => toggleSport(sport)}
                  >
                    {sport}
                  </Badge>
                ))}
              </div>
              
              {selectedSports.length > 0 && (
                <div className="bg-muted/50 border border-border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    Selected: {selectedSports.join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Radius */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Search Radius</Label>
                  <span className="text-2xl font-bold text-primary">{searchRadius} miles</span>
                </div>
                <Slider
                  value={[searchRadius]}
                  onValueChange={(value) => setSearchRadius(value[0])}
                  min={10}
                  max={100}
                  step={5}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>10 miles</span>
                  <span>100 miles</span>
                </div>
              </div>
              
              {businessProfile && (
                <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>Your Location</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    We'll search for teams within {searchRadius} miles of {businessProfile.city}, {businessProfile.state}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Budget Range</p>
                    <p className="text-sm text-muted-foreground">
                      ${parseInt(budgetMin).toLocaleString()} - ${parseInt(budgetMax).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Preferred Sports</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedSports.length > 0 ? selectedSports.join(', ') : 'Any sport'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Search Radius</p>
                    <p className="text-sm text-muted-foreground">
                      {searchRadius} miles from {businessProfile?.city}, {businessProfile?.state}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <p className="text-sm font-medium text-primary mb-2">🎯 You're all set!</p>
                <p className="text-sm text-muted-foreground">
                  We'll use these preferences to find the best sponsorship opportunities for your business.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isSaving}
            >
              Back
            </Button>
          )}
          
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={isSaving}
          >
            {currentStep === 1 ? "Skip for Now" : "Cancel"}
          </Button>
          
          {currentStep < 4 ? (
            <Button onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button onClick={() => handleSave(false)} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Get Matched with Teams
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
