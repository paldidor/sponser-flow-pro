import { format } from 'date-fns';

export const formatBlogDate = (date: string | Date): string => {
  return format(new Date(date), 'MMM d, yyyy');
};
