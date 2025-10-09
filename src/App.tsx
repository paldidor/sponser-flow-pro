import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "@/pages/Index";
import SelectUserType from "@/pages/SelectUserType";
import Auth from "@/pages/Auth";
import SignIn from "@/pages/SignIn";
import Marketplace from "@/pages/Marketplace";
import MarketplaceDetail from "@/pages/MarketplaceDetail";
import Blog from "@/pages/Blog";
import BlogDetail from "@/pages/BlogDetail";
import TeamOnboarding from "@/pages/team/TeamOnboarding";
import TeamDashboard from "@/pages/team/TeamDashboard";
import CreateOffer from "@/pages/team/CreateOffer";
import BusinessOnboarding from "@/pages/business/BusinessOnboarding";
import BusinessDashboard from "@/pages/business/BusinessDashboard";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute default
      gcTime: 300000, // 5 minutes default
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <Toaster />
            <Sonner />
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/select-user-type" element={<SelectUserType />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/sign-in" element={<SignIn />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/marketplace/:id" element={<MarketplaceDetail />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogDetail />} />
                <Route
                  path="/team/onboarding"
                  element={
                    <ProtectedRoute>
                      <TeamOnboarding />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/team/dashboard"
                  element={
                    <ProtectedRoute requiresProfile={true}>
                      <TeamDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/team/create-offer"
                  element={
                    <ProtectedRoute requiresProfile={true}>
                      <CreateOffer />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/business/onboarding"
                  element={
                    <ProtectedRoute>
                      <BusinessOnboarding />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/business/dashboard"
                  element={
                    <ProtectedRoute requiresProfile={true}>
                      <BusinessDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
