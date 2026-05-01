"use client"
import React from 'react';
import { useGetEventBySlugQuery } from '@/app/redux/api/EventCalendarApi/EventCalendarApi';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  ExternalLink, 
  User, 
  Tag, 
  ArrowLeft,
  Star,
  Share2
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import AppImage from '@/components/ui/AppImage';
import RichTextRenderer from '@/components/shared/RichTextRenderer';
import { toast } from 'sonner';

export function EventDetailClient({ slug }: { slug: string }) {
  const { data, isLoading, error } = useGetEventBySlugQuery(slug);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: data?.title,
        text: data?.description,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B34644] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-6">
            The event you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/event-calendar">
            <Button className="bg-[#B34644] hover:bg-[#8B1E1E] text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Calendar
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const event = data;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/event-calendar">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Calendar
          </Button>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-8">
      

        {/* Content Section */}
        <div className="p-8">
     

          {/* Key Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Date */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-blue-900">Date</div>
                  <div className="text-base font-bold text-blue-900">
                    {event.startDate ? format(parseISO(event.startDate), 'MMM dd, yyyy') : 'N/A'}
                  </div>
                  {event.startDate !== event.endDate && event.endDate && (
                    <div className="text-xs text-blue-700">
                      to {format(parseISO(event.endDate), 'MMM dd, yyyy')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Time */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-green-900">Time</div>
                  <div className="text-base font-bold text-green-900">
                    {event.startTime}
                  </div>
                  <div className="text-xs text-green-700">
                    to {event.endTime}
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  {event.isOnline ? (
                    <Video className="w-6 h-6 text-purple-600" />
                  ) : (
                    <MapPin className="w-6 h-6 text-purple-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-purple-900">
                    {event.isOnline ? 'Online' : 'Venue'}
                  </div>
                  <div className="text-base font-bold text-purple-900 truncate">
                    {event.isOnline ? 'Virtual Event' : event.venue}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="bg-gradient-to-br from-[#B34644] to-[#8B1E1E] rounded-xl p-4 border border-red-300 flex items-center justify-center">
              <Button
                onClick={handleShare}
                className="bg-white text-[#B34644] hover:bg-gray-50 w-full flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Share Event
              </Button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            {event.isOnline && event.onlineLink && (
              <a
                href={event.onlineLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[200px]"
              >
                <Button className="w-full bg-[#B34644] hover:bg-[#8B1E1E] text-white flex items-center justify-center gap-2">
                  <Video className="w-5 h-5" />
                  Join Online Event
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
            )}
            {!event.isOnline && event.mapLink && (
              <a
                href={event.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[200px]"
              >
                <Button className="w-full bg-[#B34644] hover:bg-[#8B1E1E] text-white flex items-center justify-center gap-2">
                  <MapPin className="w-5 h-5" />
                  View on Map
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  About This Event
                </h2>
                <div className="prose prose-lg max-w-none text-gray-700">
                  <RichTextRenderer htmlString={event.description} />
                </div>
                
                {/* Static Image */}
                <div className="mt-8 mb-6">
                  <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden border border-gray-200">
                    <AppImage
                      photoUrl="https://res.cloudinary.com/dalpf8iip/image/upload/v1761742146/11690e05-c0cf-4c87-8176-13bbd5aa9680_csdzjk.jpg"
                      alt="Event Banner"
                      width={800}
                      height={400}
                      className="w-full h-full object-cover"
                      defaultImage="https://res.cloudinary.com/dalpf8iip/image/upload/v1761742146/11690e05-c0cf-4c87-8176-13bbd5aa9680_csdzjk.jpg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                  </div>
                </div>
              </section>

           
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Registration Section - Prominent */}
              <div className="bg-gradient-to-br from-[#B34644] to-[#8B1E1E] rounded-xl p-6 text-white">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <User className="w-6 h-6" />
                  Event Registration
                </h3>
                <p className="text-white/90 mb-4 text-sm">
                  Secure your spot for this exciting event!
                </p>
                <div className="space-y-3">
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSdAZaO5kAEHJgFRnQ4kLZhrR8JKFHaO50IlVDn2_Mz7wWz5mA/viewform"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button 
                      size="lg" 
                      className="w-full bg-white text-[#B34644] hover:bg-gray-50 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <User className="w-5 h-5 mr-2" />
                      Register Now
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                </div>
              </div>

              {/* Location Details */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  {event.isOnline ? (
                    <>
                      <Video className="w-5 h-5 text-[#B34644]" />
                      Online Event
                    </>
                  ) : (
                    <>
                      <MapPin className="w-5 h-5 text-[#B34644]" />
                      Venue Details
                    </>
                  )}
                </h3>
                {event.isOnline ? (
                  <div>
                    <p className="text-gray-600 mb-4">
                      This is an online event. Join from anywhere in the world!
                    </p>
                    {event.onlineLink && (
                      <a
                        href={event.onlineLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#B34644] hover:text-[#8B1E1E] font-medium flex items-center gap-2"
                      >
                        Join Meeting Link
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="font-semibold text-gray-900">{event.venue}</div>
                    {event.venueAddress && (
                      <div className="text-sm text-gray-600">{event.venueAddress}</div>
                    )}
                    {event.mapLink && (
                      <a
                        href={event.mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#B34644] hover:text-[#8B1E1E] font-medium flex items-center gap-2 mt-3"
                      >
                        Get Directions
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Organizer Info */}
              {event.organizer && (
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-[#B34644]" />
                    Organizer
                  </h3>
                  <div className="text-gray-900 font-medium">{event.organizer}</div>
                </div>
              )}


              {/* Category */}
              {event.category && (
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Category</h3>
                  <div className="text-gray-700 font-medium">{event.category}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Back to Calendar CTA */}
      <div className="text-center mb-8">
        <Link href="/event-calendar">
          <Button variant="outline" size="lg" className="flex items-center gap-2 mx-auto">
            <Calendar className="w-5 h-5" />
            View All Events
          </Button>
        </Link>
      </div>
    </div>
  );
}
