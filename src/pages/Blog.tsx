import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { BlogCard } from "@/components/blog/BlogCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

const Blog = () => {
  const navigate = useNavigate();
  const { data: posts, isLoading, error } = useBlogPosts();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts || [];
    
    const query = searchQuery.toLowerCase();
    return (posts || []).filter(post => 
      post.title.toLowerCase().includes(query) ||
      post.preview_text.toLowerCase().includes(query)
    );
  }, [posts, searchQuery]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Title */}
          <h1 
            className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-center mb-4 lg:mb-6"
            style={{ letterSpacing: '-0.05em' }}
          >
            <span style={{ color: '#545454' }}>Read On</span>
            <span style={{ color: '#FFB82D' }}>.</span>
            <span style={{ color: '#00AAFE' }}> Game On</span>
            <span style={{ color: '#FFB82D' }}>.</span>
          </h1>

          {/* Subtitle */}
          <p 
            className="text-base sm:text-lg lg:text-xl opacity-80 max-w-3xl mx-auto mb-8 text-center"
            style={{ color: '#545454' }}
          >
            Check out our latest articles, insights and tips.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-md mx-auto mb-6">
            <Search 
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: '#545454', opacity: 0.6 }}
            />
            <Input
              type="text"
              placeholder="Search articles…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-[#00aafe]/20 focus:border-[#00aafe] focus:ring-[#00aafe]/20"
              aria-label="Search articles"
            />
          </div>

          {/* Back to Home Link */}
          <div className="text-center">
            <Button
              variant="ghost"
              className="text-[#00aafe] hover:text-[#00aafe]/80 hover:bg-[#00aafe]/10 transition-colors duration-300"
              onClick={() => navigate('/')}
            >
              ← Back to Home
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-16 lg:pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8 max-w-4xl mx-auto">
              <p className="font-semibold">Failed to load articles</p>
              <p className="text-sm">Showing fallback articles below.</p>
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {Array.from({ length: 9 }).map((_, i) => (
                <Card key={i} className="border-0 shadow-sm">
                  <div className="bg-gray-200 animate-pulse h-48 sm:h-52 lg:h-56 rounded-t-lg" />
                  <CardContent className="p-6 space-y-4">
                    <div className="flex gap-4">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty Search State */}
          {!isLoading && filteredPosts.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <p className="text-lg mb-4" style={{ color: '#545454' }}>
                No articles found matching your search.
              </p>
              <Button
                variant="ghost"
                className="text-[#00aafe] hover:text-[#00aafe]/80 hover:bg-[#00aafe]/10"
                onClick={() => setSearchQuery('')}
              >
                Clear search
              </Button>
            </div>
          )}

          {/* Articles Grid */}
          {!isLoading && filteredPosts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Blog;
