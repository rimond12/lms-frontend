import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="relative flex items-center justify-center">
        {/* Outer spinning circle (ইমেজ বড় করার কারণে স্পিনারও একটু বড় (w-32 h-32) করা হয়েছে) */}
        <div className="absolute w-32 h-32 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

        {/* Inner static image */}
        {/* Tailwind-এ arbitrary value [200px] ব্যবহার করে একদম পারফেক্ট বড় সাইজ দেওয়া হয়েছে */}
        <div className="relative w-[200px] h-[200px] flex items-center justify-center">
          <img
            src="/images/imigrant-1.png"
            alt="Book Loading"
            className="w-20 h-20 object-contain" // ইমেজের মূল সাইজ এখানে w-20 (80px) করা হয়েছে, চাইলে আরও বাড়াতে পারেন
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;