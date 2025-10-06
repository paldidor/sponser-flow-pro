import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";

interface BusinessProfileFormProps {
  onComplete: () => void;
}

const INDUSTRIES = [
  "Technology",
  "Sports & Recreation",
  "Healthcare",
  "Retail",
  "Finance",
  "Education",
  "Manufacturing",
  "Food & Beverage",
  "Real Estate",
  "Professional Services",
  "Other",
];

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming",
];

const BusinessProfileForm = ({ onComplete }: BusinessProfileFormProps) => {
  const [formData, setFormData] = useState({
    business_name: "",
    industry: "",
    city: "",
    state: "",
    website: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { createProfile, updateProfile, profile } = useBusinessProfile();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.business_name.trim()) {
      toast({
        title: "Business name required",
        description: "Please enter your business name",
        variant: "destructive",
      });
      return;
    }

    if (!formData.industry) {
      toast({
        title: "Industry required",
        description: "Please select your industry",
        variant: "destructive",
      });
      return;
    }

    if (!formData.city.trim() || !formData.state) {
      toast({
        title: "Location required",
        description: "Please enter your city and state",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const profileData = {
        business_name: formData.business_name.trim(),
        industry: formData.industry,
        city: formData.city.trim(),
        state: formData.state,
        website: formData.website.trim() || undefined,
        current_onboarding_step: 'business_profile',
      };

      let result;
      if (profile) {
        result = await updateProfile(profileData);
      } else {
        result = await createProfile(profileData);
      }

      if (result.error) throw result.error;

      toast({
        title: "Profile saved",
        description: "Your business profile has been created successfully",
      });

      onComplete();
    } catch (error: any) {
      console.error('Error saving business profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center space-y-4 mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Building2 className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold">Business Information</h2>
        <p className="text-muted-foreground text-lg">
          Tell us about your business to help teams understand who you are
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-card border rounded-lg p-8">
        {/* Business Name */}
        <div className="space-y-2">
          <Label htmlFor="business_name">
            Business Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="business_name"
            placeholder="Acme Corporation"
            value={formData.business_name}
            onChange={(e) => handleChange('business_name', e.target.value)}
            required
          />
        </div>

        {/* Industry */}
        <div className="space-y-2">
          <Label htmlFor="industry">
            Industry <span className="text-destructive">*</span>
          </Label>
          <Select value={formData.industry} onValueChange={(value) => handleChange('industry', value)}>
            <SelectTrigger id="industry">
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">
              City <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="city"
                placeholder="San Francisco"
                className="pl-10"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">
              State <span className="text-destructive">*</span>
            </Label>
            <Select value={formData.state} onValueChange={(value) => handleChange('state', value)}>
              <SelectTrigger id="state">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Website (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="website">Website (Optional)</Label>
          <Input
            id="website"
            type="url"
            placeholder="https://www.example.com"
            value={formData.website}
            onChange={(e) => handleChange('website', e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Continue to Review"}
        </Button>
      </form>
    </div>
  );
};

export default BusinessProfileForm;
