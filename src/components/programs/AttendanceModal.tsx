'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Award,
  Clock,
  Users,
  AlertTriangle,
} from 'lucide-react';
import { ICourse } from '@/types/course';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: ICourse;
  onConfirm: () => Promise<void>;
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  isOpen,
  onClose,
  course,
  onConfirm,
}) => {
  const [step, setStep] = useState<'review' | 'success'>('review');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAccessScopeInfo = (accessScope?: string) => {
    switch (accessScope) {
      case 'members-only':
        return {
          title: '👥 Base Members Only',
          description: 'This course is exclusively for approved Base Members. Ensure your Base Member status is current to attend.',
          color: 'from-[#B44645] to-red-700',
          textColor: 'text-red-900',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: 'members',
        };
      case 'all-users':
        return {
          title: '🌐 Open to Everyone',
          description: 'Anyone can attend this course, including Base Members and non-members. Sign up and start learning today!',
          color: 'from-emerald-600 to-green-700',
          textColor: 'text-emerald-900',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          icon: 'everyone',
        };
      case 'individual-users':
        return {
          title: '✓ By Invitation',
          description: 'This course is available only to specifically invited participants.',
          color: 'from-amber-600 to-yellow-700',
          textColor: 'text-amber-900',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          icon: 'invitation',
        };
      default:
        return {
          title: '🌐 Open to Everyone',
          description: 'Anyone can attend this course.',
          color: 'from-emerald-600 to-green-700',
          textColor: 'text-emerald-900',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          icon: 'everyone',
        };
    }
  };

  const accessInfo = getAccessScopeInfo(course.accessControl?.accessScope);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await onConfirm();
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register for attendance');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('review');
    setError(null);
    onClose();
  };

  const handleBackToCourse = () => {
    setStep('review');
    setError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Close Button */}
            <motion.button
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClose}
              className="absolute top-6 right-6 z-10 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </motion.button>

            {/* REVIEW STEP */}
            <AnimatePresence mode="wait">
              {step === 'review' && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-8 md:p-10"
                >
                  {/* Header */}
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Register to Attend</h2>
                    <p className="text-gray-600">Review course details and confirm your attendance</p>
                  </div>

                  {/* Course Summary Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 mb-6 border border-slate-200 shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-br from-[#B44645] to-red-700 rounded-lg flex-shrink-0">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{course.title}</h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.shortDescription}</p>

                        {/* Quick Details Grid */}
                        <div className="grid grid-cols-3 gap-3">
                          {course.startDate && (
                            <div className="flex items-center gap-2 bg-white rounded-lg p-2.5 border border-slate-200">
                              <Clock className="w-4 h-4 text-[#B44645] flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs text-gray-500 font-medium">Starts</p>
                                <p className="text-sm font-bold text-gray-900 truncate">
                                  {new Date(course.startDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </p>
                              </div>
                            </div>
                          )}
                          {course.duration && (
                            <div className="flex items-center gap-2 bg-white rounded-lg p-2.5 border border-slate-200">
                              <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs text-gray-500 font-medium">Duration</p>
                                <p className="text-sm font-bold text-gray-900 truncate">{course.duration}</p>
                              </div>
                            </div>
                          )}
                          {course.capacity && (
                            <div className="flex items-center gap-2 bg-white rounded-lg p-2.5 border border-slate-200">
                              <Users className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs text-gray-500 font-medium">Spots</p>
                                <p className="text-sm font-bold text-gray-900">
                                  {course.capacity - (course.enrolledCount || 0)}/
                                  {course.capacity}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Access Scope Information - PROMINENT */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className={`${accessInfo.bgColor} ${accessInfo.borderColor} border-2 rounded-xl p-6 mb-6 relative overflow-hidden`}
                  >
                    {/* Background accent */}
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${accessInfo.color} opacity-10 rounded-full -mr-16 -mt-16`}></div>

                    <div className="relative flex items-start gap-4">
                      <div className="text-3xl flex-shrink-0 mt-1">
                        {accessInfo.icon === 'members' && '👥'}
                        {accessInfo.icon === 'everyone' && '🌐'}
                        {accessInfo.icon === 'invitation' && '✓'}
                      </div>
                      <div>
                        <h4 className={`font-bold text-lg ${accessInfo.textColor} mb-1`}>
                          {accessInfo.title}
                        </h4>
                        <p className={`text-sm ${accessInfo.textColor} opacity-85 leading-relaxed`}>
                          {accessInfo.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Important Notice for Members-Only */}
                  {accessInfo.icon === 'members' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3"
                    >
                      <AlertTriangle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-yellow-900">Member Verification Required</p>
                        <p className="text-sm text-yellow-800 mt-1">
                          Your Base Member status will be verified upon enrollment. Make sure your membership is active and current.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Error Alert */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-red-800 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800">{error}</p>
                    </motion.div>
                  )}

                  {/* Course Tags/Topics */}
                  {course.tags && course.tags.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="mb-6"
                    >
                      <h4 className="text-sm font-bold text-gray-900 mb-3">Topics Covered</h4>
                      <div className="flex flex-wrap gap-2">
                        {course.tags.slice(0, 5).map((tag: string) => (
                          <span
                            key={tag}
                            className="inline-block bg-gradient-to-r from-[#B44645]/10 to-red-800/10 text-[#B44645] text-xs px-3 py-1.5 rounded-full font-medium border border-[#B44645]/30 hover:bg-[#B44645]/20 transition-colors"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Info Text */}
                  <p className="text-xs text-gray-500 mb-8 leading-relaxed">
                    By clicking "Confirm Attendance", you agree to receive communications about this course. You can update your preferences anytime in your profile settings.
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleClose}
                      className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold rounded-lg transition-colors disabled:opacity-50"
                      disabled={isLoading}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleConfirm}
                      disabled={isLoading}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-[#B44645] to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-red-800/30"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Award className="w-4 h-4" />
                          Confirm Attendance
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* SUCCESS STEP */}
              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="p-8 md:p-10 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="mb-6"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <CheckCircle2 className="w-12 h-12 text-white" />
                    </div>
                  </motion.div>

                  <h2 className="text-3xl font-bold text-gray-900 mb-3">Successfully Registered!</h2>
                  <p className="text-gray-600 mb-2">You're all set to attend:</p>
                  <p className="text-lg font-bold text-gray-900 mb-8">{course.title}</p>

                  {/* Next Steps */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-200 text-left"
                  >
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-blue-600" />
                      What's Next?
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-700">
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                          1
                        </span>
                        <span className="pt-0.5">Check your email for registration confirmation and course details</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                          2
                        </span>
                        <span className="pt-0.5">Review the course schedule and access any available materials</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                          3
                        </span>
                        <span className="pt-0.5">Join on the scheduled date and time</span>
                      </li>
                    </ul>
                  </motion.div>

                  {/* Access Info for Success */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className={`${accessInfo.bgColor} ${accessInfo.borderColor} border rounded-lg p-4 mb-6`}
                  >
                    <p className={`text-sm ${accessInfo.textColor} font-medium`}>
                      {accessInfo.icon === 'members' && '✓ Your membership status will be verified shortly'}
                      {accessInfo.icon === 'everyone' && '✓ You can now access all course materials'}
                      {accessInfo.icon === 'invitation' && '✓ Your invitation has been activated'}
                    </p>
                  </motion.div>

                  {/* Close Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBackToCourse}
                    className="w-full px-6 py-3 bg-gradient-to-r from-[#B44645] to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-red-800/30"
                  >
                    Back to Course
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AttendanceModal;

