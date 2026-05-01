"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import ExpertPanelForm from '@/components/events/ExpertPanelForm';

export default function AddExpertPanelMemberPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/dashboard/manage-expert-panel');
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6 text-center mx-auto">
          <h1 className="text-3xl  font-bold text-gray-900">Add Expert Panel Member</h1>
          <p className="text-gray-600 mt-2">Fill in the details to add a new expert to the panel</p>
        </div>
        
        <ExpertPanelForm 
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
