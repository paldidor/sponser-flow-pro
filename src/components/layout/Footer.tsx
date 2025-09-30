import { Link } from "react-router-dom";
import { Rocket } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <Rocket className="h-6 w-6 text-primary" />
              <span>Sponsorship Flow</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-md">
              Create professional sponsorship offers in minutes. Connect with sponsors and grow your team.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/marketplace" className="text-muted-foreground hover:text-primary transition-colors">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-muted-foreground hover:text-primary transition-colors">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Sponsorship Flow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
