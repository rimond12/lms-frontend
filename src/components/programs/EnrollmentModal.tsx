"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Check,
  Lock,
  DollarSign,
  Gift,
  AlertCircle,
  Loader,
  CreditCard,
} from 'lucide-react';
import { toast } from 'sonner';
import { useEnrollInCourseMutation, useCheckAccessQuery } from '@/app/redux/api/enrollmentApi/enrollmentApi';

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: any;
  onEnrollSuccess?: () => void;
}

const EnrollmentModal: React.FC<EnrollmentModalProps> = ({
  isOpen,
  onClose,
  course,
  onEnrollSuccess,
}) => {
  const [step, setStep] = useState<'options' | 'details' | 'success' | 'error'>('options');
  const [selectedOption, setSelectedOption] = useState<'free' | 'paid' | 'invite'>('free');
  const [invitationCode, setInvitationCode] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // API Hooks
  // const { data: userData } = useGetMeQuery({});
  const [enrollIncourse, { isLoading: isEnrolling }] = useEnrollInCourseMutation();
  const { data: accessData } = useCheckAccessQuery(
    { courseId: course._id },
    { skip: !isOpen || !course._id }
  );

  // Check if user is already enrolled
  useEffect(() => {
    if (accessData?.data?.hasAccess && isOpen) {
      setStep('error');
      setErrorMessage('You are already enrolled in this course');
    }
  }, [accessData, isOpen]);

  const handleClose = () => {
    if (step !== 'success' && step !== 'error') {
      setStep('options');
      setSelectedOption('free');
      setInvitationCode('');
      setAgreeToTerms(false);
      setErrorMessage(null);
    }
    onClose();
  };

  const handleNext = () => {
    if (selectedOption === 'invite' && !invitationCode.trim()) {
      toast.error('Please enter an invitation code');
      return;
    }
    setStep('details');
  };

  const handleEnroll = async () => {
    if (!agreeToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    try {
      const enrollmentData: any = {
        courseId: course._id,
      };

      // Add optional fields based on enrollment type
      if (selectedOption === 'paid') {
        // In a real app, this would trigger Stripe/payment gateway
        // For now, we'll send an empty paymentId which the backend can validate
        enrollmentData.paymentId = 'temp-payment-' + Date.now();
      } else if (selectedOption === 'invite') {
        enrollmentData.invitationCode = invitationCode;
      }

      const result = await enrollIncourse(enrollmentData).unwrap();

      if (result.success) {
        toast.success('Successfully enrolled in the course!');
        setStep('success');

        setTimeout(() => {
          onEnrollSuccess?.();
          handleClose();
        }, 2000);
      }
    } catch (error: any) {
      const errorMsg = error?.data?.message || error?.message || 'Enrollment failed. Please try again.';
      setErrorMessage(errorMsg);
      setStep('error');
      toast.error(errorMsg);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-red-800 to-red-700 px-6 py-4 flex items-center justify-between border-b border-red-700">
              <h2 className="text-xl font-bold text-white">
                {step === 'success' ? 'Welcome to the Course!' : 'Enroll in Course'}
              </h2>
              {step !== 'success' && (
                <button
                  onClick={handleClose}
                  className="p-1 hover:bg-red-800 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              )}
            </div>

            <div className="p-6 md:p-8">
              <AnimatePresence mode="wait">
                {/* Step 1: Enrollment Options */}
                {step === 'options' && (
                  <motion.div
                    key="options"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Choose Your Enrollment Option
                      </h3>
                      <p className="text-gray-600">
                        Select how you'd like to access this course
                      </p>
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                      {course.accessType !== 'paid' && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedOption('free')}
                          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                            selectedOption === 'free'
                              ? 'border-red-800 bg-red-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-3 rounded-lg ${
                              selectedOption === 'free'
                                ? 'bg-red-800 text-white'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              <Check className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">Free Enrollment</h4>
                              <p className="text-sm text-gray-600 mt-1">Get instant access to all materials</p>
                            </div>
                          </div>
                        </motion.button>
                      )}

                      {course.accessType === 'paid' || course.price ? (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedOption('paid')}
                          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                            selectedOption === 'paid'
                              ? 'border-red-800 bg-red-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-3 rounded-lg ${
                              selectedOption === 'paid'
                                ? 'bg-red-800 text-white'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              <CreditCard className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900">Premium Access</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                Full access with certificates and priority support
                              </p>
                              <div className="mt-2">
                                {course.discountedPrice ? (
                                  <>
                                    <span className="text-sm line-through text-gray-500">
                                      ${course.price}
                                    </span>
                                    <span className="text-lg font-bold text-red-800 ml-2">
                                      ${course.discountedPrice}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-lg font-bold text-red-800">
                                    ${course.price || 'Contact for pricing'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      ) : null}

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedOption('invite')}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                          selectedOption === 'invite'
                            ? 'border-red-800 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-3 rounded-lg ${
                            selectedOption === 'invite'
                              ? 'bg-red-800 text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            <Gift className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">Use Invitation Code</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Have an invitation code? Enter it here
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    </div>

                    {/* Invitation Code Input */}
                    {selectedOption === 'invite' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg"
                      >
                        <input
                          type="text"
                          placeholder="Enter your invitation code"
                          value={invitationCode}
                          onChange={(e) => setInvitationCode(e.target.value)}
                          className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </motion.div>
                    )}

                    {/* CTA Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleClose}
                        className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-900 font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleNext}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition-all"
                      >
                        Continue
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Details */}
                {step === 'details' && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Enrollment Details</h3>
                      <p className="text-gray-600">Review your enrollment information</p>
                    </div>

                    {/* Course Summary */}
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <h4 className="font-bold text-gray-900 mb-3">Course Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Course:</span>
                          <span className="font-semibold text-gray-900">{course.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-semibold text-gray-900">{course.duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Level:</span>
                          <span className="font-semibold text-gray-900">
                            {course.level?.charAt(0).toUpperCase() + course.level?.slice(1)}
                          </span>
                        </div>
                        {selectedOption === 'paid' && course.price && (
                          <div className="flex justify-between pt-2 border-t border-gray-300">
                            <span className="text-gray-600">Amount:</span>
                            <span className="font-bold text-red-800 text-base">
                              ${course.discountedPrice || course.price}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Terms Checkbox */}
                    <label className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={agreeToTerms}
                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                        className="w-5 h-5 text-red-800 rounded mt-1 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700">
                        I agree to the{' '}
                        <a href="#" className="text-red-800 font-semibold hover:underline">
                          terms and conditions
                        </a>
                        {' '}and{' '}
                        <a href="#" className="text-red-800 font-semibold hover:underline">
                          privacy policy
                        </a>
                      </span>
                    </label>

                    {/* CTA Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setStep('options')}
                        className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-900 font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleEnroll}
                        disabled={!agreeToTerms || isEnrolling}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isEnrolling ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            Processing...
                          </>
                        ) : selectedOption === 'paid' ? (
                          <>
                            <CreditCard className="w-4 h-4" />
                            Complete Payment
                          </>
                        ) : (
                          'Confirm Enrollment'
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Error */}
                {step === 'error' && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="text-center py-12"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.2 }}
                      className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <AlertCircle className="w-8 h-8 text-red-800" />
                    </motion.div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Unable to Enroll
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {errorMessage}
                    </p>

                    <div className="space-y-3">
                      <button
                        onClick={handleClose}
                        className="w-full px-6 py-3 bg-gradient-to-r from-red-800 to-red-700 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-800 transition-all"
                      >
                        Close
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Success */}
                {step === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center py-12"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.2 }}
                      className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <Check className="w-8 h-8 text-green-600" />
                    </motion.div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Enrollment Successful!
                    </h3>
                    <p className="text-gray-600 mb-2">
                      Congratulations! You've successfully enrolled in
                    </p>
                    <p className="text-lg font-semibold text-red-800 mb-6">
                      {course.title}
                    </p>

                    <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                      You can now access all course materials. Check your email for confirmation and next steps.
                    </p>

                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          handleClose();
                          onEnrollSuccess?.();
                        }}
                        className="w-full px-6 py-3 bg-gradient-to-r from-red-800 to-red-700 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-800 transition-all"
                      >
                        Start Learning
                      </button>
                      <button
                        onClick={handleClose}
                        className="w-full px-6 py-3 border border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EnrollmentModal;

