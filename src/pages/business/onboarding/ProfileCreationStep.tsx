import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Loader2, X } from 'lucide-react';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Retail",
  "Hospitality",
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
  "West Virginia", "Wisconsin", "Wyoming"
];

const COMPANY_SCOPES = ["Local", "Regional", "National", "Global"];

const profileSchema = z.object({
  business_name: z.string().trim().min(1, "Business name is required").max(100, "Business name must be less than 100 characters"),
  industry: z.string().min(1, "Industry is required"),
  city: z.string().trim().min(1, "City is required").max(50, "City must be less than 50 characters"),
  state: z.string().min(1, "State is required"),
  zip_code: z.string().trim().max(10, "Zip code must be less than 10 characters").optional(),
  domain: z.string().trim().url("Invalid website URL").min(1, "Website is required"),
  company_bio: z.string().trim().max(500, "Company bio must be less than 500 characters").optional(),
  markets_served: z.enum(["Local", "Regional", "National", "Global"], {
    errorMap: () => ({ message: "Company scope is required" }),
  }),
  main_values: z.array(z.string()).max(5, "Maximum 5 company values").optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileCreationStepProps {
  onComplete: () => void;
}

export const ProfileCreationStep = ({ onComplete }: ProfileCreationStepProps) => {
  const { profile, loading: profileLoading, createProfile, updateProfile } = useBusinessProfile();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentValue, setCurrentValue] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: {
      business_name: '',
      industry: '',
      city: '',
      state: '',
      zip_code: '',
      domain: '',
      company_bio: '',
      markets_served: undefined,
      main_values: [],
    },
  });

  const formData = watch();

  // Load existing profile data
  useEffect(() => {
    if (profile) {
      setValue('business_name', profile.business_name || '');
      setValue('industry', profile.industry || '');
      setValue('city', profile.city || '');
      setValue('state', profile.state || '');
      setValue('zip_code', profile.zip_code || '');
      setValue('domain', profile.domain || profile.website || '');
      setValue('company_bio', profile.company_bio || '');
      if (profile.markets_served && COMPANY_SCOPES.includes(profile.markets_served as any)) {
        setValue('markets_served', profile.markets_served as any);
      }
      
      // Parse main_values
      let parsedValues: string[] = [];
      if (Array.isArray(profile.main_values)) {
        parsedValues = profile.main_values;
      } else if (typeof profile.main_values === 'string') {
        try {
          parsedValues = JSON.parse(profile.main_values);
        } catch {
          parsedValues = [];
        }
      }
      setValue('main_values', parsedValues);
    }
  }, [profile, setValue]);

  // Auto-save with debounce
  useEffect(() => {
    if (!profile || profileLoading || isSubmitting) return;

    const timeoutId = setTimeout(async () => {
      // Only auto-save if we have at least business_name filled
      if (!formData.business_name?.trim()) return;

      setIsSaving(true);
      const updates = {
        business_name: formData.business_name,
        industry: formData.industry,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code || undefined,
        domain: formData.domain,
        company_bio: formData.company_bio || undefined,
        markets_served: formData.markets_served,
        main_values: formData.main_values || [],
      };

      await updateProfile(updates);
      setIsSaving(false);
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [formData, profile, profileLoading, isSubmitting, updateProfile]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSubmitting(true);
      setIsSaving(true);

      console.log('[ProfileCreationStep] Submitting profile data:', {
        hasExistingProfile: !!profile,
        formData: data,
      });

      const profileData = {
        business_name: data.business_name,
        industry: data.industry,
        city: data.city,
        state: data.state,
        zip_code: data.zip_code || undefined,
        domain: data.domain,
        company_bio: data.company_bio || undefined,
        markets_served: data.markets_served,
        main_values: data.main_values || [],
        current_onboarding_step: 'social_links',
      };

      let result;
      if (profile) {
        console.log('[ProfileCreationStep] Updating existing profile');
        result = await updateProfile(profileData);
      } else {
        console.log('[ProfileCreationStep] Creating new profile');
        result = await createProfile(profileData);
      }

      console.log('[ProfileCreationStep] Save result:', result);

      // Check if save was successful
      if (result?.error) {
        toast({
          title: 'Error saving profile',
          description: result.error.message || 'Failed to save profile',
          variant: 'destructive',
        });
        return;
      }

      // Verify required fields were saved in the database
      const savedData = result?.data;
      if (!savedData?.business_name || !savedData?.industry || !savedData?.city || !savedData?.state || !savedData?.domain) {
        console.error('[ProfileCreationStep] Validation failed - missing required fields:', savedData);
        toast({
          title: 'Profile incomplete',
          description: 'Required fields are missing. Please ensure all fields are filled.',
          variant: 'destructive',
        });
        return;
      }

      console.log('[ProfileCreationStep] Profile saved successfully, advancing to socials');

      toast({
        title: 'Profile saved',
        description: 'Your business profile has been saved successfully.',
      });

      onComplete();
    } catch (error: any) {
      console.error('[ProfileCreationStep] Error in onSubmit:', error);
      toast({
        title: 'Error saving profile',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
      // Don't reset isSubmitting - we're navigating away
    }
  };

  const handleAddValue = () => {
    const trimmed = currentValue.trim();
    if (!trimmed) return;

    const currentValues = formData.main_values || [];
    
    if (currentValues.length >= 5) {
      toast({
        title: 'Maximum reached',
        description: 'You can only add up to 5 company values.',
        variant: 'destructive',
      });
      return;
    }

    if (currentValues.includes(trimmed)) {
      toast({
        title: 'Duplicate value',
        description: 'This value already exists.',
        variant: 'destructive',
      });
      return;
    }

    setValue('main_values', [...currentValues, trimmed]);
    setCurrentValue('');
  };

  const handleRemoveValue = (index: number) => {
    const currentValues = formData.main_values || [];
    setValue('main_values', currentValues.filter((_, i) => i !== index));
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Building2 className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold">Create Your Profile</h2>
        <p className="text-muted-foreground text-lg">
          Help youth teams and orgs know about potential sponsors
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-6 sm:p-8 space-y-6">
          {/* Business Name */}
          <div className="space-y-2">
            <Label htmlFor="business_name">
              Company or Business Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="business_name"
              placeholder="Enter your business name"
              {...register('business_name')}
              className={errors.business_name ? 'border-destructive' : ''}
            />
            {errors.business_name && (
              <p className="text-sm text-destructive">{errors.business_name.message}</p>
            )}
          </div>

          {/* Industry */}
          <div className="space-y-2">
            <Label htmlFor="industry">
              Industry <span className="text-destructive">*</span>
            </Label>
            <Select value={formData.industry} onValueChange={(value) => setValue('industry', value)}>
              <SelectTrigger id="industry" className={errors.industry ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                {INDUSTRIES.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.industry && (
              <p className="text-sm text-destructive">{errors.industry.message}</p>
            )}
          </div>

          {/* City, State, Zip Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor="city">
                City <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city"
                placeholder="City"
                {...register('city')}
                className={errors.city ? 'border-destructive' : ''}
              />
              {errors.city && (
                <p className="text-sm text-destructive">{errors.city.message}</p>
              )}
            </div>

            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor="state">
                State <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.state} onValueChange={(value) => setValue('state', value)}>
                <SelectTrigger id="state" className={errors.state ? 'border-destructive' : ''}>
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {US_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.state && (
                <p className="text-sm text-destructive">{errors.state.message}</p>
              )}
            </div>

            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor="zip_code">Zip Code</Label>
              <Input
                id="zip_code"
                placeholder="Zip"
                {...register('zip_code')}
                className={errors.zip_code ? 'border-destructive' : ''}
              />
              {errors.zip_code && (
                <p className="text-sm text-destructive">{errors.zip_code.message}</p>
              )}
            </div>
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="domain">
              Website <span className="text-destructive">*</span>
            </Label>
            <Input
              id="domain"
              type="url"
              placeholder="https://yourcompany.com"
              {...register('domain')}
              className={errors.domain ? 'border-destructive' : ''}
            />
            {errors.domain && (
              <p className="text-sm text-destructive">{errors.domain.message}</p>
            )}
          </div>

          {/* Company Bio */}
          <div className="space-y-2">
            <Label htmlFor="company_bio">Company Bio (Optional)</Label>
            <Textarea
              id="company_bio"
              placeholder="Tell us about your company or business"
              rows={4}
              {...register('company_bio')}
              className={errors.company_bio ? 'border-destructive' : ''}
            />
            <p className="text-xs text-muted-foreground">
              {formData.company_bio?.length || 0} / 500 characters
            </p>
            {errors.company_bio && (
              <p className="text-sm text-destructive">{errors.company_bio.message}</p>
            )}
          </div>

          {/* Company Scope */}
          <div className="space-y-2">
            <Label htmlFor="markets_served">
              Company Scope <span className="text-destructive">*</span>
            </Label>
            <Select value={formData.markets_served} onValueChange={(value: any) => setValue('markets_served', value)}>
              <SelectTrigger id="markets_served" className={errors.markets_served ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select scope" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                {COMPANY_SCOPES.map((scope) => (
                  <SelectItem key={scope} value={scope}>
                    {scope}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.markets_served && (
              <p className="text-sm text-destructive">{errors.markets_served.message}</p>
            )}
          </div>

          {/* Company Values */}
          <div className="space-y-2">
            <Label htmlFor="company_values">Company Values (Optional)</Label>
            <p className="text-sm text-muted-foreground">Add up to 5 values that represent your company</p>
            <div className="flex gap-2">
              <Input
                id="company_values"
                placeholder="e.g., Innovation, Integrity, Community"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddValue();
                  }
                }}
                disabled={(formData.main_values?.length || 0) >= 5}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddValue}
                disabled={!currentValue.trim() || (formData.main_values?.length || 0) >= 5}
              >
                Add
              </Button>
            </div>
            {formData.main_values && formData.main_values.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.main_values.map((value, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {value}
                    <button
                      type="button"
                      onClick={() => handleRemoveValue(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Submit Button */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {isSaving && (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Auto-saving...
              </span>
            )}
          </div>
          <Button type="submit" disabled={!isValid || isSaving} className="w-full sm:w-auto">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
