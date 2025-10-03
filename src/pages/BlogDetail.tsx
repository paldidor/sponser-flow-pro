import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatBlogDate } from "@/lib/dateUtils";
import { calculateReadingTime } from "@/lib/readingTimeUtils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, User, Calendar, Clock } from "lucide-react";

const BlogPostLoadingSkeleton = () => (
  <article className="py-12 sm:py-16 lg:py-20 px-4">
    <div className="max-w-4xl mx-auto">
      {/* Navigation Buttons */}
      <div className="flex items-center gap-4 mb-8">
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
      
      {/* Title */}
      <div className="mb-8">
        <Skeleton className="h-12 w-3/4 mb-6" />
        <div className="flex gap-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      
      {/* Cover Image */}
      <Skeleton className="h-[400px] w-full rounded-xl mb-8" />
      
      {/* Content Lines */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  </article>
);

const BlogPostError = ({ 
  onNavigateBack, 
  onNavigateToArticles 
}: {
  onNavigateBack: () => void;
  onNavigateToArticles: () => void;
}) => (
  <div className="min-h-screen bg-white">
    <div className="max-w-4xl mx-auto text-center py-12 sm:py-16 lg:py-20 px-4">
      {/* Navigation Row */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <Button 
          variant="ghost"
          onClick={onNavigateBack}
          className="text-[#545454] hover:text-[#00aafe] hover:bg-[#00aafe]/10 p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          onClick={onNavigateToArticles}
          className="text-[#00aafe] hover:text-[#00aafe]/80 hover:bg-[#00aafe]/10"
        >
          ← All Articles
        </Button>
      </div>
      
      {/* Error Content */}
      <h2 className="text-2xl font-bold text-[#545454] mb-4">
        Article Not Found
      </h2>
      <p className="text-[#545454] opacity-80 mb-8">
        We couldn&apos;t find the article you&apos;re looking for. It may have been moved or deleted.
      </p>
      <Button
        onClick={onNavigateToArticles}
        className="bg-[#00aafe] hover:bg-[#00aafe]/90 text-white px-6 py-2 rounded-full"
      >
        Browse All Articles
      </Button>
    </div>
  </div>
);

const FallbackContent = () => (
  <div className="space-y-8">
    {/* Section 1: Understanding */}
    <section>
      <h2 
        className="text-xl sm:text-2xl font-bold text-[#545454] mb-4"
        style={{ fontFamily: 'Poppins, sans-serif' }}
      >
        Understanding Youth Sports Sponsorship
      </h2>
      <p className="text-[#545454] opacity-80 leading-relaxed mb-4">
        Youth sports sponsorship represents one of the most meaningful ways for local businesses to connect with their community while supporting the development of young athletes. This partnership creates a win-win scenario where teams receive crucial funding and sponsors gain valuable brand exposure.
      </p>
      <ul className="space-y-2">
        <li className="flex items-start gap-2">
          <span className="w-2 h-2 bg-[#00aafe] rounded-full mt-2 flex-shrink-0" />
          <span className="text-[#545454] opacity-80">Increased brand visibility in your local community</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="w-2 h-2 bg-[#00aafe] rounded-full mt-2 flex-shrink-0" />
          <span className="text-[#545454] opacity-80">Direct connection with families and community members</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="w-2 h-2 bg-[#00aafe] rounded-full mt-2 flex-shrink-0" />
          <span className="text-[#545454] opacity-80">Positive brand association with youth development</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="w-2 h-2 bg-[#00aafe] rounded-full mt-2 flex-shrink-0" />
          <span className="text-[#545454] opacity-80">Tax-deductible contributions when supporting non-profit teams</span>
        </li>
      </ul>
    </section>

    {/* Section 2: Benefits */}
    <section>
      <h2 
        className="text-xl sm:text-2xl font-bold text-[#545454] mb-4"
        style={{ fontFamily: 'Poppins, sans-serif' }}
      >
        The Benefits of Sports Sponsorship
      </h2>
      <p className="text-[#545454] opacity-80 leading-relaxed mb-4">
        For teams, securing sponsorships means more than just financial support. It provides opportunities to upgrade equipment, travel to competitions, and offer scholarships to deserving athletes. For sponsors, the benefits extend far beyond simple advertising.
      </p>
      <p className="text-[#545454] opacity-80 leading-relaxed mb-4">
        Modern sponsorship arrangements offer diverse placement opportunities including jersey logos, field banners, social media mentions, and event-day activations. These multi-channel approaches ensure maximum visibility and engagement with your target audience.
      </p>
    </section>

    {/* Section 3: Strategy */}
    <section>
      <h2 
        className="text-xl sm:text-2xl font-bold text-[#545454] mb-4"
        style={{ fontFamily: 'Poppins, sans-serif' }}
      >
        Creating an Effective Sponsorship Strategy
      </h2>
      <p className="text-[#545454] opacity-80 leading-relaxed mb-4">
        Success in youth sports sponsorship requires careful planning and clear communication between teams and sponsors. Both parties need to understand expectations, deliverables, and the timeline for the partnership.
      </p>
      <p className="text-[#545454] opacity-80 leading-relaxed mb-4">
        Using modern platforms like Sponsa streamlines this entire process, making it easier to create professional offers, manage multiple sponsorships, and track the success of each partnership throughout the season.
      </p>
    </section>

    {/* Info Box */}
    <div className="bg-[#00aafe]/5 border border-[#00aafe]/20 rounded-lg p-6 mt-6">
      <h3 className="text-[#00aafe] font-medium mb-2">Did You Know?</h3>
      <p className="text-[#545454] opacity-80 text-sm">
        Youth sports sponsorships can increase local business revenue by up to 25% through enhanced community visibility and positive brand association. Teams that secure multiple sponsorships are 3x more likely to complete their full season schedules.
      </p>
    </div>
  </div>
);

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { data: post, isLoading } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      
      // Enhance with computed fields
      return {
        ...data,
        author: data.author_id || "Sponsa Team",
        readTime: data.content ? calculateReadingTime(data.content) : "5 min read"
      };
    },
  });

  if (isLoading) {
    return <BlogPostLoadingSkeleton />;
  }

  if (!post) {
    return (
      <BlogPostError 
        onNavigateBack={() => navigate(-1)}
        onNavigateToArticles={() => navigate('/blog')}
      />
    );
  }

  return (
    <article className="container mx-auto px-4 pt-24 pb-16 max-w-4xl">
      {/* Navigation Row */}
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="ghost"
          onClick={() => navigate(-1)}
          className="text-[#545454] hover:text-[#00aafe] hover:bg-[#00aafe]/10 p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <Button
          variant="ghost"
          onClick={() => navigate('/blog')}
          className="text-[#00aafe] hover:text-[#00aafe]/80 hover:bg-[#00aafe]/10"
        >
          ← All Articles
        </Button>
      </div>

      {/* Title & Meta */}
      <header className="mb-8">
        <h1 
          className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-[#545454] mb-6 leading-tight"
          style={{ 
            fontFamily: 'Poppins, sans-serif', 
            letterSpacing: '-0.05em' 
          }}
        >
          {post.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-6 text-[#545454] opacity-70">
          {/* Author */}
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="text-sm">By {post.author || "Sponsa Team"}</span>
          </div>
          
          {/* Date */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{formatBlogDate(post.created_at)}</span>
          </div>
          
          {/* Reading Time */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{post.readTime || calculateReadingTime(post.content)}</span>
          </div>
        </div>
      </header>

      {post.cover_image_url && (
        <div className="mb-8 lg:mb-12">
          <div className="relative overflow-hidden rounded-xl shadow-lg">
            <img 
              src={post.cover_image_url} 
              alt={post.cover_image_alt || post.title}
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      )}
      
      {/* Article Body */}
      <div className="prose prose-lg max-w-none">
        {post.content ? (
          <div 
            className="space-y-6 text-[#545454] leading-relaxed
              [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:text-[#545454] [&>h1]:mb-4 [&>h1]:mt-8
              [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-[#545454] [&>h2]:mb-4 [&>h2]:mt-6
              [&>h3]:text-lg [&>h3]:font-bold [&>h3]:text-[#545454] [&>h3]:mb-3 [&>h3]:mt-5
              [&>p]:mb-4 [&>p]:opacity-80
              [&>ul]:mb-4 [&>ul]:space-y-2
              [&>ol]:mb-4 [&>ol]:space-y-2
              [&>li]:opacity-80
              [&>blockquote]:border-l-4 [&>blockquote]:border-[#00aafe] [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-6"
            style={{ fontFamily: 'Poppins, sans-serif' }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        ) : (
          <FallbackContent />
        )}
      </div>

      {/* Bottom CTA Section */}
      <div className="mt-16 pt-8 border-t border-gray-200">
        <div className="text-center">
          <h3 className="text-xl font-bold text-[#545454] mb-4">
            Ready to Start Your Sponsorship Journey?
          </h3>
          <p className="text-[#545454] opacity-80 mb-6 max-w-2xl mx-auto">
            Join thousands of teams and businesses already using Sponsa to make youth sports sponsorships easier and more impactful.
          </p>
          <Button
            onClick={() => window.open('https://app.sponsa.ai', '_blank')}
            className="bg-[#ffb82d] hover:bg-[#ffb82d]/90 text-white px-8 py-3 rounded-full font-medium transition-colors duration-300"
          >
            Get Started Today
          </Button>
        </div>
      </div>
    </article>
  );
};

export default BlogDetail;
