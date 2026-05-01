'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AboutUsContentManager from '@/components/admin/AboutUs/AboutUsContentManager';
import CategoryManager from '@/components/admin/AboutUs/CategoryManager';
import ExpertManager from '@/components/admin/AboutUs/ExpertManager';

export default function AboutUsDashboard() {
  const [activeTab, setActiveTab] = useState('content');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          About Us Management
        </h1>
        <p className="text-gray-600">
          Manage organization information, team members, and categories
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="content">Organization Info</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="experts">Team Members</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <AboutUsContentManager />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <CategoryManager />
        </TabsContent>

        <TabsContent value="experts" className="space-y-4">
          <ExpertManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
