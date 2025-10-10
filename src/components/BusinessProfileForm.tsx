import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, MapPin, Instagram, Facebook, Linkedin, Youtube, Twitter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { validateSocialMediaURL } from "@/lib/validationUtils";

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

const EMPLOYEE_RANGES = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
];

const MARKETS_SERVED = [
  "Local",
  "Regional",
  "National",
  "International",
];

const BusinessProfileForm = ({ onComplete }: BusinessProfileFormProps) => {
  const [formData, setFormData] = useState({
    business_name: "",
    industry: "",
    city: "",
    state: "",
    zip_code: "",
    website: "",
    company_bio: "",
    main_values: [] as string[],
    number_of_employees: "",
    markets_served: "",
    instagram_link: "",
    facebook_link: "",
    linkedin_link: "",
    youtube_link: "",
    twitter_link: "",
  });
  const [currentValue, setCurrentValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { createProfile, updateProfile, profile } = useBusinessProfile();

  const handleChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddValue = () => {
    if (currentValue.trim() && formData.main_values.length < 5) {
      setFormData(prev => ({
        ...prev,
        main_values: [...prev.main_values, currentValue.trim()]
      }));
      setCurrentValue("");
    }
  };

  const handleRemoveValue = (index: number) => {
    setFormData(prev => ({
      ...prev,
      main_values: prev.main_values.filter((_, i) => i !== index)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddValue();
    }
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

    // Validate social media URLs
    const socialLinks = [
      { platform: 'Instagram', url: formData.instagram_link },
      { platform: 'Facebook', url: formData.facebook_link },
      { platform: 'LinkedIn', url: formData.linkedin_link },
      { platform: 'YouTube', url: formData.youtube_link },
      { platform: 'Twitter', url: formData.twitter_link },
    ];

    for (const { platform, url } of socialLinks) {
      if (url) {
        const validation = validateSocialMediaURL(url, platform.toLowerCase());
        if (!validation.isValid) {
          toast({
            title: "Invalid social media link",
            description: validation.error,
            variant: "destructive",
          });
          return;
        }
      }
    }

    setIsSubmitting(true);

    try {
      const profileData = {
        business_name: formData.business_name.trim(),
        industry: formData.industry,
        city: formData.city.trim(),
        state: formData.state,
        zip_code: formData.zip_code.trim() || undefined,
        website: formData.website.trim() || undefined,
        company_bio: formData.company_bio.trim() || undefined,
        main_values: formData.main_values.length > 0 ? formData.main_values : undefined,
        number_of_employees: formData.number_of_employees || undefined,
        markets_served: formData.markets_served || undefined,
        instagram_link: formData.instagram_link.trim() || undefined,
        facebook_link: formData.facebook_link.trim() || undefined,
        linkedin_link: formData.linkedin_link.trim() || undefined,
        youtube_link: formData.youtube_link.trim() || undefined,
        twitter_link: formData.twitter_link.trim() || undefined,
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
        <div className="grid md:grid-cols-3 gap-4">
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

          <div className="space-y-2">
            <Label htmlFor="zip_code">
              Zip Code
            </Label>
            <Input
              id="zip_code"
              placeholder="94102"
              value={formData.zip_code}
              onChange={(e) => handleChange('zip_code', e.target.value)}
              maxLength={10}
            />
            <p className="text-xs text-muted-foreground">Optional, helps with AI recommendations</p>
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

        {/* Company Bio */}
        <div className="space-y-2">
          <Label htmlFor="company_bio">Company Bio (Optional)</Label>
          <Textarea
            id="company_bio"
            placeholder="Tell us about your business, what you do, and what makes you unique..."
            value={formData.company_bio}
            onChange={(e) => handleChange('company_bio', e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>

        {/* Main Values */}
        <div className="space-y-2">
          <Label htmlFor="main_values">Company Values (Optional)</Label>
          <p className="text-sm text-muted-foreground mb-2">Add up to 5 core values that define your company</p>
          <div className="flex gap-2">
            <Input
              id="main_values"
              placeholder="e.g., Innovation, Integrity, Community"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={formData.main_values.length >= 5}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddValue}
              disabled={!currentValue.trim() || formData.main_values.length >= 5}
            >
              Add
            </Button>
          </div>
          {formData.main_values.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.main_values.map((value, index) => (
                <div
                  key={index}
                  className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {value}
                  <button
                    type="button"
                    onClick={() => handleRemoveValue(index)}
                    className="hover:text-destructive"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Number of Employees */}
        <div className="space-y-2">
          <Label htmlFor="number_of_employees">Number of Employees (Optional)</Label>
          <Select value={formData.number_of_employees} onValueChange={(value) => handleChange('number_of_employees', value)}>
            <SelectTrigger id="number_of_employees">
              <SelectValue placeholder="Select employee range" />
            </SelectTrigger>
            <SelectContent>
              {EMPLOYEE_RANGES.map((range) => (
                <SelectItem key={range} value={range}>
                  {range}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Markets Served */}
        <div className="space-y-2">
          <Label htmlFor="markets_served">Markets Served (Optional)</Label>
          <Select value={formData.markets_served} onValueChange={(value) => handleChange('markets_served', value)}>
            <SelectTrigger id="markets_served">
              <SelectValue placeholder="Select market reach" />
            </SelectTrigger>
            <SelectContent>
              {MARKETS_SERVED.map((market) => (
                <SelectItem key={market} value={market}>
                  {market}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Social Media Section */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-semibold text-lg">Social Media Links (Optional)</h3>
          
          {/* Instagram */}
          <div className="space-y-2">
            <Label htmlFor="instagram_link" className="flex items-center gap-2">
              <Instagram className="h-4 w-4" />
              Instagram
            </Label>
            <Input
              id="instagram_link"
              type="url"
              placeholder="https://www.instagram.com/yourbusiness"
              value={formData.instagram_link}
              onChange={(e) => handleChange('instagram_link', e.target.value)}
            />
          </div>

          {/* Facebook */}
          <div className="space-y-2">
            <Label htmlFor="facebook_link" className="flex items-center gap-2">
              <Facebook className="h-4 w-4" />
              Facebook
            </Label>
            <Input
              id="facebook_link"
              type="url"
              placeholder="https://www.facebook.com/yourbusiness"
              value={formData.facebook_link}
              onChange={(e) => handleChange('facebook_link', e.target.value)}
            />
          </div>

          {/* LinkedIn */}
          <div className="space-y-2">
            <Label htmlFor="linkedin_link" className="flex items-center gap-2">
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </Label>
            <Input
              id="linkedin_link"
              type="url"
              placeholder="https://www.linkedin.com/company/yourbusiness"
              value={formData.linkedin_link}
              onChange={(e) => handleChange('linkedin_link', e.target.value)}
            />
          </div>

          {/* YouTube */}
          <div className="space-y-2">
            <Label htmlFor="youtube_link" className="flex items-center gap-2">
              <Youtube className="h-4 w-4" />
              YouTube
            </Label>
            <Input
              id="youtube_link"
              type="url"
              placeholder="https://www.youtube.com/yourbusiness"
              value={formData.youtube_link}
              onChange={(e) => handleChange('youtube_link', e.target.value)}
            />
          </div>

          {/* Twitter */}
          <div className="space-y-2">
            <Label htmlFor="twitter_link" className="flex items-center gap-2">
              <Twitter className="h-4 w-4" />
              Twitter / X
            </Label>
            <Input
              id="twitter_link"
              type="url"
              placeholder="https://twitter.com/yourbusiness"
              value={formData.twitter_link}
              onChange={(e) => handleChange('twitter_link', e.target.value)}
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Continue to Review"}
        </Button>
      </form>
    </div>
  );
};

export default BusinessProfileForm;
