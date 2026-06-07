export interface ChangelogItem {
  version: string;
  date: string;
  title: string;
  changes: string[];
  type: "major" | "minor" | "patch";
}

export const changelogData: ChangelogItem[] = [
  // {
  //   version: "1.5.0",
  //   date: "Mar 01, 2026",
  //   title: "Quiz System & Assessment Enhancements",
  //   type: "minor",
  //   changes: [
  //     "🧠 **Advanced Quiz System**: Added interactive quiz feature with image support for questions and options.",
  //     "🔍 **Image Zoom (Modal)**: Students can now click to zoom on quiz images for better visibility.",
  //     "🔓 **Module Unlocking Fixed**: Resolved issue where modules weren't opening correctly based on schedule.",
  //     "📝 **Assignment Fixes**: Fixed 'Assignment Not Found' errors and improved assignment navigation.",
  //     "💰 **Discount Display**: Added visual discount and offer views for students during batch enrollments.",
  //     "⚙️ **Publish Control**: Unpublished quizzes and assignments are now properly hidden from students.",
  //     "👥 **Bulk Enrollment**: Added feature to enroll multiple students at once efficiently.",
  //     "🚫 **Duplicate Enrollment Fix**: Resolved duplicate key and invalid user ID errors during enrollment.",
  //     "📝 **Assignment Bugs**: Fixed various assignment issues and improved stability.",
  //     "📈 **Activity History**: Added and improved activity tracking for better monitoring.",
  //   ],
  // },
  {
    version: "1.4.0",
    date: "Feb 18, 2026",
    title: "Sequential Learning & Critical Fixes",
    type: "minor",
    changes: [
      "🔒 **Sequential Unlocking**: Videos now unlock sequentially (Video 1 → Video 2).",
      "📝 **Assignment Gating**: Next module remains locked until current assignment is graded.",
      "📊 **Progress Tracking**: Added detailed visual progress bar for course completion.",
      "🐛 **Critical Fixes**: Resolved '404 Not Found' on  Assignment view & fixed 'Mark as Read' issues.",
      "⚙️ **Legacy Support**: Optimized sequence logic to handle existing student progress gracefully.",
    ],
  },
  {
    version: "1.3.0",
    date: "Feb 15, 2026",
    title: "Video Engine & Dashboard Optimization",
    type: "minor",
    changes: [
      "🎥 **Advanced Video Player**: Fixed VdoCipher 'Unauthorized' issues and optimized seeking/playback.",
      "⚡ **Video Caching**: Implemented smart caching for faster video load times.",
      "📊 **Dashboard Stats**: Updated 'Active Course' logic to show progress accurately.",
      "🛠️ **Lesson Manager**: Simplified lesson types (Video, Link, File) and set Secure Video as default.",
      "🎬 **Direct Video**: Added support for direct MP4/Server video links.",
    ],
  },
  {
    version: "1.2.0",
    date: "Feb 09, 2026",
    title: "Profile Experience & System Updates",
    type: "minor",
    changes: [
      "✨ **Redesigned Profile Banner**: Modern glassmorphism layout with real-time Dashboard Clock.",
      "📜 **Changelog System**: Added 'What's New' modal to track platform updates.",
      "✉️ **Email Verification**: Added 'Resend Verification' button and warning for unverified users.",
      "🚀 **Performance**: Optimized API calls to reduce page reloads.",
    ],
  },
  {
    version: "1.1.5",
    date: "Feb 08, 2026",
    title: "WhatsApp Integration & Admin Fixes",
    type: "patch",
    changes: [
      "📱 **WhatsApp Support**: Added 'Send Info to WhatsApp' button for quick student communication.",
      "🛒 **Product Management**: Fixed product image update issues in Admin panel.",
      "🔧 **Sidebar Navigation**: Resolved duplicate key errors in Admin Dashboard.",
    ],
  },
  {
    version: "1.1.0",
    date: "Feb 05, 2026",
    title: "Security & Communication",
    type: "minor",
    changes: [
      "👁️ **Password Visibility**: Admins can now toggle password visibility in student lists.",
      "📧 **Email Templates**: Updated Payment Reminder emails to include Batch Start Date.",
      "🔒 **Security**: Enhanced student data protection in table views.",
    ],
  },
  {
    version: "1.0.0",
    date: "Feb 03, 2026",
    title: "🚀 OFFICIAL LIVE DEPLOYMENT",
    type: "major",
    changes: [
      "🎉 **Platform Launch**: Successfully deployed Immigrant Jobs World to Production Server.",
      "👤 **User Profile**: Complete profile management with personal details.",
      "▶️ **Video Player**: Advanced course video player with playback controls.",
      "📝 **Assignments**: Student assignment submission and grading system.",
      "🧠 **Quizzes**: Interactive quiz module with instant results.",
      "📂 **File Uploads**: Fixed Assignment reference file uploads and persistence.",
      "🎨 **Course Cards**: Refined typography (Bangla fonts) and card design.",
      "🏷️ **Categories**: Enhanced category cards with gradients and better icons.",
    ],
  },
  {
    version: "0.9.8",
    date: "Feb 02, 2026",
    title: "Infrastructure & Domain Setup",
    type: "patch",
    changes: [
      "🌐 **Domain Live**: Configured `immigrantjobsworld.com` with SSL/HTTPS.",
      "🔄 **Enrollment Flow**: Fixed redirect issues on the Enroll page refresh.",
      "⚙️ **Server Config**: Optimized Nginx and Backend CORS settings.",
    ],
  },
  {
    version: "0.9.5",
    date: "Feb 01, 2026",
    title: "Mobile Responsiveness & Stability",
    type: "minor",
    changes: [
      "📱 **Mobile Navbar**: Fixed navigation menu and login button visibility on mobile devices.",
      "🛠️ **Backend Build**: Resolved TypeScript errors in Assignment and Notice services.",
      "🐛 **Bug Fixes**: Addressed various build stability issues.",
    ],
  },
  {
    version: "0.9.0",
    date: "Jan 29, 2026",
    title: "Student Management Features",
    type: "minor",
    changes: [
      "👥 **Student Table**: Enhanced table with Auto-generated Password display.",
      "📲 **Quick Share**: Added WhatsApp sharing integration for student credentials.",
    ],
  },
  {
    version: "0.8.5",
    date: "Jan 28, 2026",
    title: "Enrollment System Refinement",
    type: "patch",
    changes: [
      "🔍 **Batch Filtering**: Improved default filter behavior to show 'All Batches'.",
      "📋 **Enrollment List**: Fixed sorting and display issues in enrollment data.",
    ],
  },
  {
    version: "0.8.0",
    date: "Jan 01, 2026",
    title: "Project Inception (Alpha)",
    type: "major",
    changes: [
      "🏗️ **Core Architecture**: Initial setup of Next.js Frontend and Express Backend.",
      "💾 **Database Design**: MongoDB Schema for Users, Courses, and Enrollments.",
      "🔐 **Authentication**: Implemented JWT-based Auth system.",
    ],
  },
];
