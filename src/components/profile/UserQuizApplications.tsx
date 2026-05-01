"use client"

import React from 'react';
import { useGetUserQuizApplicationsQuery } from '@/app/redux/api/QuizApi/quizApi';
import { Clock, CheckCircle, XCircle, AlertTriangle, Calendar, BookOpen } from 'lucide-react';
import RichTextRenderer from '@/components/shared/RichTextRenderer';
import { motion } from 'framer-motion';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';

const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
    {children}
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    PENDING: {
      icon: <Clock className="w-4 h-4" />,
      text: 'Pending',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    APPROVED: {
      icon: <CheckCircle className="w-4 h-4" />,
      text: 'Approved',
      className: 'bg-green-100 text-green-800 border-green-200'
    },
    REJECTED: {
      icon: <XCircle className="w-4 h-4" />,
      text: 'Rejected',
      className: 'bg-red-100 text-[#AF4444] border-red-200'
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig];
  
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${config.className}`}>
      {config.icon}
      {config.text}
    </span>
  );
};

export default function UserQuizApplications() {
  const { data: applications, isLoading, error } = useGetUserQuizApplicationsQuery();
  
  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Course & Quiz  Applications</h1>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-800 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Applications</h3>
            <p className="text-gray-600">Failed to load your quiz applications. Please try again later.</p>
          </Card>
        </div>
      </div>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Course & Quiz Applications</h1>
          <Card className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Yet</h3>
            <p className="text-gray-600 mb-6">You haven't applied for any quizzes yet. Browse available quizzes and apply to get started!</p>
            <a 
              href="/quiz" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Browse Quizzes
            </a>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="sm:text-xl md:text-3xl font-bold text-gray-900">My Course & Quiz Applications</h1>
          <div className="text-sm text-gray-600">
            {applications.length} {applications.length === 1 ? 'application' : 'applications'}
          </div>
        </div>

        <div className="space-y-6">
          {applications.map((application, index) => (
            <motion.div
              key={application._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Quiz Image */}
                  {application.quiz?.descriptionImage && (
                    <div className="lg:w-32 lg:h-32 w-full h-48 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <AppImage
                        photoUrl={application.quiz.descriptionImage}
                        alt={application.quiz.title}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                        defaultImage="https://placehold.co/400x300/e2e8f0/64748b?text=Quiz+Image"
                      />
                    </div>
                  )}

                  {/* Quiz Details */}
                  <div className="flex-grow">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {application.quiz?.title || 'Quiz Title'}
                        </h3>
                        <div className="text-gray-600 text-sm">
                          <RichTextRenderer htmlString={application.quiz?.description || ''} />
                        </div>
                      </div>
                      <StatusBadge status={application.status} />
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Applied: {new Date(application.appliedAt!).toLocaleDateString()}</span>
                      </div>
                      {application.approvedAt && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {application.status === 'APPROVED' ? 'Approved' : 'Processed'}: {new Date(application.approvedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {application.rejectionReason && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-[#AF4444]">
                          <span className="font-medium">Rejection Reason:</span> {application.rejectionReason}
                        </p>
                      </div>
                    )}

                    {application.status === 'APPROVED' && (
                      <div className="mt-4">
                        <Link 
                          href={`/give-quiz/${(application.quizId as any)?._id || application.quizId}`}
                          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-black transition-colors"
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          Start Now
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
