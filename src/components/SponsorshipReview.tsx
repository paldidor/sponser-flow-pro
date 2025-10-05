import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, MapPin, Users, DollarSign, Calendar, Target, Plus, Trash2 } from "lucide-react";
import ProgressIndicator from "./ProgressIndicator";
import LoadingState from "./LoadingState";
import { SponsorshipData, TeamProfile, SponsorshipPackage } from "@/types/flow";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { validateSponsorshipData } from "@/lib/validationUtils";
import { useToast } from "@/hooks/use-toast";
import { PackageEditor } from "./sponsorship/PackageEditor";
import { TeamProfileEditor } from "./team/TeamProfileEditor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SponsorshipReviewProps {
  sponsorshipData: SponsorshipData;
  teamData: TeamProfile | null;
  onApprove: () => void;
  onBack: () => void;
}

const SponsorshipReview = ({ sponsorshipData, teamData, onApprove, onBack }: SponsorshipReviewProps) => {
  const [team, setTeam] = useState<TeamProfile | null>(teamData);
  const [isLoading, setIsLoading] = useState(!teamData);
  const [packages, setPackages] = useState<SponsorshipPackage[]>(sponsorshipData.packages);
  const [isEditingPackage, setIsEditingPackage] = useState(false);
  const [editingPackageData, setEditingPackageData] = useState<any>(null);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [deletePackageId, setDeletePackageId] = useState<string | null>(null);
  const [offerId, setOfferId] = useState<string | null>(null);
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  
  // Campaign details editing state
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fundraisingGoal, setFundraisingGoal] = useState(sponsorshipData.fundraisingGoal);
  const [duration, setDuration] = useState(sponsorshipData.duration);
  const [description, setDescription] = useState(sponsorshipData.description || "");
  const [savingField, setSavingField] = useState(false);
  
  const { toast } = useToast();

  const handleApprove = () => {
    // Comprehensive validation before launching campaign
    if (!team) {
      toast({
        title: "Validation Error",
        description: "Please create a team profile before launching your campaign",
        variant: "destructive",
      });
      return;
    }

    if (!team.team_name || !team.sport || !team.location) {
      toast({
        title: "Incomplete Team Profile",
        description: "Please complete your team profile (name, sport, and location are required)",
        variant: "destructive",
      });
      return;
    }

    if (packages.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please create at least one sponsorship package before launching",
        variant: "destructive",
      });
      return;
    }

    const invalidPackage = packages.find(pkg => !pkg.name || pkg.price <= 0 || !pkg.placements || pkg.placements.length === 0);
    if (invalidPackage) {
      toast({
        title: "Invalid Package",
        description: `Package "${invalidPackage.name || 'Unnamed'}" is incomplete. All packages must have a name, price, and at least one placement.`,
        variant: "destructive",
      });
      return;
    }

    if (Number(fundraisingGoal) <= 0) {
      toast({
        title: "Validation Error",
        description: "Fundraising goal must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (!duration.trim()) {
      toast({
        title: "Validation Error",
        description: "Campaign duration is required",
        variant: "destructive",
      });
      return;
    }

    onApprove();
  };

  useEffect(() => {
    const fetchData = async () => {
      if (teamData) {
        setTeam(teamData);
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Fetch team profile if not provided
        if (!teamData) {
          const { data, error } = await supabase
            .from('team_profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          if (error) {
            console.error('Error fetching team profile:', error);
          } else if (data) {
            // Ensure main_values is properly parsed as an array
            const teamProfile: TeamProfile = {
              ...data,
              main_values: Array.isArray(data.main_values) 
                ? data.main_values 
                : typeof data.main_values === 'string'
                  ? JSON.parse(data.main_values)
                  : []
            };
            setTeam(teamProfile);
          }
        }

        // Fetch the offer ID to use for package operations
        const { data: offerData } = await supabase
          .from('sponsorship_offers')
          .select('id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (offerData) {
          setOfferId(offerData.id);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [teamData]);

  const refreshPackages = async () => {
    if (!offerId) return;

    try {
      const { data: packagesData, error } = await supabase
        .from('sponsorship_packages')
        .select(`
          *,
          package_placements (
            placement_option:placement_options (*)
          )
        `)
        .eq('sponsorship_offer_id', offerId)
        .order('package_order');

      if (error) throw error;

      const formattedPackages: SponsorshipPackage[] = (packagesData || []).map((pkg: any) => ({
        id: pkg.id,
        name: pkg.name,
        price: pkg.price,
        benefits: pkg.benefits || [],
        placements: (pkg.package_placements || []).map((pp: any) => pp.placement_option?.name).filter(Boolean),
      }));

      setPackages(formattedPackages);
    } catch (error) {
      console.error('Error refreshing packages:', error);
      toast({
        title: "Error Loading Packages",
        description: "Unable to refresh package list. Please try refreshing the page.",
        variant: "destructive",
      });
    }
  };

  const handleEditPackage = async (packageId: string) => {
    if (!offerId) {
      toast({
        title: "Unable to Edit Package",
        description: "Please wait for the offer to be loaded, or refresh the page.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { data: pkgData, error } = await supabase
        .from('sponsorship_packages')
        .select(`
          *,
          package_placements (
            placement_option_id
          )
        `)
        .eq('id', packageId)
        .single();

      if (error) throw error;

      setEditingPackageData({
        id: pkgData.id,
        name: pkgData.name,
        price: pkgData.price,
        placementIds: (pkgData.package_placements || []).map((pp: any) => pp.placement_option_id),
        sponsorship_offer_id: pkgData.sponsorship_offer_id,
      });
      setEditorMode("edit");
      setIsEditingPackage(true);
    } catch (error: any) {
      console.error('Error loading package:', error);
      toast({
        title: "Failed to Load Package",
        description: error.message || "Unable to load package details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddPackage = () => {
    if (!offerId) {
      toast({
        title: "Unable to Add Package",
        description: "Please wait for the offer to be created first, or refresh the page.",
        variant: "destructive",
      });
      return;
    }
    setEditingPackageData(null);
    setEditorMode("create");
    setIsEditingPackage(true);
  };

  const handleDeletePackage = async () => {
    if (!deletePackageId) return;

    // Store original packages for rollback
    const originalPackages = [...packages];

    // Optimistic UI update
    setPackages(packages.filter(pkg => pkg.id !== deletePackageId));

    try {
      // Delete package placements first (child records)
      const { error: placementsError } = await supabase
        .from('package_placements')
        .delete()
        .eq('package_id', deletePackageId);

      if (placementsError) throw placementsError;

      // Delete the package
      const { error: packageError } = await supabase
        .from('sponsorship_packages')
        .delete()
        .eq('id', deletePackageId);

      if (packageError) throw packageError;

      toast({
        title: "Package Deleted",
        description: "Sponsorship package has been removed successfully",
      });

      // Refresh to ensure consistency
      await refreshPackages();
    } catch (error: any) {
      console.error('Error deleting package:', error);
      
      // Rollback on error
      setPackages(originalPackages);
      
      toast({
        title: "Failed to Delete",
        description: error.message || "Unable to delete package. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletePackageId(null);
    }
  };

  const handlePackageSaved = async () => {
    await refreshPackages();
  };

  const handleTeamSaved = (updatedTeam: TeamProfile) => {
    setTeam(updatedTeam);
    toast({
      title: "Success",
      description: "Team profile updated successfully",
    });
  };

  const handleEditField = (field: string) => {
    setEditingField(field);
  };

  const handleCancelEdit = () => {
    // Reset to original values
    setFundraisingGoal(sponsorshipData.fundraisingGoal);
    setDuration(sponsorshipData.duration);
    setDescription(sponsorshipData.description || "");
    setEditingField(null);
  };

  const handleSaveCampaignField = async (field: string) => {
    if (!offerId) {
      toast({
        title: "Error",
        description: "Offer ID not found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Store original values for rollback
    const originalFundraisingGoal = sponsorshipData.fundraisingGoal;
    const originalDuration = sponsorshipData.duration;
    const originalDescription = sponsorshipData.description;

    // Validate
    if (field === "fundraisingGoal") {
      const goalValue = Number(fundraisingGoal);
      if (isNaN(goalValue) || goalValue <= 0) {
        toast({
          title: "Validation Error",
          description: "Fundraising goal must be a positive number greater than 0",
          variant: "destructive",
        });
        return;
      }
    }

    if (field === "duration" && !duration.trim()) {
      toast({
        title: "Validation Error",
        description: "Campaign duration cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setSavingField(true);

    try {
      const updateData: any = {};
      
      if (field === "fundraisingGoal") {
        updateData.fundraising_goal = Number(fundraisingGoal);
      } else if (field === "duration") {
        updateData.duration = duration.trim();
      } else if (field === "description") {
        updateData.description = description.trim();
      }

      const { error } = await supabase
        .from("sponsorship_offers")
        .update(updateData)
        .eq("id", offerId);

      if (error) throw error;

      // Update the parent sponsorshipData on success
      if (field === "fundraisingGoal") {
        sponsorshipData.fundraisingGoal = fundraisingGoal;
      } else if (field === "duration") {
        sponsorshipData.duration = duration;
      } else if (field === "description") {
        sponsorshipData.description = description;
      }

      toast({
        title: "Saved Successfully",
        description: `Campaign ${field === "fundraisingGoal" ? "goal" : field} has been updated`,
      });

      setEditingField(null);
    } catch (error: any) {
      console.error("Error updating campaign details:", error);
      
      // Rollback on error
      if (field === "fundraisingGoal") {
        setFundraisingGoal(originalFundraisingGoal);
      } else if (field === "duration") {
        setDuration(originalDuration);
      } else if (field === "description") {
        setDescription(originalDescription || "");
      }

      toast({
        title: "Failed to Save",
        description: error.message || "An error occurred while updating campaign details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingField(false);
    }
  };
  const totalReach = team?.reach || 0;
  const totalPotential = packages.reduce((sum, pkg) => sum + pkg.price, 0);
  const totalReachValue = totalReach.toLocaleString();

  if (isLoading) {
    return (
      <LoadingState 
        variant="page"
        size="lg"
        message="Loading Team Profile"
        submessage="Gathering all the information for your sponsorship offer..."
      />
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Review Sponsorship Offer</h1>
          <p className="text-muted-foreground">
            Review the details we've extracted and make any necessary adjustments before launching your campaign.
          </p>
          {sponsorshipData.source !== "form" && (
            <Badge variant="secondary" className="mt-2">
              Extracted from {sponsorshipData.source === "pdf" ? "PDF" : "Website"}
            </Badge>
          )}
        </div>

        <ProgressIndicator currentStep={3} />

        {(sponsorshipData.sourceUrl || sponsorshipData.fileName) && (
          <Card className="p-4 flex items-center gap-2 bg-muted">
            <Target className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              Source: {sponsorshipData.fileName || sponsorshipData.sourceUrl}
            </span>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Campaign Details</h2>
            </div>

            <div className="space-y-6">
              {/* Fundraising Goal */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Fundraising Goal</h3>
                  {editingField !== "fundraisingGoal" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditField("fundraisingGoal")}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                {editingField === "fundraisingGoal" ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        type="number"
                        value={fundraisingGoal}
                        onChange={(e) => setFundraisingGoal(e.target.value)}
                        className="pl-9 text-lg"
                        placeholder="Enter amount"
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveCampaignField("fundraisingGoal")}
                        disabled={savingField}
                      >
                        {savingField ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={savingField}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">
                      ${Number(fundraisingGoal).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Duration */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Campaign Duration</h3>
                  {editingField !== "duration" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditField("duration")}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                {editingField === "duration" ? (
                  <div className="space-y-2">
                    <Input
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="text-lg"
                      placeholder="e.g., 1 Season, 6 Months"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveCampaignField("duration")}
                        disabled={savingField}
                      >
                        {savingField ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={savingField}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="text-lg font-semibold">{duration}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                  {editingField !== "description" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditField("description")}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                {editingField === "description" ? (
                  <div className="space-y-2">
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="text-sm"
                      placeholder="Enter campaign description..."
                      rows={4}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveCampaignField("description")}
                        disabled={savingField}
                      >
                        {savingField ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={savingField}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm">
                    {description || (
                      <span className="text-muted-foreground italic">
                        No description provided. Click to add one.
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Team Overview</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingTeam(true)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </div>
            
            {team ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <p className="font-semibold">{team.team_name || "Team Name"}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {team.location || "Location"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm">{team.number_of_players || "0"} Players</span>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-center py-4">
                    <div className="text-3xl font-bold text-primary">{totalReach.toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground mt-1">Total Audience Reach</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No team profile found</p>
                <p className="text-xs mt-2">Please create a team profile first</p>
              </div>
            )}
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Sponsorship Packages</h2>
            <div className="flex items-center gap-4">
              <Button 
                onClick={handleAddPackage} 
                variant="outline" 
                size="sm"
                disabled={!offerId || savingField}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Package
              </Button>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Potential</p>
                <p className="text-2xl font-bold text-green-600">
                  ${totalPotential.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {packages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                <p className="text-lg font-medium mb-2">No packages created yet</p>
                <p className="text-sm mb-4">Create your first sponsorship package to get started</p>
                <Button onClick={handleAddPackage} size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Package
                </Button>
              </div>
            ) : (
              packages.map((pkg) => (
                <Card key={pkg.id} className="p-6 bg-secondary/30">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{pkg.name}</h3>
                      <p className="text-2xl font-bold text-green-600 mt-1">
                        ${pkg.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPackage(pkg.id)}
                        disabled={!offerId || savingField}
                        title="Edit package"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletePackageId(pkg.id)}
                        className="text-destructive hover:text-destructive"
                        disabled={savingField}
                        title="Delete package"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {pkg.placements.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Package Includes:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {pkg.placements.map((placement, idx) => (
                          <Badge key={idx} variant="outline">
                            {placement}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </Card>

        <PackageEditor
          open={isEditingPackage && !!offerId}
          onOpenChange={setIsEditingPackage}
          packageData={editingPackageData}
          sponsorshipOfferId={offerId || ""}
          onSave={handlePackageSaved}
          mode={editorMode}
        />

        <TeamProfileEditor
          open={isEditingTeam}
          onOpenChange={setIsEditingTeam}
          profileData={team}
          onSave={handleTeamSaved}
        />

        <AlertDialog open={!!deletePackageId} onOpenChange={(open) => !open && setDeletePackageId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Package</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this package? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeletePackage} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="flex justify-center gap-4">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={onBack}
            disabled={savingField}
          >
            Back
          </Button>
          <Button 
            size="lg" 
            className="px-12" 
            onClick={handleApprove}
            disabled={savingField || packages.length === 0}
          >
            {packages.length === 0 ? "Add Packages to Launch" : "Launch Campaign"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SponsorshipReview;
