/**
 * Example usage file demonstrating how to use the new AppImage component
 * and getImageUrl utility function throughout your application
 */

import AppImage from "@/components/ui/AppImage";
import { getImageUrl } from "@/utils/imageUtils";

// Example 1: Basic usage with server uploaded image
function UserProfile({ user }: { user: { profilePhoto?: string; name: string } }) {
  return (
    <div className="flex items-center space-x-3">
      <AppImage
        photoUrl={user.profilePhoto}
        alt={`${user.name}'s profile`}
        width={50}
        height={50}
        className="rounded-full object-cover"
      />
      <span>{user.name}</span>
    </div>
  );
}

// Example 2: Blog post card with fallback
function BlogCard({ blog }: { blog: { photoUrl?: string; title: string; content: string } }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <AppImage
        photoUrl={blog.photoUrl}
        defaultImage="/images/blog-placeholder.jpg"
        alt={blog.title}
        width={400}
        height={250}
        className="w-full object-cover"
      />
      <div className="p-4">
        <h3 className="font-bold text-lg">{blog.title}</h3>
        <p className="text-gray-600 mt-2">{blog.content.substring(0, 150)}...</p>
      </div>
    </div>
  );
}

// Example 3: Event card with sponsor photo
function EventCard({ event }: { 
  event: { 
    photoUrl?: string; 
    title: string; 
    sponsorPhotoUrl?: string; 
    sponsorName?: string;
  } 
}) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <AppImage
        photoUrl={event.photoUrl}
        alt={event.title}
        width={400}
        height={200}
        className="w-full object-cover"
      />
      <div className="p-4">
        <h3 className="font-bold text-lg">{event.title}</h3>
        {event.sponsorPhotoUrl && (
          <div className="flex items-center mt-2">
            <AppImage
              photoUrl={event.sponsorPhotoUrl}
              alt={`${event.sponsorName} logo`}
              width={30}
              height={30}
              className="rounded mr-2"
            />
            <span className="text-sm text-gray-600">Sponsored by {event.sponsorName}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Example 4: Gallery with mixed image sources
function ImageGallery({ images }: { 
  images: { url?: string; caption: string; isExternal?: boolean }[] 
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.map((image, index) => (
        <div key={index} className="relative group">
          <AppImage
            photoUrl={image.url}
            alt={image.caption}
            width={300}
            height={200}
            className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 rounded-b-lg">
            <p className="text-white text-sm">{image.caption}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Example 5: Using getImageUrl directly for background images or custom needs
function HeroBanner({ backgroundImage }: { backgroundImage?: string }) {
  const bgImageUrl = getImageUrl(backgroundImage, '/images/default-hero-bg.jpg');
  
  return (
    <div 
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${bgImageUrl})` }}
    >
      <div className="bg-black/50 text-white p-8 rounded-lg">
        <h1 className="text-4xl font-bold">Welcome to Our Platform</h1>
      </div>
    </div>
  );
}

// Example 6: Avatar with multiple size options
function Avatar({ 
  photoUrl, 
  name, 
  size = 'md' 
}: { 
  photoUrl?: string; 
  name: string; 
  size?: 'sm' | 'md' | 'lg' | 'xl' 
}) {
  const sizes = {
    sm: { width: 32, height: 32, className: 'w-8 h-8' },
    md: { width: 48, height: 48, className: 'w-12 h-12' },
    lg: { width: 64, height: 64, className: 'w-16 h-16' },
    xl: { width: 96, height: 96, className: 'w-24 h-24' }
  };

  const { width, height, className } = sizes[size];

  return (
    <AppImage
      photoUrl={photoUrl}
      defaultImage="/images/default-avatar.png"
      alt={`${name}'s avatar`}
      width={width}
      height={height}
      className={`${className} rounded-full object-cover border-2 border-gray-300`}
    />
  );
}

export {
  UserProfile,
  BlogCard,
  EventCard,
  ImageGallery,
  HeroBanner,
  Avatar
};
