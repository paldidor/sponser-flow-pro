import { CheckCircle, ArrowRight } from "lucide-react";
import localTeamsImage from "@/assets/images/local-teams-hero.png";

export function LocalTeamsBenefits() {
  const benefits = [
    "Set your team up & get sponsorship offers live in minutes",
    "Boost current fundraising efforts & get matched with sponsors.",
    "Save hours of admin work — no chasing, paperwork or activations.",
    "Stay focused on the team, not the funding.",
    "Secure ongoing sponsorships that renew automatically.",
    "Track progress & receive funds instantly"
  ];

  return (
    <section className="w-full bg-white" style={{ borderBottom: 'none' }}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="order-2 lg:order-1">
            {/* Badge */}
            <div className="inline-block px-4 py-2 rounded-full mb-6" style={{ backgroundColor: '#ffb82d' }}>
              <span className="text-sm sm:text-base" style={{ fontFamily: 'Poppins', fontWeight: 500, color: '#545454' }}>
                For Local Teams & Leagues
              </span>
            </div>

            {/* Headline */}
            <h2 className="mb-4" style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 'clamp(28px, 5vw, 36px)', color: '#545454', lineHeight: '1.2' }}>
              More <span style={{ color: '#00aafe' }}>Funding</span>, Less <span style={{ color: '#00aafe' }}>Grind</span><span style={{ color: '#ffb82d' }}>.</span>
            </h2>

            {/* Subheadline */}
            <p className="mb-8" style={{ fontFamily: 'Poppins', fontWeight: 400, fontSize: '16px', color: '#64748b', lineHeight: '1.6' }}>
              Whether you're trying to keep a local team or league afloat or looking for program upgrades, chasing funds shouldn't take up your time. Sponsa makes it easy to secure sponsorship funding, saving you time, and keeping your focus on the game.
            </p>

            {/* Benefits List */}
            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <CheckCircle size={20} className="text-[#00aafe]" strokeWidth={2.5} fill="#ffb82d" />
                  </div>
                  <span style={{ fontFamily: 'Poppins', fontWeight: 400, fontSize: '16px', color: '#545454', lineHeight: '1.5' }}>
                    {benefit}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-all hover:opacity-90"
              style={{ backgroundColor: '#00aafe', color: '#ffffff', fontFamily: 'Poppins', fontWeight: 500, fontSize: '16px' }}
            >
              Get Started Free
              <ArrowRight size={20} />
            </button>
          </div>

          {/* Right Column - Image */}
          <div className="order-1 lg:order-2">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img 
                src={localTeamsImage}
                alt="Youth sports coach with team"
                className="w-full h-[400px] sm:h-[500px] object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
