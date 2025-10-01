import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Marketplace from "@/pages/Marketplace";
import BlogDetail from "@/pages/BlogDetail";
import TeamOnboarding from "@/pages/team/TeamOnboarding";
import TeamDashboard from "@/pages/team/TeamDashboard";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Toaster />
          <Sonner />
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/marketplace" element={<Marketplace />} />
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
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
