import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { SponsorshipData, SponsorshipPackage } from "@/types/flow";

interface SponsorshipFormProps {
  onComplete: (data: SponsorshipData) => void;
  onBack: () => void;
}

const SponsorshipForm = ({ onComplete, onBack }: SponsorshipFormProps) => {
  const [fundraisingGoal, setFundraisingGoal] = useState("8000");
  const [duration, setDuration] = useState("Annual");
  const [description, setDescription] = useState("");
  const [packages, setPackages] = useState<SponsorshipPackage[]>([
    {
      id: "1",
      name: "Bronze Supporter",
      price: 500,
      benefits: ["Team website logo placement", "1 social media mention per month"],
      placements: ["Website", "Social Media"],
    },
  ]);

  const addPackage = () => {
    setPackages([
      ...packages,
      {
        id: Date.now().toString(),
        name: "",
        price: 0,
        benefits: [""],
        placements: [],
      },
    ]);
  };

  const removePackage = (id: string) => {
    setPackages(packages.filter((pkg) => pkg.id !== id));
  };

  const updatePackage = (id: string, field: keyof SponsorshipPackage, value: any) => {
    setPackages(
      packages.map((pkg) =>
        pkg.id === id ? { ...pkg, [field]: value } : pkg
      )
    );
  };

  const handleSubmit = () => {
    const data: SponsorshipData = {
      fundraisingGoal,
      duration,
      description,
      packages,
      source: "form",
    };
    onComplete(data);
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <Button
          variant="ghost"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div>
          <h1 className="text-3xl font-bold mb-2">Create Sponsorship Offer</h1>
          <p className="text-muted-foreground">
            Fill out the details for your sponsorship campaign
          </p>
        </div>

        <Card className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="goal">Fundraising Goal ($)</Label>
              <Input
                id="goal"
                type="number"
                value={fundraisingGoal}
                onChange={(e) => setFundraisingGoal(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="duration">Campaign Duration</Label>
              <Input
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g., Annual, 6 months, Season"
              />
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your sponsorship opportunity..."
                rows={4}
              />
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Sponsorship Packages</h2>
            <Button onClick={addPackage} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Package
            </Button>
          </div>

          {packages.map((pkg, index) => (
            <Card key={pkg.id} className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Package {index + 1}</h3>
                {packages.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePackage(pkg.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Package Name</Label>
                  <Input
                    value={pkg.name}
                    onChange={(e) => updatePackage(pkg.id, "name", e.target.value)}
                    placeholder="e.g., Gold Sponsor"
                  />
                </div>

                <div>
                  <Label>Price ($)</Label>
                  <Input
                    type="number"
                    value={pkg.price}
                    onChange={(e) => updatePackage(pkg.id, "price", Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <Label>Benefits (one per line)</Label>
                <Textarea
                  value={pkg.benefits.join("\n")}
                  onChange={(e) =>
                    updatePackage(pkg.id, "benefits", e.target.value.split("\n"))
                  }
                  placeholder="Logo on jerseys&#10;Social media mentions&#10;Event tickets"
                  rows={4}
                />
              </div>
            </Card>
          ))}
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Review Offer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SponsorshipForm;
