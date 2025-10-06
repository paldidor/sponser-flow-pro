import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full" style={{ background: '#00AAFE' }}>
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="inline-block">
              <img 
                src="/logos/sponsa-logo-footer.png" 
                alt="Sponsa" 
                style={{ width: '247px', height: '70px' }}
              />
            </Link>
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.90)', 
              fontSize: '15.75px', 
              fontWeight: 400, 
              lineHeight: '25.59px' 
            }}>
              The #1 Youth Sports Sponsorship Platform
            </p>
            <div className="space-y-3">
              <div className="flex items-center" style={{ gap: '10.5px' }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1.5" y="5.25" width="15" height="4.5" rx="0.75" stroke="rgba(255, 255, 255, 0.80)" strokeWidth="1.5"/>
                  <rect x="1.5" y="3" width="15" height="12" rx="0.75" stroke="rgba(255, 255, 255, 0.80)" strokeWidth="1.5"/>
                </svg>
                <a 
                  href="mailto:info@sponsa.ai" 
                  style={{ 
                    color: 'rgba(255, 255, 255, 0.80)', 
                    fontSize: '14px', 
                    fontWeight: 400, 
                    lineHeight: '21px' 
                  }}
                  className="hover:opacity-100 transition-opacity"
                >
                  info@sponsa.ai
                </a>
              </div>
              <div className="flex items-center" style={{ gap: '10.5px' }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="1.5" width="12" height="15" rx="0.75" stroke="rgba(255, 255, 255, 0.80)" strokeWidth="1.5"/>
                  <circle cx="9" cy="7.5" r="2.25" stroke="rgba(255, 255, 255, 0.80)" strokeWidth="1.5"/>
                </svg>
                <span style={{ 
                  color: 'rgba(255, 255, 255, 0.80)', 
                  fontSize: '14px', 
                  fontWeight: 400, 
                  lineHeight: '21px' 
                }}>
                  Supporting youth sports everywhere
                </span>
              </div>
            </div>
          </div>

          {/* Empty Column for spacing */}
          <div className="hidden lg:block lg:col-span-2"></div>

          {/* Platform Column */}
          <div className="lg:col-span-2">
            <h3 style={{ 
              color: 'white', 
              fontSize: '17.50px', 
              fontWeight: 700, 
              lineHeight: '24.50px',
              marginBottom: '21px'
            }}>
              Platform
            </h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="#benefits" 
                  style={{ 
                    color: 'rgba(255, 255, 255, 0.80)', 
                    fontSize: '14px', 
                    fontWeight: 400, 
                    lineHeight: '21px' 
                  }}
                  className="hover:opacity-100 transition-opacity"
                >
                  Benefits
                </a>
              </li>
              <li>
                <a 
                  href="#product" 
                  style={{ 
                    color: 'rgba(255, 255, 255, 0.80)', 
                    fontSize: '14px', 
                    fontWeight: 400, 
                    lineHeight: '21px' 
                  }}
                  className="hover:opacity-100 transition-opacity"
                >
                  Product
                </a>
              </li>
              <li>
                <Link 
                  to="/marketplace" 
                  style={{ 
                    color: 'rgba(255, 255, 255, 0.80)', 
                    fontSize: '14px', 
                    fontWeight: 400, 
                    lineHeight: '21px' 
                  }}
                  className="hover:opacity-100 transition-opacity"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link 
                  to="/select-user-type" 
                  style={{ 
                    color: 'rgba(255, 255, 255, 0.80)', 
                    fontSize: '14px', 
                    fontWeight: 400, 
                    lineHeight: '21px' 
                  }}
                  className="hover:opacity-100 transition-opacity"
                >
                  Get Started
                </Link>
              </li>
              <li>
                <Link 
                  to="/auth" 
                  style={{ 
                    color: 'rgba(255, 255, 255, 0.80)', 
                    fontSize: '14px', 
                    fontWeight: 400, 
                    lineHeight: '21px' 
                  }}
                  className="hover:opacity-100 transition-opacity"
                >
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div className="lg:col-span-4">
            <h3 style={{ 
              color: 'white', 
              fontSize: '17.50px', 
              fontWeight: 700, 
              lineHeight: '24.50px',
              marginBottom: '21px'
            }}>
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="#faq" 
                  style={{ 
                    color: 'rgba(255, 255, 255, 0.80)', 
                    fontSize: '14px', 
                    fontWeight: 400, 
                    lineHeight: '21px' 
                  }}
                  className="hover:opacity-100 transition-opacity"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a 
                  href="mailto:info@sponsa.ai" 
                  style={{ 
                    color: 'rgba(255, 255, 255, 0.80)', 
                    fontSize: '14px', 
                    fontWeight: 400, 
                    lineHeight: '21px' 
                  }}
                  className="hover:opacity-100 transition-opacity"
                >
                  Contact Support
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  style={{ 
                    color: 'rgba(255, 255, 255, 0.80)', 
                    fontSize: '14px', 
                    fontWeight: 400, 
                    lineHeight: '21px' 
                  }}
                  className="hover:opacity-100 transition-opacity"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  style={{ 
                    color: 'rgba(255, 255, 255, 0.80)', 
                    fontSize: '14px', 
                    fontWeight: 400, 
                    lineHeight: '21px' 
                  }}
                  className="hover:opacity-100 transition-opacity"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div 
          className="mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderTop: '1px solid rgba(255, 255, 255, 0.20)' }}
        >
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.70)', 
            fontSize: '12.25px', 
            fontWeight: 400, 
            lineHeight: '17.50px' 
          }}>
            © 2025 Sponsa Inc. All rights reserved.
          </p>
          <div className="flex items-center" style={{ gap: '14px' }}>
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
              aria-label="Facebook"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '21px',
                height: '21px',
                background: 'white',
                borderRadius: '2px'
              }}
            >
              <Facebook style={{ width: '14px', height: '14px', color: '#00AAFE' }} />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
              aria-label="Instagram"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '21px',
                height: '21px',
                background: 'white',
                borderRadius: '2px'
              }}
            >
              <Instagram style={{ width: '14px', height: '14px', color: '#00AAFE' }} />
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
              aria-label="LinkedIn"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '21px',
                height: '21px',
                background: 'white',
                borderRadius: '2px'
              }}
            >
              <Linkedin style={{ width: '14px', height: '14px', color: '#00AAFE' }} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
