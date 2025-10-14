import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Share2, Instagram, Facebook, Twitter, Linkedin, Loader2 } from 'lucide-react';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { validateSocialMediaURL } from '@/lib/validationUtils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface SocialsFormData {
  instagram_link?: string;
  facebook_link?: string;
  twitter_link?: string;
  linkedin_link?: string;
  tiktok_link?: string;
}

interface SocialsStepProps {
  // Props removed - component handles completion internally
}

export const SocialsStep = ({}: SocialsStepProps) => {
  const { profile, loading: profileLoading, updateProfile, completeOnboarding, refetch } = useBusinessProfile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SocialsFormData>({
    mode: 'onBlur',
    defaultValues: {
      instagram_link: '',
      facebook_link: '',
      twitter_link: '',
      linkedin_link: '',
      tiktok_link: '',
    },
  });

  const formData = watch();

  // Load existing social links
  useEffect(() => {
    if (profile) {
      setValue('instagram_link', profile.instagram_link || '');
      setValue('facebook_link', profile.facebook_link || '');
      setValue('twitter_link', profile.twitter_link || '');
      setValue('linkedin_link', profile.linkedin_link || '');
      setValue('tiktok_link', (profile as any).tiktok_link || '');
    }
  }, [profile, setValue]);

  const validateField = (platform: string, url: string) => {
    if (!url || !url.trim()) {
      // Clear error if field is empty (optional field)
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[platform];
        return newErrors;
      });
      return true;
    }

    const validation = validateSocialMediaURL(url, platform);
    if (!validation.isValid) {
      setValidationErrors((prev) => ({
        ...prev,
        [platform]: validation.error || 'Invalid URL',
      }));
      return false;
    }

    // Clear error if valid
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[platform];
      return newErrors;
    });
    return true;
  };

  const handleBlur = (platform: string, url: string) => {
    validateField(platform, url);
  };

  const onSubmit = async (data: SocialsFormData) => {
    // Validate all filled fields
    const platformValidations = [
      { platform: 'instagram', url: data.instagram_link },
      { platform: 'facebook', url: data.facebook_link },
      { platform: 'twitter', url: data.twitter_link },
      { platform: 'linkedin', url: data.linkedin_link },
      { platform: 'tiktok', url: data.tiktok_link },
    ];

    let hasErrors = false;
    platformValidations.forEach(({ platform, url }) => {
      if (url && url.trim()) {
        const isValid = validateField(platform, url);
        if (!isValid) hasErrors = true;
      }
    });

    if (hasErrors) {
      toast({
        title: 'Validation error',
        description: 'Please fix the invalid URLs before continuing.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);

      const updates = {
        instagram_link: data.instagram_link?.trim() || undefined,
        facebook_link: data.facebook_link?.trim() || undefined,
        twitter_link: data.twitter_link?.trim() || undefined,
        linkedin_link: data.linkedin_link?.trim() || undefined,
        tiktok_link: data.tiktok_link?.trim() || undefined,
      };

      await updateProfile(updates);

      // Refetch and validate profile before completing onboarding
      await refetch();
      
      if (!profile?.business_name || !profile?.industry || !profile?.city || !profile?.state || !profile?.domain) {
        toast({
          title: 'Profile incomplete',
          description: 'Please complete your business info first.',
          variant: 'destructive',
        });
        navigate('/business/onboarding');
        return;
      }

      // Complete onboarding
      await completeOnboarding();

      toast({
        title: 'Profile complete!',
        description: 'Your business profile has been set up successfully.',
      });

      // Navigate to dashboard
      navigate('/business/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error saving links',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = async () => {
    try {
      setIsSaving(true);
      
      // Refetch and validate profile before completing onboarding
      await refetch();
      
      if (!profile?.business_name || !profile?.industry || !profile?.city || !profile?.state || !profile?.domain) {
        toast({
          title: 'Profile incomplete',
          description: 'Please complete your business info first.',
          variant: 'destructive',
        });
        navigate('/business/onboarding');
        return;
      }

      // Complete onboarding without social links
      await completeOnboarding();

      toast({
        title: 'Profile complete!',
        description: 'Your business profile has been set up successfully.',
      });

      // Navigate to dashboard
      navigate('/business/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
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
          <Share2 className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold">Connect Your Social Media</h2>
        <p className="text-muted-foreground text-lg">
          Optional - Add your social links to build trust with teams
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-6 sm:p-8 space-y-6">
          {/* Instagram */}
          <div className="space-y-2">
            <Label htmlFor="instagram_link" className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-pink-600" />
              Instagram
            </Label>
            <Input
              id="instagram_link"
              type="url"
              placeholder="https://instagram.com/yourcompany"
              {...register('instagram_link')}
              onBlur={(e) => handleBlur('instagram', e.target.value)}
              className={validationErrors.instagram ? 'border-destructive' : ''}
            />
            {validationErrors.instagram && (
              <p className="text-sm text-destructive">{validationErrors.instagram}</p>
            )}
          </div>

          {/* Facebook */}
          <div className="space-y-2">
            <Label htmlFor="facebook_link" className="flex items-center gap-2">
              <Facebook className="h-4 w-4 text-blue-600" />
              Facebook
            </Label>
            <Input
              id="facebook_link"
              type="url"
              placeholder="https://facebook.com/yourcompany"
              {...register('facebook_link')}
              onBlur={(e) => handleBlur('facebook', e.target.value)}
              className={validationErrors.facebook ? 'border-destructive' : ''}
            />
            {validationErrors.facebook && (
              <p className="text-sm text-destructive">{validationErrors.facebook}</p>
            )}
          </div>

          {/* Twitter/X */}
          <div className="space-y-2">
            <Label htmlFor="twitter_link" className="flex items-center gap-2">
              <Twitter className="h-4 w-4" />
              Twitter / X
            </Label>
            <Input
              id="twitter_link"
              type="url"
              placeholder="https://twitter.com/yourcompany"
              {...register('twitter_link')}
              onBlur={(e) => handleBlur('twitter', e.target.value)}
              className={validationErrors.twitter ? 'border-destructive' : ''}
            />
            {validationErrors.twitter && (
              <p className="text-sm text-destructive">{validationErrors.twitter}</p>
            )}
          </div>

          {/* LinkedIn */}
          <div className="space-y-2">
            <Label htmlFor="linkedin_link" className="flex items-center gap-2">
              <Linkedin className="h-4 w-4 text-blue-700" />
              LinkedIn
            </Label>
            <Input
              id="linkedin_link"
              type="url"
              placeholder="https://linkedin.com/company/yourcompany"
              {...register('linkedin_link')}
              onBlur={(e) => handleBlur('linkedin', e.target.value)}
              className={validationErrors.linkedin ? 'border-destructive' : ''}
            />
            {validationErrors.linkedin && (
              <p className="text-sm text-destructive">{validationErrors.linkedin}</p>
            )}
          </div>

          {/* TikTok */}
          <div className="space-y-2">
            <Label htmlFor="tiktok_link" className="flex items-center gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
              TikTok
            </Label>
            <Input
              id="tiktok_link"
              type="url"
              placeholder="https://tiktok.com/@yourcompany"
              {...register('tiktok_link')}
              onBlur={(e) => handleBlur('tiktok', e.target.value)}
              className={validationErrors.tiktok ? 'border-destructive' : ''}
            />
            {validationErrors.tiktok && (
              <p className="text-sm text-destructive">{validationErrors.tiktok}</p>
            )}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleSkip}
            disabled={isSaving}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Skip
          </Button>
          <Button
            type="submit"
            disabled={isSaving || Object.keys(validationErrors).length > 0}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save & Continue'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
