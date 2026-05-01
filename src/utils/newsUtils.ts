import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

/**
 * Utility functions for news content management
 */

export interface NewsItem {
  _id: string;
  title: string;
  slug: string;
  content: string;
  photoUrl?: string;
  createdAt: string;
  category?: string;
  tags?: string[];
  priority?: 'breaking' | 'featured' | 'regular';
  author?: string;
  views?: number;
  readTime?: number;
}

/**
 * Format date for news articles with relative time for recent articles
 */
export function formatNewsDate(dateString: string): string {
  const date = new Date(dateString);
  
  if (isToday(date)) {
    return `Today at ${format(date, 'HH:mm')}`;
  }
  
  if (isYesterday(date)) {
    return `Yesterday at ${format(date, 'HH:mm')}`;
  }
  
  // For articles within the last week, show relative time
  const daysDiff = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff <= 7) {
    return formatDistanceToNow(date, { addSuffix: true });
  }
  
  // For older articles, show formatted date
  return format(date, 'MMM dd, yyyy');
}

/**
 * Calculate estimated reading time based on content length
 */
export function calculateReadTime(content: string): number {
  // Remove HTML tags and count words
  const plainText = content.replace(/<[^>]*>/g, '');
  const wordCount = plainText.trim().split(/\s+/).length;
  
  // Average reading speed: 200-250 words per minute
  const wordsPerMinute = 225;
  const readTime = Math.ceil(wordCount / wordsPerMinute);
  
  return Math.max(1, readTime); // Minimum 1 minute
}

/**
 * Truncate content for previews
 */
export function truncateContent(content: string, maxLength: number = 150): string {
  // Remove HTML tags
  const plainText = content.replace(/<[^>]*>/g, '');
  
  if (plainText.length <= maxLength) {
    return plainText;
  }
  
  // Find the last complete word before the limit
  const truncated = plainText.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  if (lastSpaceIndex > 0) {
    return truncated.substring(0, lastSpaceIndex) + '...';
  }
  
  return truncated + '...';
}

/**
 * Extract unique tags from news items
 */
export function extractTags(items: NewsItem[]): string[] {
  const allTags = items.flatMap(item => item.tags || []);
  return Array.from(new Set(allTags)).sort();
}

/**
 * Filter news items by search term and tags
 */
export function filterNews(
  items: NewsItem[],
  searchTerm: string,
  selectedTag: string = 'all'
): NewsItem[] {
  return items.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.author && item.author.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTag = selectedTag === 'all' || 
      (item.tags && item.tags.includes(selectedTag));
    
    return matchesSearch && matchesTag;
  });
}

/**
 * Sort news items by different criteria
 */
export function sortNews(
  items: NewsItem[],
  sortBy: 'newest' | 'oldest' | 'title' | 'popularity'
): NewsItem[] {
  const sortedItems = [...items];
  
  switch (sortBy) {
    case 'newest':
      return sortedItems.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    
    case 'oldest':
      return sortedItems.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    
    case 'title':
      return sortedItems.sort((a, b) => 
        a.title.localeCompare(b.title)
      );
    
    case 'popularity':
      return sortedItems.sort((a, b) => 
        (b.views || 0) - (a.views || 0)
      );
    
    default:
      return sortedItems;
  }
}

/**
 * Categorize news items by priority
 */
export function categorizeNews(items: NewsItem[]) {
  const breaking = items.filter(item => item.priority === 'breaking');
  const featured = items.filter(item => item.priority === 'featured');
  const regular = items.filter(item => !item.priority || item.priority === 'regular');
  
  return { breaking, featured, regular };
}

/**
 * Generate SEO-friendly meta description from content
 */
export function generateMetaDescription(content: string, title: string): string {
  const plainContent = content.replace(/<[^>]*>/g, '');
  const description = truncateContent(plainContent, 160);
  
  return description || `Read more about ${title} in our latest news article.`;
}

/**
 * Format view count for display
 */
export function formatViewCount(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M views`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K views`;
  }
  return `${views} views`;
}

/**
 * Check if news item is recent (within last 24 hours)
 */
export function isRecentNews(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  const hoursDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  return hoursDiff <= 24;
}

/**
 * Get priority badge color
 */
export function getPriorityColor(priority?: string): string {
  switch (priority) {
    case 'breaking':
      return 'bg-red-800 text-white animate-pulse';
    case 'featured':
      return 'bg-blue-600 text-white';
    default:
      return 'bg-gray-600 text-white';
  }
}
