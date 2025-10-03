import { Link } from "react-router-dom";
import { formatBlogDate } from "@/lib/dateUtils";
import { calculateReadingTime } from "@/lib/readingTimeUtils";

interface BlogCardProps {
  post: {
    id: string;
    slug: string;
    title: string;
    preview_text: string;
    cover_image_url?: string;
    cover_image_alt?: string;
    content?: string;
    created_at: string;
  };
}

export const BlogCard = ({ post }: BlogCardProps) => {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group bg-white overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300"
      style={{
        borderRadius: '12.75px',
        boxShadow: '0px 1px 2px -1px rgba(0, 0, 0, 0.10)'
      }}
    >
      {/* Image */}
      {post.cover_image_url && (
        <div className="overflow-hidden" style={{ borderTopLeftRadius: '8.75px', borderTopRightRadius: '8.75px' }}>
          <img 
            src={post.cover_image_url} 
            alt={post.cover_image_alt || post.title}
            className="w-full h-[196px] object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-[21px] flex flex-col gap-[10.50px] flex-1">
        {/* Meta */}
        <div className="flex items-center gap-3.5 opacity-70">
          <div className="flex items-center gap-[3.50px]">
            <img src="/icons/calendar.svg" alt="" className="w-[10.50px] h-[10.50px]" />
            <span style={{ color: '#545454', fontSize: '10.50px', fontWeight: 400, lineHeight: '14px' }}>
              {formatBlogDate(post.created_at)}
            </span>
          </div>
          <div className="flex items-center gap-[3.50px]">
            <img src="/icons/clock-small.svg" alt="" className="w-[10.50px] h-[10.50px]" />
            <span style={{ color: '#545454', fontSize: '10.50px', fontWeight: 400, lineHeight: '14px' }}>
              {post.content ? calculateReadingTime(post.content) : "5 min read"}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 
          className="overflow-hidden transition-colors duration-300 group-hover:text-[#00aafe]"
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
          {post.title}
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
          {post.preview_text}
        </p>

        {/* Read More */}
        <div className="pt-[15px] border-t border-[#F3F4F6]">
          <div className="flex items-center justify-between">
            <span style={{ color: '#00AAFE', fontSize: '12.25px', fontWeight: 400, lineHeight: '17.50px' }}>
              Read More
            </span>
            <svg 
              width="14" 
              height="14" 
              viewBox="0 0 14 14" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              <path d="M5.25 3.5L8.75 7L5.25 10.5" stroke="#00AAFE" strokeWidth="1.17" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
};
