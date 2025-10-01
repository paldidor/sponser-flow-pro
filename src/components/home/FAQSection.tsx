import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from "react";

const FAQSection = () => {
  const [activeTab, setActiveTab] = useState<"brands" | "teams">("brands");

  const brandsFAQs = [
    {
      question: "Can I sponsor multiple teams at once?",
      answer: "Yes! Sponsa makes it easy to manage multiple team sponsorships from a single dashboard. You can select and manage placements across different teams all in one place."
    },
    {
      question: "What kind of visibility and engagement will my brand get?",
      answer: "Your brand will be visible on team jerseys, banners, social media, and at games. You'll get detailed analytics on impressions, engagement rates, and community reach through your Sponsa dashboard."
    },
    {
      question: "What kind of reporting will I receive?",
      answer: "You'll receive comprehensive reports including sponsorship analytics, community impact metrics, engagement data, and ROI tracking. All reports are accessible in real-time through your portal."
    },
    {
      question: "Once I select a sponsorship, how are activations managed?",
      answer: "Activations are managed through your Sponsa portal. You'll upload logos and brand assets, the team will review and approve them, and you'll track the activation process with automated tasks and reminders."
    },
    {
      question: "How much does it cost to sponsor through Sponsa?",
      answer: "Sponsorship costs vary by team, placement type, and duration. Sponsa is free to use - you only pay for the sponsorships you select. Pricing is transparent and shown upfront before you commit."
    }
  ];

  const teamsFAQs = [
    {
      question: "How do I create a sponsorship listing?",
      answer: "Simply sign up, complete your team profile, and use our guided flow to create sponsorship packages. You'll define placements, set pricing, and publish your listing to the marketplace."
    },
    {
      question: "How quickly can I start receiving sponsorships?",
      answer: "Once your profile and packages are approved (usually within 24-48 hours), your listing goes live immediately. Teams typically start receiving inquiries within the first week."
    },
    {
      question: "What support does Sponsa provide?",
      answer: "We provide onboarding support, marketing materials, activation guides, and ongoing customer support. Plus, you'll have access to our knowledge base and community resources."
    },
    {
      question: "Is there a fee to use Sponsa?",
      answer: "Sponsa is free for teams to list and manage sponsorships. We only charge a small service fee when a sponsorship is successfully activated."
    },
    {
      question: "How do I manage sponsor relationships?",
      answer: "Everything happens in your Sponsa dashboard - communication, asset approvals, activation tracking, reporting, and renewals. It's designed to save you hours of admin work."
    }
  ];

  const faqs = activeTab === "brands" ? brandsFAQs : teamsFAQs;

  return (
    <section id="faq" className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-foreground">Questions? We've Got </span>
            <span className="text-primary">Answers</span>
            <span className="text-accent">.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about how Sponsa works.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_auto] gap-8 lg:gap-16 items-start max-w-6xl mx-auto">
          {/* Left: FAQs */}
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-3 justify-center lg:justify-start">
              <button
                onClick={() => setActiveTab("brands")}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === "brands"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Brands
              </button>
              <button
                onClick={() => setActiveTab("teams")}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === "teams"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Teams
              </button>
            </div>

            {/* Accordion */}
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-card border rounded-lg px-6"
                >
                  <AccordionTrigger className="text-left font-semibold hover:text-primary hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Right: Mascot */}
          <div className="hidden lg:block">
            <img 
              src="/images/sponsa-mascot-faq.png" 
              alt="Sponsa mascot" 
              className="w-80 h-auto sticky top-24"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
