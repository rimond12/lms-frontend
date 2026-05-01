import BlogEventNewsDetail from '@/components/shared/BlogEventNewsDetail';
import { Metadata } from 'next';

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  return {
    title: `Blog Post - ${slug}`,
    description: 'Read our latest blog post with insights and expert knowledge.',
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  return (
    <div className="min-h-screen max-w-5xl mx-auto bg-gradient-to-br from-gray-50 to-white">
      <BlogEventNewsDetail slug={slug} />
    </div>
  );
}
