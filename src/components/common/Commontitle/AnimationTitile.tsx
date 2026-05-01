import React from 'react';

// A professional, animated title component for hero sections.
// Built with Next.js, TypeScript, and Tailwind CSS.
// Features a sophisticated letter-by-letter reveal animation with smooth transitions.
// Designed for maximum visual impact while maintaining accessibility and performance.

interface ProfessionalAnimatedTitleProps {
  /** The main title text to display */
  title: string;
  /** The subtitle text to display below the title */
  subTitle?: string;
  /** Custom CSS classes for additional styling */
  className?: string;
  /** Whether to enable the hover animation */
  enableHover?: boolean;
}

export const ProfessionalAnimatedTitle: React.FC<ProfessionalAnimatedTitleProps> = ({
  title,
  subTitle,
  className = "",
  enableHover = true
}) => {
  // Split the title into words for better animation control
  const words = title.split(' ');

  return (
    <div className={`flex items-center justify-center font-sans select-none ${className}`}>
      <div className="text-center px-6 py-4 max-w-4xl mx-auto">
        {/* Main Title */}
        <h1
          className="
            text-gray-900
            text-3xl
            md:text-4xl
            lg:text-4xl
            font-bold
            uppercase
            tracking-tight
            leading-tight
          
            relative
          "
          aria-label={title}
        >
          <span className="relative inline-block">
            {words.map((word, wordIndex) => (
              <span
                key={`word-${wordIndex}`}
                className={`
                  inline-block mr-3 mb-2
                  transition-all duration-500 ease-out
                  ${enableHover ? 'hover:text-red-800 hover:scale-105' : ''}
                  ${enableHover ? 'group' : ''}
                `}
                style={{
                  transitionDelay: `${wordIndex * 100}ms`,
                  animationDelay: `${wordIndex * 100}ms`
                }}
              >
                {word.split('').map((char, charIndex) => (
                  <span
                    key={`char-${wordIndex}-${charIndex}`}
                    className="
                      inline-block
                      transition-all duration-300 ease-out
                      transform
                      hover:-translate-y-1
                      hover:text-red-800
                    "
                    style={{
                      transitionDelay: `${(wordIndex * 100) + (charIndex * 30)}ms`,
                      textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    {char}
                  </span>
                ))}
              </span>
            ))}
          </span>

          {/* Decorative underline */}
          <div className="flex justify-center items-center space-x-3 ">
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-red-800 to-transparent rounded-full"></div>
            <div className="w-2 h-2 bg-red-800 rounded-full shadow-sm"></div>
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-red-800 to-transparent rounded-full"></div>
          </div>
        </h1>

        {/* Subtitle */}
        {subTitle && (
          <p className="
            text-gray-700
            text-sm
            md:text-sm
            font-medium
            leading-relaxed
            max-w-3xl
            mx-auto
         
            
            relative
          ">
            <span className="
              relative inline-block
              before:absolute
              before:inset-0
              before:bg-gradient-to-r
              before:from-red-50
              before:to-transparent
              before:rounded-lg
              before:-z-10
              before:opacity-60
              px-6
              py-3
              rounded-lg
            ">
              {subTitle}
            </span>
          </p>
        )}

        {/* Subtle background accent */}
        <div className="
          absolute
          inset-0
          -z-20
          bg-gradient-to-b
          from-red-50/20
          to-transparent
          rounded-2xl
          blur-3xl
          opacity-30
          pointer-events-none
        "></div>
      </div>
    </div>
  );
};


