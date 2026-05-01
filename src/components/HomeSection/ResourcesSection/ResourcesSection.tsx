"use client";

import * as React from "react";

// Data for the resource cards, structured as an array of objects

type  IResource = {
  id: number;
    title: string;
    status: string;
    image: string;
    overlayText: string;
};

const resourcesData: IResource[] = [
  {
    id: 1,
    title: 'Most Common Interview Questions',
    status: 'Free',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=2071&auto=format&fit=crop',
    overlayText: 'MOST COMMON INTERVIEW QUESTIONS'
  },
  {
    id: 2,
    title: 'Digital Marketing Blueprint',
    status: 'Free',
    image: 'https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=2071&auto=format&fit=crop',
    overlayText: 'DIGITAL MARKETING BLUEPRINT'
  },
  {
    id: 3,
    title: 'Common English Conversations Handbook',
    status: 'Free',
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=2070&auto=format&fit=crop',
    overlayText: 'COMMON ENGLISH CONVERSATIONS'
  },
  {
    id: 4,
    title: 'Top 50 Leadership Traits',
    status: 'Free',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2232&auto=format&fit=crop',
    overlayText: 'TOP 50 LEADERSHIP TRAITS'
  }
];





export const StudyResources = () => {
  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-800">Free Study Resources</h2>
        <p className="text-lg text-gray-600 mt-2">Upskill yourself by exploring all these resources!</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {resourcesData.map(resource => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
    </div>
  );
};




export const ResourceCard = ({ resource }: { resource: IResource }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition-transform duration-300 hover:scale-105">
    <div className="relative">
      <img src={resource.image} alt={resource.title} className="w-full h-40 object-cover" />
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <h3 className="text-white text-xl font-bold text-center">{resource.overlayText}</h3>
      </div>
    </div>
    <div className="p-4 flex flex-col flex-grow">
      <h4 className="text-lg font-semibold text-gray-800 flex-grow">{resource.title}</h4>
      <p className="text-gray-600 mt-2">{resource.status}</p>
      <button className="mt-4 w-full bg-white text-gray-800 border border-gray-300 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors">
        Download
      </button>
    </div>
  </div>
);

/**
 * StudyResources Component
 * Displays a grid of study resource cards.
 */

