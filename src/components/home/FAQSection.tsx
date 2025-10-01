import { useState } from "react";

const FAQSection = () => {
  const [activeTab, setActiveTab] = useState<"brands" | "teams">("brands");

  const brandsFAQs = [
    {
      question: "Can I sponsor multiple teams at once?",
      height: "65px"
    },
    {
      question: "What kind of visibility and engagement will my brand get?",
      height: "65px"
    },
    {
      question: "What kind of reporting will I receive?",
      height: "65px"
    },
    {
      question: "Once I select a sponsorship, how are activations managed?",
      height: "86px"
    },
    {
      question: "How much does it cost to sponsor through Sponsa?",
      height: "64px"
    }
  ];

  const teamsFAQs = [
    {
      question: "How do I create a sponsorship listing?",
      height: "65px"
    },
    {
      question: "How quickly can I start receiving sponsorships?",
      height: "65px"
    },
    {
      question: "What support does Sponsa provide?",
      height: "65px"
    },
    {
      question: "Is there a fee to use Sponsa?",
      height: "65px"
    },
    {
      question: "How do I manage sponsor relationships?",
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
