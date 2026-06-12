'use client';

import FooterManager from '@/components/admin/Footer/FooterManager';

export default function FooterCmsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Footer Settings
        </h1>
        <p className="text-gray-600">
          Customize and manage dynamic details of the footer area.
        </p>
      </div>
      <FooterManager />
    </div>
  );
}
