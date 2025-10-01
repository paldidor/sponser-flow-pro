import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const BlogSection = () => {
  const articles = [
    {
      image: "/images/product-marketplace.png",
      date: "Sep 18, 2025",
      readTime: "9 min read",
      title: "How Youth Sports Sponsorships Deliver Measurable Marketing Impact",
      excerpt: "Discover how youth sports sponsorships deliver measurable marketing impact at scale.",
      tag: "Sponsa"
    },
    {
      image: "/images/product-tasks.png",
      date: "Sep 5, 2025",
      readTime: "7 min read",
      title: "Unlocking the Power of Youth Sports Sponsorship Marketing",
      excerpt: "Discover how youth sports sponsorships give businesses authentic, cost-effective marketing. Sponsa makes them easier to find, manage, and...",
      tag: "Sponsa"
    },
    {
      image: "/images/product-placeholder.png",
      date: "Aug 29, 2025",
      readTime: "8 min read",
      title: "Why Youth Sports Sponsorships Matters Now More Than Ever",
      excerpt: "Rising youth sports costs sideline kids. Sponsorships bring them back into the game — and strengthen communities.",
      tag: "Sponsa"
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-foreground">Read On. </span>
            <span className="text-primary">Game On</span>
            <span className="text-accent">.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Check out our latest articles.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-8">
          {articles.map((article, index) => (
            <div 
              key={index}
              className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all group"
            >
              <div className="relative overflow-hidden">
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    {article.tag}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{article.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{article.readTime}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {article.excerpt}
                </p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary font-semibold group/btn"
                >
                  Read More
                  <ArrowRight className="ml-1 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Link to="/marketplace">
            <Button 
              variant="outline"
              size="lg"
              className="group"
            >
              View All Articles
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
