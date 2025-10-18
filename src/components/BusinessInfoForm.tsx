import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { US_STATES, INDUSTRIES } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

interface BusinessInfoFormProps {
  onComplete: () => void;
  isSubmitting: boolean;
  onSubmit: (data: BusinessFormData) => Promise<void>;
}

export interface BusinessFormData {
  business_name: string;
  industry: string;
  city: string;
  state: string;
  zip_code: string;
}

const BusinessInfoForm = ({ onComplete, isSubmitting, onSubmit }: BusinessInfoFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<BusinessFormData>({
    business_name: '',
    industry: '',
    city: '',
    state: '',
    zip_code: '',
  });

  const handleChange = (field: keyof BusinessFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.business_name.trim()) {
      toast({
        title: 'Business name required',
        description: 'Please enter your business name',
        variant: 'destructive',
      });
      return false;
    }

    if (!formData.industry) {
      toast({
        title: 'Industry required',
        description: 'Please select your industry',
        variant: 'destructive',
      });
      return false;
    }

    if (!formData.city.trim()) {
      toast({
        title: 'City required',
        description: 'Please enter your city',
        variant: 'destructive',
      });
      return false;
    }

    if (!formData.state) {
      toast({
        title: 'State required',
        description: 'Please select your state',
        variant: 'destructive',
      });
      return false;
    }

    if (!formData.zip_code.trim()) {
      toast({
        title: 'ZIP code required',
        description: 'Please enter your ZIP code',
        variant: 'destructive',
      });
      return false;
    }

    // Validate ZIP code format (5 digits or 5+4 digits)
    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (!zipRegex.test(formData.zip_code.trim())) {
      toast({
        title: 'Invalid ZIP code',
        description: 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await onSubmit(formData);
      onComplete();
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: 'Submission failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl">Tell us about your business</CardTitle>
          <CardDescription>
            We need some basic information to set up your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="business_name">Business Name *</Label>
              <Input
                id="business_name"
                placeholder="Enter your business name"
                value={formData.business_name}
                onChange={(e) => handleChange('business_name', e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry *</Label>
              <Select
                value={formData.industry}
                onValueChange={(value) => handleChange('industry', value)}
                disabled={isSubmitting}
              >
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => handleChange('state', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="state">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zip_code">ZIP Code *</Label>
              <Input
                id="zip_code"
                placeholder="Enter ZIP code (e.g., 12345)"
                value={formData.zip_code}
                onChange={(e) => handleChange('zip_code', e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating your account...' : 'Complete Setup'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessInfoForm;
