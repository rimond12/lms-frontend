"use client";

import React from 'react';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { format, isValid } from 'date-fns';

interface EventFooterDetailsProps {
  eventDate?: string;
  eventTime?: string;
  eventVenue?: string;
  eventAttendees?: number;
  eventMapLink?: string;
  EventsJoinLink?: string;
}

export default function EventFooterDetails({ 
  eventDate, 
  eventTime, 
  eventVenue, 
  eventAttendees, 
  eventMapLink, 
  EventsJoinLink 
}: EventFooterDetailsProps) {
  
  // Safe date formatting function
  const formatDate = (dateString: string | undefined, formatString: string) => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      if (!isValid(date)) return null;
      return format(date, formatString);
    } catch (error) {
      console.warn('Invalid date format:', dateString);
      return null;
    }
  };

  const eventDetails = [
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Event Date",
      value: formatDate(eventDate, 'MMMM dd, yyyy') || 'Date TBD',
      subtitle: "Mark your calendar"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Event Time",
      value: formatDate(eventTime, 'hh:mm a') || 'Time TBD',
      subtitle: formatDate(eventTime, 'hh:mm a') ? "Don't be late" : "Time to be announced"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Venue",
      value: eventVenue || "Venue TBD",
      subtitle: eventVenue ? "See you there" : "Location to be announced"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Attendees",
      value: eventAttendees ? `${eventAttendees}+ Expected` : "Open Registration",
      subtitle: eventAttendees ? "Join the community" : "All are welcome"
    }
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-2 text-[#B34644] font-semibold text-sm tracking-wide uppercase mb-3">
            <span className="w-6 h-px bg-[#B34644]"></span>
            <span>Event Information</span>
            <span className="w-6 h-px bg-[#B34644]"></span>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2 uppercase">
            Mark The{' '}
            <span className="text-[#B34644]">Date</span>
          </h2>

          <p className="text-gray-600 max-w-xl mx-auto text-sm">
            Save the date and join us for this exceptional learning experience
          </p>
        </div>

        {/* Event Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {eventDetails.map((detail, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:border-[#B34644]/30 hover:shadow-md transition-all duration-300 group"
            >
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[#B34644]/10 rounded-full text-[#B34644] group-hover:bg-[#B34644] group-hover:text-white transition-all duration-300">
                  {detail.icon}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    {detail.title}
                  </h3>
                  <p className="text-lg font-bold text-gray-900 mb-1">
                    {detail.value}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {detail.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-[#B34644]" />
              <span>How to Reach</span>
            </h3>
            <div className="space-y-2 text-gray-700 text-sm">
              {eventMapLink ? (
                <>
                  <p>• View location on map</p>
                  <a 
                    href={eventMapLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-[#B34644] hover:text-red-800 font-medium"
                  >
                    <MapPin className="w-4 h-4 mr-1" />
                    Open in Maps
                  </a>
                </>
              ) : (
                <>
                  <p>• Location details will be shared soon</p>
                  <p>• Contact organizer for more information</p>
                  <p>• Transportation details to be announced</p>
                </>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center space-x-2">
              <Users className="w-5 h-5 text-[#B34644]" />
              <span>Join the Event</span>
            </h3>
            <div className="space-y-2 text-gray-700 text-sm">
              {EventsJoinLink ? (
                <>
                  <p>• Register now to secure your spot</p>
                  <a 
                    href={EventsJoinLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-[#B34644] hover:text-red-800 font-medium"
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    Register Now
                  </a>
                </>
              ) : (
                <>
                  <p>• Registration details coming soon</p>
                  <p>• Stay tuned for updates</p>
                  <p>• Follow us for announcements</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Registration CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-[#B34644] to-red-800 rounded-xl p-6 max-w-lg mx-auto">
            <h3 className="text-xl font-bold text-white mb-2">
              Ready to Join Us?
            </h3>
            <p className="text-white/90 mb-4 text-sm">
              Don't miss this opportunity to learn from the best
            </p>
            {EventsJoinLink ? (
              <a 
                href={EventsJoinLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-[#B34644] px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200 inline-flex items-center space-x-2 text-sm"
              >
                <Calendar className="w-4 h-4" />
                <span>Register for Event</span>
              </a>
            ) : (
              <button className="bg-white text-[#B34644] px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2 mx-auto text-sm cursor-not-allowed opacity-75">
                <Calendar className="w-4 h-4" />
                <span>Registration Coming Soon</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}