import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSmartAuth } from "@/hooks/useSmartAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, userRole } = useSmartAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
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
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-white hover:text-accent hover:bg-white/10 data-[state=open]:bg-white/10">
                  Solutions
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4">
                    <li>
                      <NavigationMenuLink asChild>
                        <a
                          href="#teams"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">For Local Teams & Leagues</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Connect with local sponsors and grow your team
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <a
                          href="#competitive"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">For Competitive Clubs & Orgs</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Manage multiple teams and sponsorship programs
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <a
                          href="#brands"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">For Brands & Businesses</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Find and sponsor youth sports teams in your community
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <a 
            href="#why-sponsa" 
            onClick={(e) => scrollToSection(e, 'why-it-matters')}
            className="text-sm font-medium text-white transition-colors hover:text-accent"
          >
            Why Sponsa
          </a>
          <a 
            href="#how-it-works" 
            onClick={(e) => scrollToSection(e, 'product')}
            className="text-sm font-medium text-white transition-colors hover:text-accent"
          >
            How it Works
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
              <Link to={userRole === 'team' ? '/team/dashboard' : '/marketplace'}>
                <Button variant="ghost" size="sm" className="text-white hover:text-accent hover:bg-white/10">
                  {userRole === 'team' ? 'Team Dashboard' : 'Marketplace'}
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:text-accent hover:bg-white/10">
                    <User className="h-4 w-4 mr-2" />
                    Account
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.email}</p>
                      <p className="text-xs text-muted-foreground capitalize">{userRole} Account</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/sign-in">
                <Button variant="ghost" size="sm" className="text-white hover:text-accent hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
              <Link to="/select-user-type">
                <Button 
                  size="sm"
                  className="bg-accent text-white hover:bg-accent/90 font-semibold"
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
            <div className="space-y-2">
              <div className="text-sm font-medium text-white py-2">Solutions</div>
              <a 
                href="#teams" 
                className="text-sm text-white/80 transition-colors hover:text-accent py-2 pl-4 block"
                onClick={() => setMobileMenuOpen(false)}
              >
                For Local Teams & Leagues
              </a>
              <a 
                href="#competitive" 
                className="text-sm text-white/80 transition-colors hover:text-accent py-2 pl-4 block"
                onClick={() => setMobileMenuOpen(false)}
              >
                For Competitive Clubs & Orgs
              </a>
              <a 
                href="#brands" 
                className="text-sm text-white/80 transition-colors hover:text-accent py-2 pl-4 block"
                onClick={() => setMobileMenuOpen(false)}
              >
                For Brands & Businesses
              </a>
            </div>
            <a 
              href="#why-sponsa" 
              className="text-sm font-medium text-white transition-colors hover:text-accent py-2"
              onClick={(e) => {
                scrollToSection(e, 'why-it-matters');
                setMobileMenuOpen(false);
              }}
            >
              Why Sponsa
            </a>
            <a 
              href="#how-it-works" 
              className="text-sm font-medium text-white transition-colors hover:text-accent py-2"
              onClick={(e) => {
                scrollToSection(e, 'product');
                setMobileMenuOpen(false);
              }}
            >
              How it Works
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
                <Link to={userRole === 'team' ? '/team/dashboard' : '/marketplace'} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full text-white hover:text-accent hover:bg-white/10 justify-start">
                    {userRole === 'team' ? 'Team Dashboard' : 'Marketplace'}
                  </Button>
                </Link>
                <div className="pt-2 border-t border-white/10">
                  <p className="text-xs text-white/70 px-2 mb-2">{user.email}</p>
                  <p className="text-xs text-white/50 px-2 mb-3 capitalize">{userRole} Account</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                  className="w-full text-white hover:text-accent hover:bg-white/10 justify-start"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full text-white hover:text-accent hover:bg-white/10">
                    Sign In
                  </Button>
                </Link>
                <Link to="/select-user-type" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" className="w-full bg-accent text-white hover:bg-accent/90">
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
