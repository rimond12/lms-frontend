export interface SuccessStory {
  id: string;
  title: string;
  engineer: string;
  category: string;
  company: string;
  views: string;
  date: string;
  duration: string;
  thumbnail: string;
  avatar: string;
  videoUrl: string;
  featured?: boolean;
}

export interface SuccessStoriesFilter {
  label: string;
  value: string;
}

export interface SuccessStoriesProps {
  stories?: SuccessStory[];
  showFilters?: boolean;
  showPagination?: boolean;
  maxItems?: number;
  className?: string;
}
