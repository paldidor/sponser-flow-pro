import { Link } from "react-router-dom";

const BlogSection = () => {
  const articles = [
    {
      image: "/images/product-marketplace.png",
      date: "Sep 17, 2025",
      readTime: "9 min read",
      title: "How Youth Sports Sponsorships Deliver Measurable Marketing Impact",
      excerpt: "Discover how youth sports sponsorships deliver measurable marketing impact at scale."
    },
    {
      image: "/images/product-tasks.png",
      date: "Sep 5, 2025",
      readTime: "7 min read",
      title: "Unlocking the Power of Youth Sports Sponsorship Marketing",
      excerpt: "Discover how youth sports sponsorships give businesses authentic, cost-effective marketing. Sponsa makes them easier to find, manage, and measure."
    },
    {
      image: "/images/product-placeholder.png",
      date: "Aug 29, 2025",
      readTime: "8 min read",
      title: "Why Youth Sports Sponsorships Matters Now More Than Ever",
      excerpt: "Rising youth sports costs sideline kids. Sponsorships bring them back into the game — and strengthen communities."
    }
  ];

  return (
    <section className="py-16 lg:py-24" style={{ background: 'rgba(255, 184, 45, 0.10)' }}>
      <div className="container mx-auto px-4 lg:px-8 max-w-[1120px]">
        {/* Header */}
        <div className="text-center mb-10 lg:mb-16">
          <h2 className="mb-4">
            <span style={{ color: '#545454', fontSize: '42px', fontWeight: 800, lineHeight: '42px' }}>
              Read On
            </span>
            <span style={{ color: '#FFB82D', fontSize: '42px', fontWeight: 800, lineHeight: '42px' }}>
              .
            </span>
            <span style={{ color: '#00AAFE', fontSize: '42px', fontWeight: 800, lineHeight: '42px' }}>
              {' '}Game On
            </span>
            <span style={{ color: '#FFB82D', fontSize: '42px', fontWeight: 800, lineHeight: '42px' }}>
              .
            </span>
          </h2>
          <p 
            className="max-w-[672px] mx-auto opacity-80" 
            style={{ color: '#545454', fontSize: '17.50px', fontWeight: 400, lineHeight: '24.50px' }}
          >
            Check out our latest articles.
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {articles.map((article, index) => (
            <div 
              key={index}
              className="bg-white overflow-hidden flex flex-col"
              style={{
                borderRadius: '12.75px',
                boxShadow: '0px 1px 2px -1px rgba(0, 0, 0, 0.10)'
              }}
            >
              {/* Image */}
              <div className="overflow-hidden" style={{ borderTopLeftRadius: '8.75px', borderTopRightRadius: '8.75px' }}>
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-full h-[196px] object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-[21px] flex flex-col gap-[10.50px] flex-1">
                {/* Meta */}
                <div className="flex items-center gap-3.5 opacity-70">
                  <div className="flex items-center gap-[3.50px]">
                    <img src="/icons/calendar.svg" alt="" className="w-[10.50px] h-[10.50px]" />
                    <span style={{ color: '#545454', fontSize: '10.50px', fontWeight: 400, lineHeight: '14px' }}>
                      {article.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-[3.50px]">
                    <img src="/icons/clock-small.svg" alt="" className="w-[10.50px] h-[10.50px]" />
                    <span style={{ color: '#545454', fontSize: '10.50px', fontWeight: 400, lineHeight: '14px' }}>
                      {article.readTime}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 
                  className="overflow-hidden"
                  style={{ 
                    color: '#545454', 
                    fontSize: '15.75px', 
                    fontWeight: 700, 
                    lineHeight: '24.50px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}
                >
                  {article.title}
                </h3>

                {/* Excerpt */}
                <p 
                  className="opacity-80 overflow-hidden flex-1"
                  style={{ 
                    color: '#545454', 
                    fontSize: '12.25px', 
                    fontWeight: 400, 
                    lineHeight: '19.91px',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical'
                  }}
                >
                  {article.excerpt}
                </p>

                {/* Read More */}
                <div className="pt-[15px] border-t border-[#F3F4F6]">
                  <div className="flex items-center justify-between">
                    <span style={{ color: '#00AAFE', fontSize: '12.25px', fontWeight: 400, lineHeight: '17.50px' }}>
                      Read More
                    </span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5.25 3.5L8.75 7L5.25 10.5" stroke="#00AAFE" strokeWidth="1.17" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="flex justify-center">
          <Link to="/marketplace">
            <button 
              className="flex items-center gap-2 px-4 py-2 rounded-[6.75px] hover:bg-white/50 transition-colors"
              style={{ color: '#00AAFE', fontSize: '12.25px', fontWeight: 500, lineHeight: '17.50px' }}
            >
              View All Articles
              <div className="w-9 h-8 rounded-full border border-[#00AAFE] bg-white flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5.25 3.5L8.75 7L5.25 10.5" stroke="#00AAFE" strokeWidth="1.17" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
