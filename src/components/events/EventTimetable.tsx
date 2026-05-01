"use client";

import React from 'react';
import { Clock, Calendar } from 'lucide-react';
import { TimetableItem } from '@/types/blogEventNews';
import CountdownTimer from '../shared/CountdownTimer';

interface EventTimetableProps {
  timetable?: TimetableItem[];
  eventDate?: string; // ISO date string for the event date
}

export default function EventTimetable({ timetable, eventDate }: EventTimetableProps) {
  if (!timetable || timetable.length === 0) {
    return null;
  }
 const targetDate = eventDate ? new Date(eventDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  return (
    <section className="py-8 mb-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-red-50 px-4 py-2 rounded-full mb-4">
            <Clock className="w-4 h-4 text-red-800" />
            <span className="text-red-800 font-semibold text-sm uppercase tracking-wide">
              Event Schedule
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-3 uppercase">
            Event Timeline
          </h2>
          <div className="w-16 h-1 bg-red-800 mx-auto"></div>
        </div>

<div className='relative bg-white border-2 border-black/10 p-6 rounded-xl mb-8 shadow-lg'>
    <div className='absolute inset-0 bg-gradient-to-r from-blue-50/50 via-white to-purple-50/50 rounded-xl'></div>
    <div className='relative z-10 flex justify-center'>
        <CountdownTimer targetDate={targetDate.toISOString()} />
    </div>
    <div className='absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
        <div className='bg-gradient-to-r from-red-800 to-red-700 border-2 border-white rounded-full p-2 shadow-lg'>
            <Clock className='w-6 h-6 text-white' />
        </div>
    </div>
</div>
        {/* Modern Black Timeline Design */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-red-800"></div>

          <div className="space-y-8">
            {timetable.map((item, index) => (
              <div key={index} className="relative flex items-start gap-8">
                {/* Timeline node */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-16 h-16 bg-white border-4 border-black rounded-full flex items-center justify-center shadow-xl">
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                  </div>
                </div>

                {/* Content card */}
                <div className="flex-1 bg-white rounded-xl p-6 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:border-black">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Activity Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-black leading-tight">
                            {item.activity}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">Session {index + 1}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                          <Clock className="w-4 h-4 text-black" />
                          <span className="font-medium">{item.duration}</span>
                        </div>
                      </div>
                    </div>

                    {/* Time Display */}
                    <div className="flex flex-col items-start md:items-end">
                      <div className="bg-black text-white px-4 py-2 rounded-lg font-bold text-lg shadow-lg">
                        {item.start}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        until {item.end}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 text-center shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-black mb-2">
              {timetable.length}
            </div>
            <div className="text-gray-600 font-medium">Total Sessions</div>
          </div>

          <div className="bg-white rounded-xl p-6 text-center shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-black mb-2">
              {timetable.reduce((total, item) => {
                const duration = item.duration.toLowerCase();
                if (duration.includes('hr')) {
                  const hours = parseFloat(duration.split('hr')[0].trim()) || 0;
                  const minutes = duration.includes('min') ? parseFloat(duration.split('min')[0].split(' ').pop() || '0') : 0;
                  return total + hours * 60 + minutes;
                } else if (duration.includes('min')) {
                  return total + (parseFloat(duration.split('min')[0].trim()) || 0);
                }
                return total;
              }, 0)} min
            </div>
            <div className="text-gray-600 font-medium">Total Duration</div>
          </div>

          <div className="bg-white rounded-xl p-6 text-center shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-black mb-2">
              {timetable[0]?.start || 'TBD'}
            </div>
            <div className="text-gray-600 font-medium">Starts At</div>
          </div>
        </div>
      </div>
    </section>
  );
}