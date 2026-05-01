

"use client";
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'already-verified'>('verifying');
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const storedEmail = localStorage.getItem('emailForVerification');
    if (storedEmail) setEmail(storedEmail);

    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setError('Invalid verification link - no token provided');
        return;
      }

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`,
          { token },
          { timeout: 80000 }
        );

        if (response.data.success) {
          setStatus('success');
          toast.success('Email verified successfully!');
          localStorage.removeItem('emailForVerification');
        } else {
          setStatus('error');
          setError(response.data.message || 'Verification failed. Please try again.');
        }
      } catch (error: any) {
        console.log('Verification error details:', error.response?.data);
        
        // Check if email is already verified
        if (error.response?.data?.message?.includes('Email is already verified') ||
            error.response?.data?.message?.includes('already verified')) {
          setStatus('already-verified');
          toast.success('Your email is already verified!');
          localStorage.removeItem('emailForVerification');
          return;
        }

        setStatus('error');
        if (error.response) {
          setError(error.response.data?.message || 'Verification failed. Please try again.');
        } else if (error.request) {
          setError('Network error. Please check your connection and try again.');
        } else {
          setError('An unexpected error occurred. Please try again.');
        }
      }
    };

    verifyEmail();
  }, [token]);

  const handleResend = async () => {
    setIsResending(true);
    setError('');

    try {
      if (!email) {
        setError('No email found for verification. Please register again.');
        return;
      }

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/resend-verification`,
        { email },
        { timeout: 10000 }
      );

      toast.success('Verification email resent successfully!');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message ||
                      'Failed to resend verification email. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-red-50 to-rose-100">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-white/20 space-y-6">
        {/* Top message about verification process */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold  bg-clip-text text-transparent bg-gradient-to-r from-red-800 to-rose-600">
            Email Verification
          </h2>
          {email && (
            <p className="mt-2 text-gray-600">
              We've sent a verification link to <span className="font-semibold text-rose-600">{email}</span>
            </p>
          )}
        </div>

        {status === 'verifying' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="h-12 w-12 animate-spin text-rose-600" />
            <h3 className="text-xl font-semibold text-gray-800">Verifying your email</h3>
            <p className="text-gray-600 text-center">
              Please wait while we verify your email address. This may take a moment.
            </p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="space-y-6">
            <div className="text-center">
              <svg
                className="mx-auto h-16 w-16 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-4 text-2xl font-bold text-gray-900">Verification Complete!</h3>
              <p className="mt-2 text-gray-600">
                Your email address has been successfully verified. You can now access your account.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/login')}
                className="w-full py-3 text-lg font-semibold text-white bg-gradient-to-r from-red-800 to-rose-600 rounded-lg hover:from-red-700 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl"
              >
                Continue to Login
              </button>
              <p className="text-center text-sm text-gray-500 mt-4">
                Didn't receive our email?{' '}
                <button 
                  onClick={handleResend}
                  className="text-rose-600 hover:text-rose-800 hover:underline font-medium"
                >
                  Resend verification
                </button>
              </p>
            </div>
          </div>
        )}
        
        {status === 'already-verified' && (
          <div className="space-y-6">
            <div className="text-center">
              <svg
                className="mx-auto h-16 w-16 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-4 text-2xl font-bold text-gray-900">Email Already Verified</h3>
              <p className="mt-2 text-gray-600">
                Your email address is already verified. You can proceed to login.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/login')}
                className="w-full py-3 text-lg font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl"
              >
                Continue to Login
              </button>
            </div>
          </div>
        )}
        
        {status === 'error' && (
          <div className="space-y-6">
            <div className="text-center">
              <svg
                className="mx-auto h-16 w-16 text-red-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h3 className="mt-4 text-2xl font-bold text-gray-900">Verification Failed</h3>
              <p className="mt-2 text-gray-600">
                {error || 'We encountered an issue verifying your email address.'}
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleResend}
                disabled={isResending}
                className="w-full py-3 text-lg font-semibold text-white bg-gradient-to-r from-red-800 to-rose-600 rounded-lg hover:from-red-700 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isResending ? (
                  <>
                    <Loader2 className="inline mr-2 h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Resend Verification Email'
                )}
              </button>
              
              <Link href="/register" passHref>
                <button className="w-full py-3 text-lg font-semibold text-rose-600 border border-rose-600 rounded-lg hover:bg-rose-50 transition-all shadow-sm hover:shadow-md">
                  Back to Registration
                </button>
              </Link>

              {/* Bottom message */}
              <div className="text-center text-sm text-gray-500 mt-4">
                Need help?{' '}
                <Link href="/contact" className="text-rose-600 hover:text-rose-800 hover:underline font-medium">
                  Contact support
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-red-50 to-rose-100">
        <div className="max-w-md w-full bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-white/20 space-y-6">
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="h-12 w-12 animate-spin text-rose-600" />
            <h3 className="text-xl font-semibold text-gray-800">Loading verification</h3>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
} 

