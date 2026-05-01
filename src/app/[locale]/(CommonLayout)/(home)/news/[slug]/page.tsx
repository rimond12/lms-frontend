import BlogEventNewsDetail from '@/components/shared/BlogEventNewsDetail';
import { Metadata } from 'next';

interface NewsDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: NewsDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  return {
    title: `News Article - ${slug}`,
    description: 'Read the latest news article with up-to-date information and insights.',
  };
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug } = await params;
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <BlogEventNewsDetail slug={slug} />
    </div>
  );
}
