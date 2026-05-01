"use client";

import React from 'react';
import { RelatedContentSection } from '@/components/shared/RelatedContent';
import EventHero from './EventHero';
import EventAbout from './EventAbout';
import EventSpeaker from './EventSpeaker';
import EventTimetable from './EventTimetable';
import ExpertPanel from './ExpertPanel';
import EventSponsors from './EventSponsors';
import ContactSection from './ContactSection';
import EventFooterDetails from './EventFooterDetails';
import EventFooter from './EventFooter';
import { BlogEventNewsItem } from '@/types/blogEventNews';

interface EventDetailsPageProps {
  eventData: BlogEventNewsItem;
}

export default function EventDetailsPage({ eventData }: EventDetailsPageProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      
      {/* Hero Section */}
      <EventHero 
        title={eventData.title}
            EventsJoinLink={eventData.EventsJoinLink}

        content={eventData.content}
        photoUrl={eventData.photoUrl}
        eventDate={eventData.eventDate}
        category={eventData.category}
      />
      
      {/* About Section */}
      <EventAbout 
        title={eventData.title}
        content={eventData.content}
        photoUrl={eventData.photoUrl}
      />
      
      {/* Timetable Section */}
      {eventData.timetable && eventData.timetable.length > 0 && (
        <EventTimetable timetable={eventData.timetable} eventDate={eventData.eventDate} />
      )}
      
      {/* Speaker Section */}
      {((eventData.speakers && eventData.speakers.length > 0) || eventData.speaker) && (
        <EventSpeaker 
          speakers={eventData.speakers}
          speaker={eventData.speaker}
          speakerDetails={eventData.speakerDetails}
        />
      )}
      
     
      
      {/* Expert Panel */}
      <ExpertPanel />
      
      {/* Event Sponsors */}
      {(eventData.sponsorName || eventData.sponsorPhotoUrl) && (
        <EventSponsors 
          sponsorName={eventData.sponsorName}
          sponsorTitle={eventData.sponsorTitle}
          sponsorPhotoUrl={eventData.sponsorPhotoUrl}
        />
      )}
      
      {/* Contact Section */}
      <ContactSection />
      
      {/* Event Details Footer */}
      <EventFooterDetails 
        eventDate={eventData.eventDate}
        eventTime={eventData.eventTime}
        eventVenue={eventData.eventVenue}
        eventAttendees={eventData.eventAttendees}
        eventMapLink={eventData.eventMapLink}
        EventsJoinLink={eventData.EventsJoinLink}
      />
      
      {/* Main Footer */}
      {/* <EventFooter /> */}
      
      {/* Related Content */}
      {/* <div className="max-w-7xl mx-auto px-6 py-20">
        <RelatedContentSection 
          currentItemId={eventData._id}
          category={"event" as "blog" | "news" | "event"}
          limit={4}
        />
      </div> */}
    </div>
  );
}