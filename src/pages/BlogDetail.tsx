import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatBlogDate } from "@/lib/dateUtils";
import { calculateReadingTime } from "@/lib/readingTimeUtils";

const BlogDetail = () => {
  const { slug } = useParams();

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
    return <div className="container mx-auto px-4 py-16">Loading...</div>;
  }

  if (!post) {
    return <div className="container mx-auto px-4 py-16">Blog post not found</div>;
  }

  return (
    <article className="container mx-auto px-4 py-16 max-w-4xl">
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
