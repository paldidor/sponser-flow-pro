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
        We couldn't find the article you're looking for. It may have been moved or deleted.
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
    <article className="container mx-auto px-4 py-16 max-w-4xl">
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

      <img
        src={post.cover_image_url} 
        alt={post.cover_image_alt}
        className="w-full h-[400px] object-cover rounded-lg mb-8"
      />
      
      <div className="flex items-center gap-4 mb-6 opacity-70">
        <div className="flex items-center gap-2">
          <img src="/icons/calendar.svg" alt="" className="w-4 h-4" />
          <span className="text-sm">{formatBlogDate(post.created_at)}</span>
        </div>
        <div className="flex items-center gap-2">
          <img src="/icons/clock-small.svg" alt="" className="w-4 h-4" />
          <span className="text-sm">{calculateReadingTime(post.content)}</span>
        </div>
      </div>

      <h1 className="text-4xl font-bold mb-6">{post.title}</h1>
      
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
};

export default BlogDetail;
