import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, MapPin, Users, Instagram, Facebook, Twitter, Mail, AlertCircle, Calendar, Trophy, Target, Linkedin, Youtube, ExternalLink, Check, X } from "lucide-react";
import ProgressIndicator from "./ProgressIndicator";
import { TeamProfile } from "@/types/flow";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validateSocialMediaURL, validateEmail } from "@/lib/validationUtils";

interface ProfileReviewProps {
  teamData: TeamProfile | null;
  onApprove: () => void;
  isManualEntry?: boolean;
  onProfileUpdate?: (updatedProfile: TeamProfile) => void;
}

const ProfileReview = ({ teamData, onApprove, isManualEntry = false, onProfileUpdate }: ProfileReviewProps) => {
  const [team, setTeam] = useState<TeamProfile | null>(teamData);
  const [isLoading, setIsLoading] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<any>("");
  const [isSaving, setIsSaving] = useState(false);
  const [newTagValue, setNewTagValue] = useState<string>("");
  const { toast } = useToast();

  const defaultTeam: TeamProfile = {
    team_name: "",
    main_values: [],
    location: "",
    team_bio: "",
    sport: "",
    number_of_players: "",
    level_of_play: "",
    competition_scope: "Local",
    season_start_date: "",
    season_end_date: "",
    organization_status: "",
    instagram_link: "",
    facebook_link: "",
    linkedin_link: "",
    youtube_link: "",
    twitter_link: "",
    instagram_followers: 0,
    facebook_followers: 0,
    linkedin_followers: 0,
    twitter_followers: 0,
    youtube_followers: 0,
    email_list_size: 0,
    images: [],
  };

  const fetchTeamProfile = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No authenticated user');
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('team_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching team profile:', error);
        toast({
          title: "Error loading profile",
          description: "Failed to load your team profile. Please try again.",
          variant: "destructive",
        });
        // Continue with default/empty team if profile doesn't exist yet
        setTeam(defaultTeam);
      } else if (data) {
        console.log('Fetched team profile (raw):', data);
        console.log('main_values type:', typeof data.main_values, 'value:', data.main_values);
        
        // Parse main_values with robust cleaning
        const parseMainValues = (value: any): string[] => {
          if (Array.isArray(value)) {
            return value.map(v => String(v).replace(/^["'\[\]]+|["'\[\]]+$/g, '').trim()).filter(Boolean);
          }
          
          if (typeof value === 'string') {
            const trimmed = value.trim();
            
            // Try to parse as JSON if it looks like a JSON array
            if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
              try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed)) {
                  return parsed.map(v => String(v).trim()).filter(Boolean);
                }
              } catch (e) {
                // If JSON parsing fails, fall through to comma-splitting
                console.log('JSON parse failed, using comma-split fallback');
              }
            }
            
            // Fallback: split by comma and clean up each value
            return trimmed
              .split(',')
              .map(v => v.replace(/^["'\[\]]+|["'\[\]]+$/g, '').trim())
              .filter(Boolean);
          }
          
          return [];
        };
        
        const parsedMainValues = parseMainValues(data.main_values);
        
        console.log('Parsed main_values:', parsedMainValues);
        
        setTeam({
          team_name: data.team_name || "",
          main_values: parsedMainValues,
          location: data.location || "",
          team_bio: data.team_bio || "",
          sport: data.sport || "",
          number_of_players: data.number_of_players || "",
          level_of_play: data.level_of_play || "",
          competition_scope: data.competition_scope || "Local",
          season_start_date: data.season_start_date || "",
          season_end_date: data.season_end_date || "",
          organization_status: data.organization_status || "",
          instagram_link: data.instagram_link || "",
          facebook_link: data.facebook_link || "",
          linkedin_link: data.linkedin_link || "",
          youtube_link: data.youtube_link || "",
          twitter_link: data.twitter_link || "",
          instagram_followers: data.instagram_followers || 0,
          facebook_followers: data.facebook_followers || 0,
          twitter_followers: data.twitter_followers || 0,
          email_list_size: data.email_list_size || 0,
          images: [],
        });
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!teamData) {
      fetchTeamProfile();
    }
  }, [teamData, toast]);

  const handleEdit = (field: string, currentValue: any) => {
    setEditingField(field);
    setEditValue(currentValue);
    setNewTagValue("");
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    const updatedValues = currentTeam.main_values.filter(v => v !== tagToRemove);
    setIsSaving(true);
    
    // Store old team for rollback
    const oldTeam = team;
    
    try {
      // Optimistically update UI
      const updatedTeam = team ? { ...team, main_values: updatedValues } : null;
      setTeam(updatedTeam);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Revert optimistic update
        setTeam(oldTeam);
        toast({
          title: "Error",
          description: "You must be logged in to save changes",
          variant: "destructive",
        });
        return;
      }

      // Ensure a profile row exists; insert if missing, otherwise update
      let error: any = null;
      const { data: existingProfile, error: existingErr } = await supabase
        .from('team_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingErr) {
        error = existingErr as any;
      } else if (!existingProfile) {
        const { error: insertError } = await supabase
          .from('team_profiles')
          .insert({ user_id: user.id, main_values: updatedValues });
        error = insertError as any;
      } else {
        const { error: updateError } = await supabase
          .from('team_profiles')
          .update({ main_values: updatedValues })
          .eq('user_id', user.id);
        error = updateError as any;
      }

      if (error) {
        // Revert optimistic update
        setTeam(oldTeam);
        console.error('Error updating profile:', error);
        toast({
          title: "Error saving changes",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Tag removed ✓",
          description: "Your profile has been updated",
        });
        
        // Notify parent component
        if (onProfileUpdate && updatedTeam) {
          onProfileUpdate(updatedTeam);
        }
      }
    } catch (err) {
      // Revert optimistic update
      setTeam(oldTeam);
      console.error('Unexpected error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = async () => {
    if (!newTagValue.trim()) {
      toast({
        title: "Empty Value",
        description: "Please enter a value to add",
        variant: "destructive",
      });
      return;
    }

    if (currentTeam.main_values.includes(newTagValue.trim())) {
      toast({
        title: "Duplicate Value",
        description: "This value already exists",
        variant: "destructive",
      });
      setNewTagValue("");
      return;
    }
    
    const updatedValues = [...currentTeam.main_values, newTagValue.trim()];
    setIsSaving(true);
    
    // Store old team for rollback
    const oldTeam = team;
    
    try {
      // Optimistically update UI
      const updatedTeam = team ? { ...team, main_values: updatedValues } : null;
      setTeam(updatedTeam);
      setNewTagValue("");
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Revert optimistic update
        setTeam(oldTeam);
        setNewTagValue(newTagValue);
        toast({
          title: "Error",
          description: "You must be logged in to save changes",
          variant: "destructive",
        });
        return;
      }

      // Ensure a profile row exists; insert if missing, otherwise update
      let error: any = null;
      const { data: existingProfile, error: existingErr } = await supabase
        .from('team_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingErr) {
        error = existingErr as any;
      } else if (!existingProfile) {
        const { error: insertError } = await supabase
          .from('team_profiles')
          .insert({ user_id: user.id, main_values: updatedValues });
        error = insertError as any;
      } else {
        const { error: updateError } = await supabase
          .from('team_profiles')
          .update({ main_values: updatedValues })
          .eq('user_id', user.id);
        error = updateError as any;
      }

      if (error) {
        // Revert optimistic update
        setTeam(oldTeam);
        setNewTagValue(newTagValue);
        console.error('Error updating profile:', error);
        toast({
          title: "Error saving changes",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Tag added ✓",
          description: "Your profile has been updated",
        });
        
        // Notify parent component
        if (onProfileUpdate && updatedTeam) {
          onProfileUpdate(updatedTeam);
        }
      }
    } catch (err) {
      // Revert optimistic update
      setTeam(oldTeam);
      setNewTagValue(newTagValue);
      console.error('Unexpected error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async (field: string) => {
    // Validate before saving
    if (field.includes('_link') && editValue) {
      const platform = field.replace('_link', '');
      const validation = validateSocialMediaURL(editValue, platform);
      if (!validation.isValid) {
        toast({
          title: "Invalid URL",
          description: validation.error,
          variant: "destructive",
        });
        return;
      }
    }

    // Validate required text fields
    const requiredFields = ['team_name', 'sport', 'location'];
    if (requiredFields.includes(field) && (!editValue || editValue.trim().length === 0)) {
      toast({
        title: "Required Field",
        description: `${field.replace('_', ' ')} cannot be empty`,
        variant: "destructive",
      });
      return;
    }

    // Validate numeric fields
    const numericFields = ['instagram_followers', 'facebook_followers', 'linkedin_followers', 'twitter_followers', 'youtube_followers', 'email_list_size'];
    if (numericFields.includes(field)) {
      const numValue = parseInt(editValue);
      if (isNaN(numValue) || numValue < 0) {
        toast({
          title: "Invalid Number",
          description: "Please enter a valid positive number",
          variant: "destructive",
        });
        return;
      }
    }

    setIsSaving(true);
    
    // Store old team for rollback
    const oldTeam = team;
    
    try {
      // Optimistically update UI first
      const updatedTeam = team ? { ...team, [field]: editValue } : null;
      setTeam(updatedTeam);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Revert optimistic update
        setTeam(oldTeam);
        toast({
          title: "Error",
          description: "You must be logged in to save changes",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      // Prepare the update object with proper types
      const value = numericFields.includes(field) ? Number(editValue) : editValue;
      const updateData: any = { [field]: value };

      // Ensure a profile row exists; insert if missing, otherwise update
      let error: any = null;
      const { data: existingProfile, error: existingErr } = await supabase
        .from('team_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingErr) {
        error = existingErr as any;
      } else if (!existingProfile) {
        const { error: insertError } = await supabase
          .from('team_profiles')
          .insert({ user_id: user.id, ...updateData });
        error = insertError as any;
      } else {
        const { error: updateError } = await supabase
          .from('team_profiles')
          .update(updateData)
          .eq('user_id', user.id);
        error = updateError as any;
      }

      if (error) {
        // Revert optimistic update on error
        setTeam(oldTeam);
        console.error('Error updating profile:', error);
        toast({
          title: "Error saving changes",
          description: error.message,
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      } else {
        // Show success indicator
        toast({
          title: "Saved ✓",
          description: "Your changes have been saved",
        });
        
        // Notify parent component of update
        if (onProfileUpdate && updatedTeam) {
          onProfileUpdate(updatedTeam);
        }
        
        // Close edit mode after a brief delay
        setTimeout(() => {
          setEditingField(null);
        }, 500);
      }
    } catch (err) {
      // Revert optimistic update on error
      setTeam(oldTeam);
      console.error('Unexpected error:', err);
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = async () => {
    // Ensure all data is saved before continuing
    await fetchTeamProfile();
    onApprove();
  };

  const currentTeam = team || defaultTeam;
  const totalReach = (currentTeam.instagram_followers || 0) + (currentTeam.facebook_followers || 0) + (currentTeam.linkedin_followers || 0) + (currentTeam.twitter_followers || 0) + (currentTeam.youtube_followers || 0) + (currentTeam.email_list_size || 0);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Review Your Team Profile</h1>
          <p className="text-muted-foreground">
            {isManualEntry 
              ? "Fill in your team details below. All fields are editable."
              : "We've automatically filled in your team details. Review and edit any details before continuing."}
          </p>
        </div>

        <ProgressIndicator currentStep={2} />

        {!isManualEntry && (
          <Card className="p-6 bg-secondary/30 border-secondary">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
              <div className="space-y-1 text-sm">
                <p className="font-medium">💡 Maximize your profile appeal to sponsors:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>📸 Add photos to showcase your team better</li>
                  <li>📧 Add your email subscriber count to show sponsors your reach</li>
                </ul>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Team Photos</h2>
            <Button variant="ghost" size="sm">
              <Pencil className="w-4 h-4 mr-2" />
              Edit Photos
            </Button>
          </div>
          
          {isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              Loading profile data...
            </div>
          )}
          
          {!isLoading && currentTeam.images && currentTeam.images.length > 0 && (
            <div className="mb-4 p-3 bg-accent/10 rounded-lg border border-accent/20">
              <p className="text-sm text-accent-foreground">
                💡 Add more photos to make your profile more appealing to sponsors
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            {currentTeam.images?.map((img, idx) => (
              <div key={idx} className="aspect-video rounded-lg overflow-hidden bg-muted">
                <img src={img} alt={`Team ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
            <div className="aspect-video rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-2 flex items-center justify-center">
                  <span className="text-2xl">📷</span>
                </div>
                <p className="text-sm text-muted-foreground">Add Photo</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Team Information</h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Team Name</h3>
                  {editingField !== 'team_name' && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit('team_name', currentTeam.team_name)}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                {editingField === 'team_name' ? (
                  <div className="flex gap-2">
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder="Enter team name"
                    />
                    <Button 
                      size="sm" 
                      onClick={() => handleSave('team_name')}
                      disabled={isSaving}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                  </div>
                ) : (
                  <p className="text-foreground">{currentTeam.team_name || "Enter team name"}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Main Values</h3>
                  {editingField !== 'main_values' && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit('main_values', currentTeam.main_values)}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                {editingField === 'main_values' ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {currentTeam.main_values && currentTeam.main_values.length > 0 ? (
                        currentTeam.main_values.map((value, idx) => (
                          <Badge key={idx} variant="secondary" className="pl-3 pr-1 py-1">
                            {value}
                            <button
                              onClick={() => handleRemoveTag(value)}
                              disabled={isSaving}
                              className="ml-2 hover:bg-secondary-foreground/20 rounded-full p-0.5 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No values added yet</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newTagValue}
                        onChange={(e) => setNewTagValue(e.target.value)}
                        placeholder="Add a new value"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                      />
                      <Button 
                        size="sm" 
                        onClick={handleAddTag}
                        disabled={isSaving || !newTagValue.trim()}
                      >
                        Add
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setEditingField(null)}
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {currentTeam.main_values && currentTeam.main_values.length > 0 ? (
                      currentTeam.main_values.map((value, idx) => (
                        <Badge key={idx} variant="secondary">{value}</Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">Add team values</span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Location</h3>
                  {editingField !== 'location' && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit('location', currentTeam.location)}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                {editingField === 'location' ? (
                  <div className="flex gap-2">
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder="Enter location"
                    />
                    <Button 
                      size="sm" 
                      onClick={() => handleSave('location')}
                      disabled={isSaving}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{currentTeam.location || "Enter location"}</span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Team Bio</h3>
                  {editingField !== 'team_bio' && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit('team_bio', currentTeam.team_bio)}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                {editingField === 'team_bio' ? (
                  <div className="flex gap-2">
                    <Textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder="Enter team bio"
                      rows={3}
                    />
                    <Button 
                      size="sm" 
                      onClick={() => handleSave('team_bio')}
                      disabled={isSaving}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{currentTeam.team_bio || "Enter team bio"}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Sport</h3>
                  {editingField !== 'sport' && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit('sport', currentTeam.sport)}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                {editingField === 'sport' ? (
                  <div className="flex gap-2">
                    <Select value={editValue} onValueChange={setEditValue}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a sport" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Soccer">Soccer</SelectItem>
                        <SelectItem value="Baseball/Softball">Baseball/Softball</SelectItem>
                        <SelectItem value="Football">Football</SelectItem>
                        <SelectItem value="Basketball">Basketball</SelectItem>
                        <SelectItem value="Tackle Football">Tackle Football</SelectItem>
                        <SelectItem value="Flag Football">Flag Football</SelectItem>
                        <SelectItem value="Gymnastic">Gymnastic</SelectItem>
                        <SelectItem value="Dance">Dance</SelectItem>
                        <SelectItem value="Track & Field">Track & Field</SelectItem>
                        <SelectItem value="Futsal">Futsal</SelectItem>
                        <SelectItem value="Volleyball">Volleyball</SelectItem>
                        <SelectItem value="Lacrosse">Lacrosse</SelectItem>
                        <SelectItem value="Multi-Sport">Multi-Sport</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      size="sm" 
                      onClick={() => handleSave('sport')}
                      disabled={isSaving}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                  </div>
                ) : (
                  <p className="text-foreground">{currentTeam.sport || "Select sport"}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Number of Players</h3>
                  {editingField !== 'number_of_players' && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit('number_of_players', currentTeam.number_of_players)}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                {editingField === 'number_of_players' ? (
                  <div className="flex gap-2">
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder="Enter number of players"
                    />
                    <Button 
                      size="sm" 
                      onClick={() => handleSave('number_of_players')}
                      disabled={isSaving}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-foreground">
                    <Users className="w-4 h-4" />
                    <span>{currentTeam.number_of_players || "Enter number of players"}</span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Level of Play</h3>
                  {editingField !== 'level_of_play' && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit('level_of_play', currentTeam.level_of_play)}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                {editingField === 'level_of_play' ? (
                  <div className="flex gap-2">
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder="Enter level of play"
                    />
                    <Button 
                      size="sm" 
                      onClick={() => handleSave('level_of_play')}
                      disabled={isSaving}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-foreground">
                    <Trophy className="w-4 h-4" />
                    <span>{currentTeam.level_of_play || "Enter level of play"}</span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Competition Scope</h3>
                  {editingField !== 'competition_scope' && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit('competition_scope', currentTeam.competition_scope)}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                {editingField === 'competition_scope' ? (
                  <div className="flex gap-2">
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder="Enter competition scope"
                    />
                    <Button 
                      size="sm" 
                      onClick={() => handleSave('competition_scope')}
                      disabled={isSaving}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                  </div>
                ) : (
                  <Badge variant="outline">{currentTeam.competition_scope || "Local"}</Badge>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Organization Status</h3>
                  {editingField !== 'organization_status' && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit('organization_status', currentTeam.organization_status)}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                {editingField === 'organization_status' ? (
                  <div className="flex gap-2">
                    <Select value={editValue} onValueChange={setEditValue}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select organization status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="501(C)">501(C)</SelectItem>
                        <SelectItem value="For-Profit">For-Profit</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      size="sm" 
                      onClick={() => handleSave('organization_status')}
                      disabled={isSaving}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-foreground">
                    <Target className="w-4 h-4" />
                    <span>{currentTeam.organization_status || "Select organization status"}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Social Media Presence</h2>
            
            <div className="space-y-4">
              {/* Instagram */}
              <div className="flex items-center justify-between p-3 rounded-lg border bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Instagram className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">Instagram</div>
                    {editingField === 'instagram_link' ? (
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="https://instagram.com/..."
                          className="w-64"
                        />
                        <Button 
                          size="sm" 
                          onClick={() => handleSave('instagram_link')}
                          disabled={isSaving}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : currentTeam.instagram_link ? (
                      <div className="flex items-center gap-2">
                        <a 
                          href={currentTeam.instagram_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                        >
                          View Profile <ExternalLink className="w-3 h-3" />
                        </a>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit('instagram_link', currentTeam.instagram_link)}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary h-6 px-2 text-xs"
                        onClick={() => handleEdit('instagram_link', '')}
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        Add Link
                      </Button>
                    )}
                  </div>
                </div>
                {editingField === 'instagram_followers' ? (
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(Number(e.target.value))}
                      placeholder="Followers"
                      className="w-32"
                    />
                    <Button 
                      size="sm" 
                      onClick={() => handleSave('instagram_followers')}
                      disabled={isSaving}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {currentTeam.instagram_followers && currentTeam.instagram_followers > 0 ? (
                      <>
                        <span className="font-semibold">{currentTeam.instagram_followers.toLocaleString()} followers</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit('instagram_followers', currentTeam.instagram_followers)}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                      </>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit('instagram_followers', 0)}
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        Add Followers
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Facebook */}
              <div className="flex items-center justify-between p-3 rounded-lg border bg-blue-50 dark:bg-blue-950/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <Facebook className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">Facebook</div>
                    {editingField === 'facebook_link' ? (
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="https://facebook.com/..."
                          className="w-64"
                        />
                        <Button 
                          size="sm" 
                          onClick={() => handleSave('facebook_link')}
                          disabled={isSaving}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : currentTeam.facebook_link ? (
                      <div className="flex items-center gap-2">
                        <a 
                          href={currentTeam.facebook_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                        >
                          View Profile <ExternalLink className="w-3 h-3" />
                        </a>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit('facebook_link', currentTeam.facebook_link)}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary h-6 px-2 text-xs"
                        onClick={() => handleEdit('facebook_link', '')}
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        Add Link
                      </Button>
                    )}
                  </div>
                </div>
                {editingField === 'facebook_followers' ? (
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(Number(e.target.value))}
                      placeholder="Followers"
                      className="w-32"
                    />
                    <Button 
                      size="sm" 
                      onClick={() => handleSave('facebook_followers')}
                      disabled={isSaving}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {currentTeam.facebook_followers && currentTeam.facebook_followers > 0 ? (
                      <>
                        <span className="font-semibold">{currentTeam.facebook_followers.toLocaleString()} followers</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit('facebook_followers', currentTeam.facebook_followers)}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                      </>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit('facebook_followers', 0)}
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        Add Followers
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* LinkedIn */}
              <div className="flex items-center justify-between p-3 rounded-lg border bg-blue-50 dark:bg-blue-950/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center">
                    <Linkedin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">LinkedIn</div>
                    {editingField === 'linkedin_link' ? (
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="https://linkedin.com/..."
                          className="w-64"
                        />
                        <Button 
                          size="sm" 
                          onClick={() => handleSave('linkedin_link')}
                          disabled={isSaving}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : currentTeam.linkedin_link ? (
                      <div className="flex items-center gap-2">
                        <a 
                          href={currentTeam.linkedin_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                        >
                          View Profile <ExternalLink className="w-3 h-3" />
                        </a>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit('linkedin_link', currentTeam.linkedin_link)}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary h-6 px-2 text-xs"
                        onClick={() => handleEdit('linkedin_link', '')}
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        Add Link
                      </Button>
                    )}
                  </div>
                </div>
                {editingField === 'linkedin_followers' ? (
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(Number(e.target.value))}
                      placeholder="Followers"
                      className="w-32"
                    />
                    <Button 
                      size="sm" 
                      onClick={() => handleSave('linkedin_followers')}
                      disabled={isSaving}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {currentTeam.linkedin_followers && currentTeam.linkedin_followers > 0 ? (
                      <>
                        <span className="font-semibold">{currentTeam.linkedin_followers.toLocaleString()} followers</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit('linkedin_followers', currentTeam.linkedin_followers)}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                      </>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit('linkedin_followers', 0)}
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        Add Followers
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Twitter */}
              <div className="flex items-center justify-between p-3 rounded-lg border bg-sky-50 dark:bg-sky-950/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center">
                    <Twitter className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">Twitter</div>
                    {editingField === 'twitter_link' ? (
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="https://twitter.com/..."
                          className="w-64"
                        />
                        <Button 
                          size="sm" 
                          onClick={() => handleSave('twitter_link')}
                          disabled={isSaving}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : currentTeam.twitter_link ? (
                      <div className="flex items-center gap-2">
                        <a 
                          href={currentTeam.twitter_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                        >
                          View Profile <ExternalLink className="w-3 h-3" />
                        </a>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit('twitter_link', currentTeam.twitter_link)}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary h-6 px-2 text-xs"
                        onClick={() => handleEdit('twitter_link', '')}
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        Add Link
                      </Button>
                    )}
                  </div>
                </div>
                {editingField === 'twitter_followers' ? (
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(Number(e.target.value))}
                      placeholder="Followers"
                      className="w-32"
                    />
                    <Button 
                      size="sm" 
                      onClick={() => handleSave('twitter_followers')}
                      disabled={isSaving}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {currentTeam.twitter_followers && currentTeam.twitter_followers > 0 ? (
                      <>
                        <span className="font-semibold">{currentTeam.twitter_followers.toLocaleString()} followers</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit('twitter_followers', currentTeam.twitter_followers)}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                      </>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit('twitter_followers', 0)}
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        Add Followers
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* YouTube */}
              <div className="flex items-center justify-between p-3 rounded-lg border bg-red-50 dark:bg-red-950/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                    <Youtube className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">YouTube</div>
                    {editingField === 'youtube_link' ? (
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="https://youtube.com/..."
                          className="w-64"
                        />
                        <Button 
                          size="sm" 
                          onClick={() => handleSave('youtube_link')}
                          disabled={isSaving}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : currentTeam.youtube_link ? (
                      <div className="flex items-center gap-2">
                        <a 
                          href={currentTeam.youtube_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                        >
                          View Channel <ExternalLink className="w-3 h-3" />
                        </a>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit('youtube_link', currentTeam.youtube_link)}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary h-6 px-2 text-xs"
                        onClick={() => handleEdit('youtube_link', '')}
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        Add Link
                      </Button>
                    )}
                  </div>
                </div>
                {editingField === 'youtube_followers' ? (
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(Number(e.target.value))}
                      placeholder="Subscribers"
                      className="w-32"
                    />
                    <Button 
                      size="sm" 
                      onClick={() => handleSave('youtube_followers')}
                      disabled={isSaving}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {currentTeam.youtube_followers && currentTeam.youtube_followers > 0 ? (
                      <>
                        <span className="font-semibold">{currentTeam.youtube_followers.toLocaleString()} subscribers</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit('youtube_followers', currentTeam.youtube_followers)}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                      </>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit('youtube_followers', 0)}
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        Add Subscribers
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border bg-green-50 dark:bg-green-950/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium">Email List</span>
                </div>
                {editingField === 'email_list_size' ? (
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(Number(e.target.value))}
                      placeholder="Subscribers"
                      className="w-32"
                    />
                    <Button 
                      size="sm" 
                      onClick={() => handleSave('email_list_size')}
                      disabled={isSaving}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    {currentTeam.email_list_size && currentTeam.email_list_size > 0 ? (
                      <>
                        <span className="font-semibold">{currentTeam.email_list_size.toLocaleString()} subscribers</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit('email_list_size', currentTeam.email_list_size)}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                      </>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary"
                        onClick={() => handleEdit('email_list_size', 0)}
                      >
                        <Pencil className="w-3 h-3 mr-2" />
                        Add
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">
                  💡 Adding your email subscriber count shows sponsors your direct reach
                </p>
                <div className="text-center py-6">
                  <div className="text-4xl font-bold text-primary">{totalReach.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground mt-1">Total Audience Reach</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex justify-center">
          <Button size="lg" className="px-12" onClick={handleApprove}>
            Approve & Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileReview;
