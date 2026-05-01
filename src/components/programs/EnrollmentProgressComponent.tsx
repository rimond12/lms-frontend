import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Circle,
  Award,
  BookOpen,
  Play,
  Lock,
  AlertCircle,
} from 'lucide-react';

interface EnrollmentProgressProps {
  enrollment: any;
  course: any;
}

const EnrollmentProgressComponent: React.FC<EnrollmentProgressProps> = ({
  enrollment,
  course,
}) => {
  const progress = enrollment?.progress || {};
  const materialsViewed = progress.materialsViewed || 0;
  const totalMaterials = progress.totalMaterials || 0;
  const quizzesCompleted = progress.quizzesCompleted || 0;
  const quizzesAttempted = progress.quizzesAttempted || 0;
  const certificateIssued = progress.certificateIssued || false;

  const materialsPercentage = totalMaterials > 0 ? Math.round((materialsViewed / totalMaterials) * 100) : 0;
  const overallPercentage = Math.round(
    ((materialsViewed + quizzesCompleted * 2) / ((totalMaterials || 1) + (course?.quizIds?.length || 1) * 2)) * 100
  );

  const getAccessInfo = () => {
    const accessType = enrollment.accessType || 'all-access';
    const accessScope = enrollment.accessScope || 'all-users';
    const accessDisplayMap: Record<string, string> = {
      'all-access': '✓ Full Access',
      'materials-only': '📄 Materials Only',
      'quiz-only': '✓ Quiz Only',
    };

    return {
      type: accessType,
      scope: accessScope,
      display: accessDisplayMap[accessType] || 'Full Access',
    };
  };

  const accessInfo = getAccessInfo();
  const materialsAccessible = accessInfo.type === 'all-access' || accessInfo.type === 'materials-only';
  const quizzesAccessible = accessInfo.type === 'all-access' || accessInfo.type === 'quiz-only';

  return (
    <div className="space-y-8">
      {/* Overall Progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8 border border-red-100"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Your Progress</h3>
          <div className="text-right">
            <p className="text-4xl font-bold text-red-800">{overallPercentage}%</p>
            <p className="text-sm text-gray-600 mt-1">Complete</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-red-200 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallPercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="bg-gradient-to-r from-red-800 to-red-700 h-full rounded-full"
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="text-center p-3 bg-white rounded-lg border border-red-100">
            <p className="text-2xl font-bold text-gray-900">{materialsViewed}</p>
            <p className="text-xs text-gray-600 mt-1">Materials Viewed</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-red-100">
            <p className="text-2xl font-bold text-gray-900">{quizzesCompleted}</p>
            <p className="text-xs text-gray-600 mt-1">Quizzes Passed</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-red-100">
            <p className="text-2xl font-bold text-gray-900">{certificateIssued ? '✓' : '0'}</p>
            <p className="text-xs text-gray-600 mt-1">Certificates</p>
          </div>
        </div>
      </motion.div>

      {/* Access Information */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl p-6 border border-gray-200"
      >
        <h3 className="font-bold text-gray-900 mb-4">Access Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600">Access Type</p>
            <p className="text-lg font-bold text-blue-700 mt-1">{accessInfo.display}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm text-gray-600">Enrollment Status</p>
            <p className="text-lg font-bold text-purple-700 mt-1 capitalize">
              {enrollment.status}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Materials Section */}
      {materialsAccessible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 border border-gray-200"
        >
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h3 className="font-bold text-gray-900">Course Materials</h3>
          </div>

          {totalMaterials > 0 ? (
            <>
              <p className="text-sm text-gray-600 mb-4">
                {materialsViewed} of {totalMaterials} materials viewed
              </p>

              {/* Materials Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${materialsPercentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full"
                  />
                </div>
              </div>

              <p className="text-sm text-gray-700 font-medium">
                {materialsPercentage}% Complete
              </p>
            </>
          ) : (
            <p className="text-gray-600 text-sm">
              No materials available for this course yet.
            </p>
          )}
        </motion.div>
      )}

      {/* Quizzes Section */}
      {quizzesAccessible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl p-6 border border-gray-200"
        >
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-6 h-6 text-amber-600" />
            <h3 className="font-bold text-gray-900">Quizzes & Assessments</h3>
          </div>

          {course?.quizIds && course.quizIds.length > 0 ? (
            <>
              <p className="text-sm text-gray-600 mb-4">
                {quizzesCompleted} of {course.quizIds.length} quizzes passed
              </p>

              <div className="space-y-2">
                {course.quizIds.map((quizId: string, index: number) => (
                  <div
                    key={quizId}
                    className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200"
                  >
                    {index < quizzesCompleted ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                    <span className="text-sm text-gray-700 font-medium">
                      Quiz {index + 1}
                    </span>
                    {index < quizzesCompleted && (
                      <span className="ml-auto text-xs font-bold text-emerald-700">Passed</span>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-600 text-sm">
              No quizzes available for this course yet.
            </p>
          )}
        </motion.div>
      )}

      {/* Certificate Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`rounded-2xl p-6 border-2 ${
          certificateIssued
            ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-300'
            : 'bg-gray-50 border-gray-200'
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-lg flex-shrink-0 ${
              certificateIssued
                ? 'bg-emerald-200'
                : 'bg-gray-200'
            }`}
          >
            {certificateIssued ? (
              <Award className="w-6 h-6 text-emerald-700" />
            ) : (
              <Lock className="w-6 h-6 text-gray-500" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-1">Certificate of Completion</h3>
            {certificateIssued ? (
              <>
                <p className="text-sm text-emerald-700 mb-3">
                  ✓ Certificate issued! You have successfully completed this program.
                </p>
                <button className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 underline">
                  Download Certificate
                </button>
              </>
            ) : (
              <p className="text-sm text-gray-600">
                Complete all materials and pass all quizzes to earn your certificate.
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Reminder */}
      {overallPercentage < 100 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900">
              {100 - overallPercentage}% to go!
            </p>
            <p className="text-sm text-blue-800 mt-1">
              Keep up the good work! Continue viewing materials and completing quizzes to earn your certificate.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default EnrollmentProgressComponent;

