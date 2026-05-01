'use client';
import React, { useState, useEffect, useCallback } from 'react';

// Gallery item interface
interface GalleryItem {
  id: number;
  title: string;
  photoUrl: string;
  span?: 'col-span-2' | 'row-span-2';
}

const galleryItems: GalleryItem[] = [
    { id: 1, title: "Deep Excavation Support", photoUrl: "https://res.cloudinary.com/dalpf8iip/image/upload/v1755148618/BASE-Design-of-effective-retaining-structures-for-deep-excavation-to-construct-multiple-basements-of-buildings-and-underground-metro-stations-1-scaled-1_1_di0ecs.jpg", span: 'col-span-2' },
    { id: 2, title: "Structural Framework", photoUrl: "https://res.cloudinary.com/dalpf8iip/image/upload/v1755148809/BASE-Design-of-effective-retaining-structures-for-deep-excavation-to-construct-multiple-basements-of-buildings-and-underground-metro-stations-2-scaled-1_n4qdge.jpg" },
    { id: 3, title: "Foundation Work", photoUrl: "https://res.cloudinary.com/dalpf8iip/image/upload/v1755148914/BASE-Design-of-effective-retaining-structures-for-deep-excavation-to-construct-multiple-basements-of-buildings-and-underground-metro-stations-4-scaled-1_edfik4.jpg" },
    { id: 4, title: "Metro Station Construction", photoUrl: "https://res.cloudinary.com/dalpf8iip/image/upload/v1755149443/BASE-Design-of-effective-retaining-structures-for-deep-excavation-to-construct-multiple-basements-of-buildings-and-underground-metro-stations-5-scaled-1_2_qretl7.jpg", span: 'row-span-2' },
    { id: 5, title: "Reinforcement Cage", photoUrl: "https://res.cloudinary.com/dalpf8iip/image/upload/v1755149549/BASE-Design-of-effective-retaining-structures-for-deep-excavation-to-construct-multiple-basements-of-buildings-and-underground-metro-stations-6-scaled-1_sptnes.jpg" },
    { id: 6, title: "Building Superstructure", photoUrl: "https://res.cloudinary.com/dalpf8iip/image/upload/v1755149606/BASE-Design-of-effective-retaining-structures-for-deep-excavation-to-construct-multiple-basements-of-buildings-and-underground-metro-stations-7-scaled-1_c7l4iz.jpg" },
    { id: 7, title: "Underground Construction", photoUrl: "https://res.cloudinary.com/dalpf8iip/image/upload/v1755149714/BASE-Design-of-effective-retaining-structures-for-deep-excavation-to-construct-multiple-basements-of-buildings-and-underground-metro-stations-8-scaled-1_drtf9f.jpg" },
    { id: 8, title: "Site Overview", photoUrl: "https://res.cloudinary.com/dalpf8iip/image/upload/v1755150033/BASE-Design-of-effective-retaining-structures-for-deep-excavation-to-construct-multiple-basements-of-buildings-and-underground-metro-stations-9-1_wqjo0r.jpg", span: 'col-span-2' },
    { id: 9, title: "Structural Beams", photoUrl: "https://res.cloudinary.com/dalpf8iip/image/upload/v1755150169/BASE-Design-of-effective-retaining-structures-for-deep-excavation-to-construct-multiple-basements-of-buildings-and-underground-metro-stations-10-1_jklaie.jpg" },
    { id: 10, title: "Modern Office Space", photoUrl: "https://res.cloudinary.com/dalpf8iip/image/upload/v1755150214/BASE-Design-of-effective-retaining-structures-for-deep-excavation-to-construct-multiple-basements-of-buildings-and-underground-metro-stations-11-1_bfrapp.jpg" },
    { id: 11, title: "Architectural Concrete", photoUrl: "https://res.cloudinary.com/dalpf8iip/image/upload/v1755150239/BASE-Design-of-effective-retaining-structures-for-deep-excavation-to-construct-multiple-basements-of-buildings-and-underground-metro-stations-13-1_qmbvqe.jpg" },
    { id: 12, title: "Steel Framework", photoUrl: "https://res.cloudinary.com/dalpf8iip/image/upload/v1755150266/BASE-Design-of-effective-retaining-structures-for-deep-excavation-to-construct-multiple-basements-of-buildings-and-underground-metro-stations-14-1_hw797x.jpg", span: 'row-span-2' },
    { id: 13, title: "Construction Progress", photoUrl: "https://res.cloudinary.com/dalpf8iip/image/upload/v1755150312/BASE-Design-of-effective-retaining-structures-for-deep-excavation-to-construct-multiple-basements-of-buildings-and-underground-metro-stations-15-1_nc5fmn.jpg" },
    { id: 14, title: "High-Rise Structure", photoUrl: "https://res.cloudinary.com/dalpf8iip/image/upload/v1755150343/BASE-Design-of-effective-retaining-structures-for-deep-excavation-to-construct-multiple-basements-of-buildings-and-underground-metro-stations-16-1_bhvdjs.jpg" },
    { id: 15, title: "Complex Engineering", photoUrl: "https://res.cloudinary.com/dalpf8iip/image/upload/v1755150368/BASE-Design-of-effective-retaining-structures-for-deep-excavation-to-construct-multiple-basements-of-buildings-and-underground-metro-stations-17-1_mjbuwl.jpg" }
];


