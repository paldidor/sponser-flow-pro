import { Link } from "react-router-dom";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { Skeleton } from "@/components/ui/skeleton";
import { BlogCard } from "@/components/blog/BlogCard";

const BlogSection = () => {
  const { data: posts, isLoading } = useBlogPosts(3);

  return (
    <section id="blog" className="py-16 lg:py-24" style={{ background: 'rgba(255, 184, 45, 0.10)' }}>
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
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div 
                key={index}
                className="bg-white overflow-hidden flex flex-col"
                style={{
                  borderRadius: '12.75px',
                  boxShadow: '0px 1px 2px -1px rgba(0, 0, 0, 0.10)'
                }}
              >
                <Skeleton className="w-full h-[196px]" />
                <div className="p-[21px] flex flex-col gap-[10.50px]">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))
          ) : (
            posts?.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))
          )}
        </div>

        {/* View All Button */}
        <div className="flex justify-center">
          <Link to="/blog">
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
