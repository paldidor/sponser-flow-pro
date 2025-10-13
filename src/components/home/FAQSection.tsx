import { useState } from "react";

interface FAQSectionProps {
  showToggle?: boolean;
  defaultView?: "brands" | "teams";
}

const FAQSection = ({ showToggle = true, defaultView = "brands" }: FAQSectionProps = {}) => {
  const [activeTab, setActiveTab] = useState<"brands" | "teams">(defaultView);

  const brandsFAQs = [
    {
      question: "Can I sponsor multiple teams at once?",
      answer: "Yes. Sponsa is built to secure & activate sponsorships across at scale. You choose the sponsorships, scope and placements, Sponsa handles the rest.",
      height: "65px"
    },
    {
      question: "What kind of visibility and engagement will my brand get?",
      answer: "Your brand and messaging appears where families and fans gather — uniforms, fields, streaming, tournaments, and digital channels. Sponsa also enables engagement through measurable touchpoints, not only impressions.",
      height: "65px"
    },
    {
      question: "What kind of reporting will I receive?",
      answer: "Sponsa tracks a range of metrics from awareness to engagement and impact, providing you with clear analytics, breakdowns and insights into your sponsorships and impact through your dashboard.",
      height: "65px"
    },
    {
      question: "Once I select a sponsorship, how are activations managed?",
      answer: "After you confirm a sponsorship, activation tasks (like uploading brand assets) appear in your Sponsa portal. Complete your part, and our team takes care of the rest — coordinating with teams, producing materials, and ensuring consistent delivery across every location.",
      height: "86px"
    },
    {
      question: "How much does it cost to sponsor through Sponsa?",
      answer: "Currently, brands can create a profile for free and activate sponsorships with no upfront costs. Sponsa takes a 15-20% free of the sponsorship value.",
      height: "64px"
    }
  ];

  const teamsFAQs = [
    {
      question: "How does Sponsa help my team raise more funding?",
      answer: "Sponsa matches your team with local, regional and national brands looking to sponsor youth sports. You get access to more funding opportunities without the grind.",
      height: "65px"
    },
    {
      question: "When does our team get paid from sponsorships?",
      answer: "Sponsa uses Stripe for payments. Your team receives funds immediately when a sponsorship is purchased — deposited directly into the account you provided when creating your profile.",
      height: "65px"
    },
    {
      question: "Do we get to choose which sponsors we work with?",
      answer: "Yes. Your team has full control to approve potential sponsorships. You'll only partner with brands that align with your community.",
      height: "65px"
    },
    {
      question: "What does it cost our team to use Sponsa?",
      answer: "Teams can create accounts for free & there are no upfront costs. Sponsa earns a fee only on sponsorships closed.",
      height: "65px"
    },
    {
      question: "How do we manage sponsorship progress and payouts?",
      answer: "After signing up, your Sponsa portal gives you a clear view of sponsorships, tasks, funds raised, and insights. Everything is organized in one place, so you always know where you stand.",
      height: "65px"
    }
  ];

  const faqs = activeTab === "brands" ? brandsFAQs : teamsFAQs;

  return (
    <section id="faq" style={{ background: "#F9FAFB" }} className="py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-[1064px] mx-auto mb-8">
          <h2 className="mb-4">
            <span style={{ color: "#0A0A0A", fontSize: "42px", fontWeight: 700, lineHeight: "42px" }}>
              Questions? We've Got{" "}
            </span>
            <span style={{ color: "#00AAFE", fontSize: "42px", fontWeight: 700, lineHeight: "42px" }}>
              Answers
            </span>
            <span style={{ color: "#FFB82D", fontSize: "42px", fontWeight: 700, lineHeight: "42px" }}>
              .
            </span>
          </h2>
          <p style={{ color: "#545454", fontSize: "15.75px", fontWeight: 400, lineHeight: "24.5px" }}>
            Everything you need to know about how Sponsa works.
          </p>
        </div>

        {/* Tabs */}
        {showToggle && (
          <div className="flex justify-center mb-12">
            <div 
              style={{ 
                width: "189.45px", 
                height: "51px",
                background: "white",
                boxShadow: "0px 1px 2px -1px rgba(0, 0, 0, 0.10)",
                borderRadius: "8.75px",
                border: "1px solid #E5E7EB",
                padding: "4.5px",
                display: "flex",
                gap: "0"
              }}
            >
              <button
                onClick={() => setActiveTab("brands")}
                style={{
                  width: "91px",
                  height: "42px",
                  background: activeTab === "brands" ? "#00AAFE" : "transparent",
                  boxShadow: activeTab === "brands" ? "0px 1px 2px -1px rgba(0, 0, 0, 0.10)" : "none",
                  borderRadius: "6.75px",
                  color: activeTab === "brands" ? "white" : "#4A5565",
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "21px",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                Brands
              </button>
              <button
                onClick={() => setActiveTab("teams")}
                style={{
                  width: "89.45px",
                  height: "42px",
                  background: activeTab === "teams" ? "#00AAFE" : "transparent",
                  boxShadow: activeTab === "teams" ? "0px 1px 2px -1px rgba(0, 0, 0, 0.10)" : "none",
                  borderRadius: "6.75px",
                  color: activeTab === "teams" ? "white" : "#4A5565",
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "21px",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                Teams
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="max-w-[1008px] mx-auto">
          <div className="grid lg:grid-cols-[483px_1fr] gap-8 lg:gap-[125px] items-start">
            {/* FAQ Items */}
            <div className="flex flex-col gap-[10.5px]">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  style={{
                    height: faq.height,
                    paddingTop: "8px",
                    paddingBottom: index === faqs.length - 1 ? "8px" : "1px",
                    paddingLeft: "15px",
                    paddingRight: "15px",
                    background: "white",
                    boxShadow: "0px 1px 2px -1px rgba(0, 0, 0, 0.10)",
                    borderRadius: "8.75px",
                    border: "1px solid #E5E7EB",
                    display: "flex",
                    flexDirection: "column"
                  }}
                >
                  <div style={{ position: "relative", flex: 1 }}>
                    <div 
                      style={{
                        position: "absolute",
                        left: "7px",
                        top: "14.5px",
                        color: "#0A0A0A",
                        fontSize: "14px",
                        fontWeight: 500,
                        lineHeight: "21px",
                        maxWidth: "340px"
                      }}
                    >
                      {faq.question}
                    </div>
                    <div 
                      style={{
                        position: "absolute",
                        right: "15px",
                        top: "15.75px",
                        width: "14px",
                        height: "14px"
                      }}
                    >
                      <img 
                        src="/icons/chevron-faq.svg" 
                        alt="" 
                        style={{ width: "100%", height: "100%" }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mascot Image */}
            <div className="hidden lg:block">
              <img 
                src="/images/sponsa-mascot-faq.png" 
                alt="Sponsa mascot" 
                style={{
                  width: "392px",
                  height: "392px",
                  objectFit: "contain"
                }}
                className="mx-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
