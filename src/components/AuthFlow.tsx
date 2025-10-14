import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Lock } from "lucide-react";
import ProgressIndicator from "./ProgressIndicator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthFlowProps {
  userType?: 'team' | 'business' | null;
  onAuthComplete: () => void;
  onBack: () => void;
}

const AuthFlow = ({ userType, onAuthComplete, onBack }: AuthFlowProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const { toast } = useToast();

  // Helper function to assign user role
  const assignUserRole = async (userId: string, role: 'team' | 'business') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role,
        });

      if (error) {
        console.error('Role assignment error:', error);
        throw error;
      }

      console.log(`Successfully assigned role: ${role} to user: ${userId}`);
    } catch (error: any) {
      console.error('Failed to assign role:', error);
      throw error;
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAuth = async () => {
    if (!validateEmail(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (!password || password.length < 6) {
      toast({
        title: "Invalid password",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) {
          // Handle specific signup errors
          if (error.message.includes('already registered')) {
            toast({
              title: "Account exists",
              description: "This email is already registered. Try signing in instead.",
              variant: "destructive",
            });
            setIsSignUp(false);
            return;
          }
          throw error;
        }

        if (data.user) {
          // Assign role if userType is provided
          if (userType) {
            try {
              await assignUserRole(data.user.id, userType);
              
              // Small delay to ensure role is registered before redirect
              await new Promise(resolve => setTimeout(resolve, 500));
              
              toast({
                title: "Account created!",
                description: `Welcome! Let's set up your ${userType === 'team' ? 'team' : 'business'} profile.`,
              });
            } catch (roleError) {
              toast({
                title: "Account created",
                description: "Account created but role assignment failed. Please contact support.",
                variant: "destructive",
              });
              console.error('Role assignment failed:', roleError);
            }
          } else {
            // Default message if no userType specified
            toast({
              title: "Account created!",
              description: "Welcome! Let's get started.",
            });
          }
          onAuthComplete();
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // Handle specific sign-in errors
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: "Invalid credentials",
              description: "Email or password is incorrect. Please try again.",
              variant: "destructive",
            });
            return;
          }
          if (error.message.includes('Email not confirmed')) {
            toast({
              title: "Email not confirmed",
              description: "Please check your email and confirm your account.",
              variant: "destructive",
            });
            return;
          }
          throw error;
        }

        if (data.user) {
          toast({
            title: "Welcome back!",
            description: "Signed in successfully.",
          });
          onAuthComplete();
        }
      }
    } catch (error: any) {
      // Generic error handler for unexpected errors
      toast({
        title: "Authentication failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      // Store userType in localStorage to retrieve after OAuth redirect
      if (userType) {
        localStorage.setItem('pending_user_type', userType);
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        if (error.message.includes('popup')) {
          toast({
            title: "Popup blocked",
            description: "Please allow popups for this site and try again.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      toast({
        title: "Google sign-in failed",
        description: error.message || "Please try again or use email/password instead.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-muted-foreground">
            {isSignUp
              ? userType === 'business'
                ? "Find sponsorship opportunities that matter."
                : "Take sponsorships off your plate."
              : "Sign in to continue to your dashboard."}
          </p>
          {userType && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              {userType === 'team' ? '👥 Team Account' : '💼 Business Account'}
            </div>
          )}
        </div>

        <ProgressIndicator currentStep={1} />

        <div className="bg-card rounded-2xl p-8 shadow-sm space-y-6">
          <Button
            variant="outline"
            className="w-full py-6"
            onClick={handleGoogleAuth}
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-card text-muted-foreground">or</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                />
              </div>
              {!isSignUp && (
                <div className="text-right">
                  <button
                    className="text-sm text-primary hover:underline"
                    onClick={() => {
                      toast({
                        title: "Password reset",
                        description: "Password reset feature coming soon. Please contact support.",
                      });
                    }}
                    type="button"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>

            <Button
              className="w-full py-6"
              onClick={handleAuth}
              disabled={isLoading || !email || !password}
            >
              {isLoading
                ? isSignUp
                  ? "Creating Account..."
                  : "Signing In..."
                : isSignUp
                ? "Create Account"
                : "Sign In"}
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <button
              className="text-primary font-medium hover:underline"
              onClick={() => setIsSignUp(!isSignUp)}
              type="button"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default AuthFlow;
