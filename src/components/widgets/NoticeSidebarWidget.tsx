'use client';

import React, { useState } from 'react';
import { useGetUserNoticesQuery, INotice } from '@/app/redux/api/noticeApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Bell, ChevronRight, AlertCircle, Calendar, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface NoticeSidebarWidgetProps {
  maxItems?: number;
  className?: string;
}

export default function NoticeSidebarWidget({ 
  maxItems = 5, 
  className = '' 
}: NoticeSidebarWidgetProps) {
  const [selectedNotice, setSelectedNotice] = useState<INotice | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const { data: noticesData, isLoading, error } = useGetUserNoticesQuery({
    page: 1,
    limit: maxItems,
  });

  const handleViewNotice = (notice: INotice) => {
    setSelectedNotice(notice);
    setShowDetailModal(true);
  };

  const notices = noticesData?.data.notices || [];
  const totalNotices = noticesData?.data.total || 0;

  if (isLoading) {
    return (
      <Card className={`bg-white border-0 shadow-sm ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4"></div>
              <div className="h-3 bg-slate-100 rounded animate-pulse w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`bg-white border-0 shadow-sm ${className}`}>
        <CardContent className="p-4 text-center">
          <AlertCircle className="w-5 h-5 text-red-500 mx-auto mb-2" />
          <p className="text-xs text-slate-500">Failed to load notices</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={`bg-white border-0 shadow-sm overflow-hidden ${className}`}>
        <CardHeader className="p-4 pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-4 h-4 text-blue-600" />
                </div>
                {totalNotices > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">
                      {totalNotices > 9 ? '9+' : totalNotices}
                    </span>
                  </div>
                )}
              </div>
              <CardTitle className="text-sm font-semibold text-slate-900">Notices</CardTitle>
            </div>
            <Link href="/user-profile/my-notice">
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                View All
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {notices.length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bell className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-sm text-slate-500">No notices yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {notices.map((notice) => (
                <div
                  key={notice._id}
                  className="p-3 hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => handleViewNotice(notice)}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon or Image */}
                    <div className="shrink-0">
                      {notice.image ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 relative">
                          <Image
                            src={notice.image}
                            alt="Notice"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                          <Bell className="w-4 h-4 text-blue-500" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {notice.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {notice.content}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(notice.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalNotices > maxItems && (
            <div className="p-3 border-t border-slate-100 bg-slate-50">
              <Link href="/user-profile/my-notice" className="block">
                <Button variant="ghost" className="w-full h-8 text-xs text-slate-600 hover:text-blue-600">
                  View all {totalNotices} notices
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto p-0">
            {/* Modal Header with Image */}
            {selectedNotice.image ? (
              <div className="relative h-40 bg-slate-100">
                <Image
                  src={selectedNotice.image}
                  alt="Notice"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-3 left-4 right-4">
                  <h2 className="text-lg font-bold text-white line-clamp-2">{selectedNotice.title}</h2>
                </div>
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="absolute top-3 right-3 w-7 h-7 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            ) : (
              <DialogHeader className="p-5 pb-3 border-b border-slate-100">
                <DialogTitle className="text-lg font-bold text-slate-900 pr-8">
                  {selectedNotice.title}
                </DialogTitle>
              </DialogHeader>
            )}

            <div className="p-5 space-y-4">
              {/* Date */}
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {new Date(selectedNotice.createdAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>

              {/* Content */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm">
                  {selectedNotice.content}
                </p>
              </div>

              {/* Link to full page */}
              <Link href="/user-profile/my-notice" className="block">
                <Button variant="outline" className="w-full text-sm">
                  View All Notices
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
