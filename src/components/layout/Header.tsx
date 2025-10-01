import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 56; // Height of fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-200 ${
      scrolled ? 'bg-primary shadow-md' : 'bg-primary'
    }`}>
      <nav className="container mx-auto flex h-14 items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img 
            src="/logos/sponsa-logo.png" 
            alt="Sponsa" 
            className="h-8 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#teams" className="text-sm font-medium text-white transition-colors hover:text-accent">
            Teams
          </a>
          <a 
            href="#how-it-works" 
            onClick={(e) => scrollToSection(e, 'how-it-works')}
            className="text-sm font-medium text-white transition-colors hover:text-accent"
          >
            Sponsors
          </a>
          <a 
            href="#community" 
            onClick={(e) => scrollToSection(e, 'community')}
            className="text-sm font-medium text-white transition-colors hover:text-accent"
          >
            Local Champs
          </a>
          <a 
            href="#blog" 
            onClick={(e) => scrollToSection(e, 'blog')}
            className="text-sm font-medium text-white transition-colors hover:text-accent"
          >
            Blog
          </a>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link to="/team/dashboard">
                <Button variant="ghost" size="sm" className="text-white hover:text-accent hover:bg-white/10">
                  Dashboard
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                className="text-white hover:text-accent hover:bg-white/10"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="text-white hover:text-accent hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth">
                <Button 
                  size="sm"
                  className="bg-accent text-foreground hover:bg-accent/90 font-semibold"
                >
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-primary">
          <div className="container py-4 px-4 flex flex-col gap-4">
            <a 
              href="#teams" 
              className="text-sm font-medium text-white transition-colors hover:text-accent py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Teams
            </a>
            <a 
              href="#how-it-works" 
              className="text-sm font-medium text-white transition-colors hover:text-accent py-2"
              onClick={(e) => {
                scrollToSection(e, 'how-it-works');
                setMobileMenuOpen(false);
              }}
            >
              Sponsors
            </a>
            <a 
              href="#community" 
              className="text-sm font-medium text-white transition-colors hover:text-accent py-2"
              onClick={(e) => {
                scrollToSection(e, 'community');
                setMobileMenuOpen(false);
              }}
            >
              Local Champs
            </a>
            <a 
              href="#blog" 
              className="text-sm font-medium text-white transition-colors hover:text-accent py-2"
              onClick={(e) => {
                scrollToSection(e, 'blog');
                setMobileMenuOpen(false);
              }}
            >
              Blog
            </a>
            {user ? (
              <>
                <Link to="/team/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full text-white hover:text-accent hover:bg-white/10">
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                  className="w-full text-white hover:text-accent hover:bg-white/10"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full text-white hover:text-accent hover:bg-white/10">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" className="w-full bg-accent text-foreground hover:bg-accent/90">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
