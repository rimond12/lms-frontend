import React from 'react';
import GiveQuizClient from './GiveQuizClient';

// Static export এর জন্য generateStaticParams function
export function generateStaticParams() {
  // Dynamic route এর জন্য empty array return করলে build time এ কোন static page generate হবে না
  // পরিবর্তে runtime এ client-side rendering হবে
  return [];
}

export default function PublicQuizPage() {
  return <GiveQuizClient />;
}