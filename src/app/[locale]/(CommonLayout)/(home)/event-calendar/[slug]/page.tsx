import { EventDetailClient } from '@/components/calendar/EventDetailClient';
import { Metadata } from 'next';

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EventDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  return {
    title: `Event - ${slug}`,
    description: 'View event details including date, time, location, and registration information.',
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <EventDetailClient slug={slug} />
    </div>
  );
}


