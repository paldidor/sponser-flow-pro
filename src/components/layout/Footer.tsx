import { Link } from "react-router-dom";
import { Mail, MapPin, Facebook, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full bg-primary text-white">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <img 
                src="/logos/sponsa-logo.png" 
                alt="Sponsa" 
                className="h-10 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-sm font-semibold">
              The #1 Youth Sports Sponsorship Platform
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4" />
                <a href="mailto:info@sponsa.ai" className="hover:text-accent transition-colors">
                  info@sponsa.ai
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                <span>Supporting youth sports everywhere</span>
              </div>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <a href="#benefits" className="text-sm hover:text-accent transition-colors">
                  Benefits
                </a>
              </li>
              <li>
                <a href="#product" className="text-sm hover:text-accent transition-colors">
                  Product
                </a>
              </li>
              <li>
                <Link to="/marketplace" className="text-sm hover:text-accent transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-sm hover:text-accent transition-colors">
                  Get Started
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-sm hover:text-accent transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#faq" className="text-sm hover:text-accent transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="mailto:info@sponsa.ai" className="text-sm hover:text-accent transition-colors">
                  Contact Support
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-accent transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-accent transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Empty column for spacing */}
          <div></div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">
            © 2025 Sponsa Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
