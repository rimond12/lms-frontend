import BlogEventNewsDetail from '@/components/shared/BlogEventNewsDetail';

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  return <BlogEventNewsDetail slug={slug} />;
}
