import { useState } from "react";
import { CheckCircle, ArrowRight, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import brandsImage from "@/assets/images/brands-hero.png";

export function BrandsHero() {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: ""
  });

  const handleLearnMoreClick = () => {
    setShowForm(!showForm);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('Brand contact submission:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Thanks for your interest! We'll be in touch soon.");
      
      // Reset form
      setFormData({ name: "", email: "" });
      setShowForm(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    "Access youth teams at every level - local to elite",
    "Activate & manage youth sponsorships at scale with one simple SaaS platform",
    "Track ROI, engagement, and impact in one simple dashboard",
    "Save time & resources with turnkey sponsorship activations",
    "Reach families where it counts with authentic community connections",
    "Turn community support into business growth"
  ];

  return (
    <div className="w-full bg-white" style={{ borderBottom: 'none' }}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="order-2 lg:order-1">
            {/* Badge */}
            <div className="inline-block px-4 py-2 rounded-full mb-6" style={{ backgroundColor: '#ffb82d' }}>
              <span className="text-sm sm:text-base" style={{ fontFamily: 'Poppins', fontWeight: 500, color: '#545454' }}>
                For Brands & Businesses
              </span>
            </div>

            {/* Headline */}
            <h2 className="mb-4" style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 'clamp(28px, 5vw, 36px)', color: '#545454', lineHeight: '1.2' }}>
              Community Sponsorships That Drive <span style={{ color: '#00aafe' }}>Results</span><span style={{ color: '#ffb82d' }}>.</span>
            </h2>

            {/* Subheadline */}
            <p className="mb-8" style={{ fontFamily: 'Poppins', fontWeight: 400, fontSize: '16px', color: '#64748b', lineHeight: '1.6' }}>
              Whether you're a local business, a regional or national brand, sponsoring youth teams shouldn't be so resource-heavy. Sponsa makes it easy to find and manage partnerships at scale through a SaaS platform that delivers real community impact and measurable ROI.
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

            {/* CTA Button with Expandable Form */}
            <div className="space-y-4">
              {/* Learn More Button */}
              <button 
                onClick={handleLearnMoreClick}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all hover:opacity-90"
                style={{ backgroundColor: '#00aafe', color: '#ffffff', fontFamily: 'Poppins', fontWeight: 500, fontSize: '16px' }}
              >
                Learn more
                {showForm ? <ChevronDown size={20} className="transition-transform" /> : <ArrowRight size={20} />}
              </button>

              {/* Expandable Form */}
              {showForm && (
                <div className="bg-white border-2 border-[#00aafe]/20 rounded-xl p-6 animate-in slide-in-from-top-2 duration-300">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label 
                        htmlFor="name" 
                        className="block mb-2 text-sm"
                        style={{ fontFamily: 'Poppins', fontWeight: 500, color: '#545454' }}
                      >
                        Full Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="John Smith"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-white border-[#00aafe]/20 focus:border-[#00aafe] focus:ring-[#00aafe]/20"
                      />
                    </div>
                    
                    <div>
                      <label 
                        htmlFor="email" 
                        className="block mb-2 text-sm"
                        style={{ fontFamily: 'Poppins', fontWeight: 500, color: '#545454' }}
                      >
                        Company Email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@company.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-white border-[#00aafe]/20 focus:border-[#00aafe] focus:ring-[#00aafe]/20"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-[#00aafe] hover:bg-[#00aafe]/90 text-white"
                      >
                        {isSubmitting ? "Submitting..." : "Submit"}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setShowForm(false)}
                        variant="outline"
                        className="border-[#00aafe]/20 text-[#545454] hover:bg-gray-50"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="order-1 lg:order-2">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img 
                src={brandsImage}
                alt="Brand representative at youth sports event"
                className="w-full h-[400px] sm:h-[500px] object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
