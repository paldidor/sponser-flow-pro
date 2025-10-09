import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import CreateBusinessProfile from "@/components/CreateBusinessProfile";
import BusinessProfileForm from "@/components/BusinessProfileForm";
import BusinessProfileReview from "@/components/BusinessProfileReview";
import AnalysisSpinner from "@/components/AnalysisSpinner";
import { supabase } from "@/integrations/supabase/client";

type OnboardingStep = "create-profile" | "manual-form" | "profile-review" | "website-analysis";

/* =========================
   NEW: SponsaChat component
   ========================= */
function normalizeCategorySlug(input?: string | null) {
  if (!input) return "";
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");
}

type RecommendArgs = {
  lat: number;
  lon: number;
  radius_km: number;
  budget_min?: number;
  budget_max: number;
  sport?: string;
  category_slug?: string;
  base_url?: string;
  limit?: number;
};

const RECOMMEND_OFFERS_URL = "https://<PROJECT>.functions.supabase.co/recommend-offers"; // <-- PUT YOUR REAL EDGE FUNCTION URL
const AGENT_ID = "YOUR_AGENT_ID"; // <-- PUT YOUR REAL Agent Builder ID

function SponsaChat({ businessIndustry }: { businessIndustry?: string | null }) {
  useEffect(() => {
    // Guard: wait for embed script to exist
    const mountChat = () => {
      // @ts-ignore
      const mount = window?.myChat?.mount || window?.ChatKit?.mount || window?.openaiChat?.mount;
      if (!mount) {
        console.warn("[SponsaChat] Chat widget not found on window. Ensure the chat embed script is loaded.");
        return;
      }

      // Client tool executor for recommendOffers
      async function handleRecommendOffers(args: RecommendArgs) {
        // Fill safe defaults expected by your strict tool schema
        const {
          lat,
          lon,
          radius_km,
          budget_min = 0,
          budget_max,
          sport = "",
          category_slug = "",
          base_url = "https://preview--sponser-flow-pro.lovable.app/marketplace",
          limit = 3,
        } = args;

        // If the agent didn’t provide a category, try to infer from business profile industry
        const inferredCategory =
          category_slug && category_slug.trim().length > 0
            ? category_slug
            : normalizeCategorySlug(businessIndustry || "");

        const resp = await fetch(RECOMMEND_OFFERS_URL, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            lat,
            lon,
            radius_km,
            budget_min,
            budget_max,
            sport: sport || null,
            category_slug: inferredCategory || null,
            base_url,
            limit,
          }),
        });

        if (!resp.ok) {
          const msg = await resp.text().catch(() => "");
          throw new Error(`recommendOffers HTTP ${resp.status}: ${msg}`);
        }

        const { items } = await resp.json();
        return { items: Array.isArray(items) ? items : [] };
      }

      // Mount the chat widget and wire the client tool
      mount({
        element: document.getElementById("sponsa-chat"),
        agentId: AGENT_ID,
        // Some embeds use onToolCall; others accept a tools map — we support both
        onToolCall: async ({ name, arguments: toolArgs }: { name: string; arguments: RecommendArgs }) => {
          if (name === "recommendOffers") return await handleRecommendOffers(toolArgs);
        },
        tools: {
          recommendOffers: async (toolArgs: RecommendArgs) => await handleRecommendOffers(toolArgs),
        },
      });
    };

    // Try immediately, then once after a short delay (in case script loads late)
    mountChat();
    const t = setTimeout(mountChat, 1000);
    return () => clearTimeout(t);
  }, [businessIndustry]);

  // Provide a mount point + a simple launcher (optional)
  return (
    <>
      <div id="sponsa-chat" />
      {/* Optional floating button to open your chat if your embed supports it
      <button
        className="fixed bottom-6 right-6 rounded-full shadow-lg bg-primary text-white px-4 py-2"
        onClick={() => (window as any)?.myChat?.open?.()}
      >
        Chat with Sponsa
      </button> */}
    </>
  );
}
/* =========================
   END: SponsaChat component
   ========================= */

const BusinessOnboarding = () => {
  const navigate = useNavigate();
  const { profile, loading: profileLoading, refetch } = useBusinessProfile();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("create-profile");
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeOnboarding = async () => {
      if (profileLoading) return;

      // If onboarding is already completed, redirect to dashboard
      if (profile?.onboarding_completed && profile?.current_onboarding_step === "completed") {
        console.log("[BusinessOnboarding] Onboarding already completed, redirecting to dashboard");
        navigate("/business/dashboard", { replace: true });
        return;
      }

      // Resume from where user left off
      if (profile) {
        console.log("[BusinessOnboarding] Resuming onboarding:", profile.current_onboarding_step);

        // Check if profile has data (either from website analysis or manual entry)
        const hasProfileData = profile.business_name && profile.industry && profile.city && profile.state;

        if (hasProfileData) {
          setCurrentStep("profile-review");
        } else if (profile.seed_url) {
          // Website was submitted, show analysis
          setCurrentStep("website-analysis");
        } else {
          // Start from beginning
          setCurrentStep("create-profile");
        }
      }

      setIsInitializing(false);
    };

    initializeOnboarding();
  }, [profile, profileLoading, navigate]);

  // Subscribe to realtime updates for website analysis
  useEffect(() => {
    if (currentStep !== "website-analysis" || !profile?.id) return;

    const channel = supabase
      .channel("business-profile-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "business_profiles",
          filter: `id=eq.${profile.id}`,
        },
        (payload) => {
          console.log("[BusinessOnboarding] Profile updated:", payload);
          const updatedProfile = payload.new as any;

          // Check if analysis populated the data
          if (updatedProfile.business_name && updatedProfile.industry) {
            refetch();
            setCurrentStep("profile-review");
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentStep, profile?.id, refetch]);

  const handleWebsiteComplete = () => {
    setCurrentStep("website-analysis");
  };

  const handleManualEntry = () => {
    setCurrentStep("manual-form");
  };

  const handleFormComplete = () => {
    refetch();
    setCurrentStep("profile-review");
  };

  const handleEdit = () => {
    if (profile?.seed_url) {
      setCurrentStep("website-analysis");
    } else {
      setCurrentStep("manual-form");
    }
  };

  const handleReviewComplete = async () => {
    // Refresh auth session to pick up updated profile
    await supabase.auth.refreshSession();

    // Small delay to ensure state propagates
    await new Promise((resolve) => setTimeout(resolve, 500));

    navigate("/business/dashboard", { replace: true });
  };

  if (isInitializing || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto">
        {currentStep === "create-profile" && (
          <CreateBusinessProfile onComplete={handleWebsiteComplete} onManualEntry={handleManualEntry} />
        )}

        {currentStep === "website-analysis" && <AnalysisSpinner type="website" />}

        {currentStep === "manual-form" && <BusinessProfileForm onComplete={handleFormComplete} />}

        {currentStep === "profile-review" && (
          <BusinessProfileReview onEdit={handleEdit} onComplete={handleReviewComplete} />
        )}
      </div>

      {/* =========================
          NEW: Render the chat mount
          Pass profile.industry to help the tool infer category_slug if missing
         ========================= */}
      <SponsaChat businessIndustry={profile?.industry} />
    </div>
  );
};

export default BusinessOnboarding;
