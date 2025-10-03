import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  cover_image_url?: string;
  cover_image_alt?: string;
  preview_text: string;
  content?: string;
  created_at: string;
  status: string;
  author?: string;
  readTime?: string;
}

export const useBlogPosts = (limit?: number) => {
  return useQuery({
    queryKey: ['blog-posts', limit],
    queryFn: async () => {
      let query = (supabase as any)
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as BlogPost[];
    },
  });
};