export default function BaseGallery() {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const openModal = (index: number) => {
    document.body.style.overflow = 'hidden';
    setSelectedImageIndex(index);
  };

  const closeModal = useCallback(() => {
    document.body.style.overflow = 'auto';
    setSelectedImageIndex(null);
  }, []);

  const showNext = useCallback(() => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((prevIndex) => (prevIndex! + 1) % galleryItems.length);
    }
  }, [selectedImageIndex]);

  const showPrev = useCallback(() => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((prevIndex) => (prevIndex! - 1 + galleryItems.length) % galleryItems.length);
    }
  }, [selectedImageIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex !== null) {
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowRight') showNext();
        if (e.key === 'ArrowLeft') showPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImageIndex, closeModal, showNext, showPrev]);

  return (
    <div className="bg-gray-50 min-h-screen max-5xl mx-auto  font-sans text-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <header className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-extrabold text-black mb-3 tracking-tight">
                BASE Gallery
            </h1>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto">
                Showcasing Landmark Projects by the Bangladesh Association of Structural Engineers.
            </p>
            <div className="w-28 h-1 bg-red-800 mx-auto mt-6 rounded-full"></div>
        </header>
        
        <main className="grid grid-cols-2 md:grid-cols-4 gap-4 max-5xl mx-auto auto-rows-[250px]">
          {galleryItems.map((item, index) => (
            <div
              key={item.id}
              className={`relative overflow-hidden rounded-xl shadow-lg cursor-pointer group ${item.span || ''}`}
              onClick={() => openModal(index)}
            >
              <img
                src={item.photoUrl}
                alt={item.title || `Gallery image ${item.id}`}
                className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute bottom-0 left-0 p-6 text-white transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500 ease-in-out">
              </div>
            </div>
          ))}
        </main>
      </div>

      {selectedImageIndex !== null && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center transition-opacity duration-300 animate-fadeIn backdrop-blur-sm"
          onClick={closeModal}
        >
          <div 
            className="relative w-full h-full max-w-6xl max-h-screen p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={galleryItems[selectedImageIndex].photoUrl}
              alt={galleryItems[selectedImageIndex].title}
              className="w-full h-full object-contain animate-scaleIn"
            />
            
            <button
              onClick={closeModal}
              className="absolute top-5 right-5 text-white bg-black/50 rounded-full p-2 hover:bg-red-800 hover:scale-110 transition-all duration-300"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <button
              onClick={showPrev}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full p-2 hover:bg-red-800 hover:scale-110 transition-all duration-300"
               aria-label="Previous image"
            >
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>

            <button
              onClick={showNext}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full p-2 hover:bg-red-800 hover:scale-110 transition-all duration-300"
              aria-label="Next image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </div>
      )}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
      `}</style>
    </div>
  );
}


