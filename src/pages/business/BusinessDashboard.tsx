import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { BusinessDashboardHeader } from "@/components/business/BusinessDashboardHeader";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

/* ===== Sponsa Recommender Panel (no chat needed) ===== */
import { useState } from "react";
import { Loader2 } from "lucide-react";

const RECOMMEND_OFFERS_URL =
  "https://YOUR_SUPABASE_PROJECT.functions.supabase.co/recommend-offers"; // <-- set this

function toSlug(s?: string | null) {
  if (!s) return "";
  return s.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
}

type OfferItem = {
  team_name?: string;
  distance_km?: number;
  price?: number;
  est_cpf?: number | null;
  marketplace_url: string;
  package_id?: string;
};

function SponsaRecommenderPanel({
  defaultCategory,
}: {
  defaultCategory?: string | null;
}) {
  const [lat, setLat] = useState<string>("");
  const [lon, setLon] = useState<string>("");
  const [radiusKm, setRadiusKm] = useState<string>("25");
  const [budgetMax, setBudgetMax] = useState<string>("3000");
  const [sport, setSport] = useState<string>("");
  const [items, setItems] = useState<OfferItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function useMyLocation() {
    setErr(null);
    if (!("geolocation" in navigator)) {
      setErr("Geolocation is not available in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLat(String(pos.coords.latitude.toFixed(6)));
        setLon(String(pos.coords.longitude.toFixed(6)));
      },
      e => setErr(e.message || "Failed to get location")
    );
  }

  async function fetchOffers() {
    setLoading(true);
    setErr(null);
    setItems([]);
    try {
      const body = {
        lat: Number(lat),
        lon: Number(lon),
        radius_km: Number(radiusKm),
        budget_min: 0,
        budget_max: Number(budgetMax),
        sport: sport || null,
        category_slug: toSlug(defaultCategory) || null,
        base_url: "https://preview--sponser-flow-pro.lovable.app/marketplace",
        limit: 3,
      };
      if (!isFinite(body.lat) || !isFinite(body.lon)) {
        throw new Error("Please enter valid latitude and longitude (or click Use my location).");
      }
      const resp = await fetch(RECOMMEND_OFFERS_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!resp.ok) throw new Error(await resp.text());
      const json = await resp.json();
      setItems(Array.isArray(json.items) ? json.items : []);
    } catch (e: any) {
      setErr(e?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-10 rounded-2xl border p-5">
      <h3 className="text-xl font-semibold">Find sponsorship offers near you</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Category: <span className="font-medium">{defaultCategory || "—"}</span>
      </p>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <input
          className="border rounded px-3 py-2"
          placeholder="Latitude"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          inputMode="decimal"
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Longitude"
          value={lon}
          onChange={(e) => setLon(e.target.value)}
          inputMode="decimal"
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Radius (km)"
          value={radiusKm}
          onChange={(e) => setRadiusKm(e.target.value)}
          inputMode="numeric"
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Budget max ($)"
          value={budgetMax}
          onChange={(e) => setBudgetMax(e.target.value)}
          inputMode="numeric"
        />
        <input
          className="border rounded px-3 py-2 md:col-span-4 col-span-2"
          placeholder="Sport (optional)"
          value={sport}
          onChange={(e) => setSport(e.target.value)}
        />
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={useMyLocation}
          type="button"
          className="px-3 py-2 border rounded-lg text-sm"
        >
          Use my location
        </button>
        <button
          onClick={fetchOffers}
          type="button"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-primary text-white disabled:opacity-50"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Finding…
            </span>
          ) : (
            "Find offers"
          )}
        </button>
      </div>

      {err && <div className="mt-3 text-red-600 text-sm break-all">Error: {err}</div>}

      {items.length > 0 && (
        <div className="mt-6 space-y-3">
          {items.map((it, i) => {
            const km = typeof it.distance_km === "number" ? Math.round(it.distance_km) : undefined;
            const price = typeof it.price === "number" ? it.price : undefined;
            const cpm =
              it.est_cpf != null
                ? Math.round(Number(it.est_cpf) * 1000 * 100) / 100
                : null;

            return (
              <a
                key={it.package_id || `${i}`}
                href={it.marketplace_url}
                target="_blank"
                rel="noreferrer"
                className="block border rounded-xl p-4 hover:shadow"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{it.team_name || "Team"}</div>
                    <div className="text-sm text-gray-600">
                      {km != null ? `${km} km · ` : ""}
                      {price != null ? `from $${price.toLocaleString()}` : ""}
                      {cpm != null ? ` · est. $${cpm}/1,000 reach` : ""}
                    </div>
                  </div>
                  <div className="text-primary text-sm font-medium">View →</div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

const BusinessDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, loading, refetch } = useBusinessProfile();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Onboarding verification - redirect if not completed
  useEffect(() => {
    if (!loading && profile) {
      const isComplete = 
        profile.onboarding_completed === true && 
        profile.current_onboarding_step === 'completed';
      
      if (!isComplete) {
        toast({
          title: "Complete Your Profile",
          description: "Please finish setting up your business profile to access the dashboard.",
          variant: "default",
        });
        navigate("/business/onboarding", { replace: true });
      }
    }
  }, [profile, loading, navigate, toast]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: "Refreshed",
        description: "Dashboard data updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh dashboard data.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEditProfile = () => {
    navigate("/business/onboarding");
  };

  const handleLogoUpdated = () => {
    refetch();
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state - profile not found
  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="mt-2 space-y-4">
            <p>Unable to load your business profile. Please try again.</p>
            <Button 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              className="w-full"
            >
              {isRefreshing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                "Try Again"
              )}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Format location for display
  const location = profile.city && profile.state 
    ? `${profile.city}, ${profile.state}` 
    : undefined;

  return (
    <div className="min-h-screen bg-background">
      <BusinessDashboardHeader
        businessName={profile.business_name}
        location={location}
        industry={profile.industry}
        logoUrl={profile.sources?.logo_url as string | undefined}
        notificationCount={0}
        onEditProfile={handleEditProfile}
        onLogoUpdated={handleLogoUpdated}
      />

      <main className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-2xl font-semibold text-foreground">
              Dashboard Coming Soon
            </h2>
            <p className="text-muted-foreground max-w-md">
              We're building an amazing dashboard experience for your business. 
              Check back soon!
            </p>
          </div>
        </div>
        <main className="container mx-auto max-w-7xl px-4 py-8">
  {/* (You can remove this placeholder if you’d like) */}
  <div className="flex items-center justify-center min-h-[30vh]">
    <div className="text-center space-y-4">
      <div className="text-6xl mb-4">🚀</div>
      <h2 className="text-2xl font-semibold text-foreground">
        Dashboard Coming Soon
      </h2>
      <p className="text-muted-foreground max-w-md">
        Meanwhile, try recommended sponsorships near your business.
      </p>
    </div>
  </div>

  {/* NEW: working recommender */}
  <SponsaRecommenderPanel defaultCategory={profile.industry} />
      </main>
    </div>
  );
};

export default BusinessDashboard;
