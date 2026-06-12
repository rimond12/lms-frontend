'use client';

import NavbarManager from '@/components/admin/Navbar/NavbarManager';

export default function NavbarCmsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Navbar Settings
        </h1>
        <p className="text-gray-600">
          Customize and manage dynamic details of the top navigation bar.
        </p>
      </div>
      <NavbarManager />
    </div>
  );
}
