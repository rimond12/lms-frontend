'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ProfessionalAnimatedTitle } from '@/components/common/Commontitle/AnimationTitile';

// Gallery item interface
interface GalleryItem {
  id: number;
  title: string;
  photoUrl: string;
}

interface DisplayedItem extends GalleryItem {
  position: { row: number; col: number };
  key: string;
}

const galleryItems: GalleryItem[] = [
  {
    id: 1,
    title: "",
    photoUrl: "https://res.cloudinary.com/dalpf8iip/image/upload/v1755148618/BASE-Design-of-effective-retaining-structures-for-deep-excavation-to-construct-multiple-basements-of-buildings-and-underground-metro-stations-1-scaled-1_1_di0ecs.jpg",
  },
  {
    id: 2,
    title: "",
    photoUrl: "https://res.cloudinary.com/dalpf8iip/image/upload/v1755148809/BASE-Design-of-effective-retaining-structures-for-deep-excavation-to-construct-multiple-basements-of-buildings-and-underground-metro-stations-2-scaled-1_n4qdge.jpg",
  },
  {
    id: 3,
    title: "",
    photoUrl: "https://res.cloudinary.com/dalpf8iip/image/upload/v1755148914/BASE-Design-of-effective-retaining-structures-for-deep-excavation-to-construct-multiple-basements-of-buildings-and-underground-metro-stations-4-scaled-1_edfik4.jpg",
  },


  {
    id: 4,
    title: "",
    photoUrl: "https://res.cloudinary.com/dalpf8iip/image/upload/v1755149443/BASE-Design-of-effective-retaining-structures-for-deep-excavation-to-construct-multiple-basements-of-buildings-and-underground-metro-stations-5-scaled-1_2_qretl7.jpg",
  },
  {
    id: 5,
    title: "",
    photoUrl: "https://res.cloudinary.com/dalpf8iip/image/upload/v1755149549/BASE-Design-of-effective-retaining-structures-for-deep-excavation-to-construct-multiple-basements-of-buildings-and-underground-metro-stations-6-scaled-1_sptnes.jpg",
  },
  {
    id: 6,
    title: "",
    photoUrl: "https://res.cloudinary.com/dalpf8iip/image/upload/v1755149606/BASE-Design-of-effective-retaining-structures-for-deep-excavation-to-construct-multiple-basements-of-buildings-and-underground-metro-stations-7-scaled-1_c7l4iz.jpg",
  },
  {
    id: 7,
    title: "",
    photoUrl: "https://res.cloudinary.com/dalpf8iip/image/upload/v1755149714/BASE-Design-of-effective-retaining-structures-for-deep-excavation-to-construct-multiple-basements-of-buildings-and-underground-metro-stations-8-scaled-1_drtf9f.jpg",
  },
  {
    id: 8,
    title: "",
    photoUrl: "https://res.cloudinary.com/dalpf8iip/image/upload/v1755150033/BASE-Design-of-effective-retaining-structures-for-deep-excavation-to-construct-multiple-basements-of-buildings-and-underground-metro-stations-9-1_wqjo0r.jpg",
  },
  {
    id: 9,
    title: "",
    photoUrl: "https://res.cloudinary.com/dalpf8iip/image/upload/v1755150169/BASE-Design-of-effective-retaining-structures-for-deep-excavation-to-construct-multiple-basements-of-buildings-and-underground-metro-stations-10-1_jklaie.jpg",
  },
  {
    id: 10,
    title: "Office Space",
    photoUrl: "https://res.cloudinary.com/dalpf8iip/image/upload/v1755150214/BASE-Design-of-effective-retaining-structures-for-deep-excavation-to-construct-multiple-basements-of-buildings-and-underground-metro-stations-11-1_bfrapp.jpg",
  },
  {
    id: 11,
    title: "",
    photoUrl: "https://res.cloudinary.com/dalpf8iip/image/upload/v1755150239/BASE-Design-of-effective-retaining-structures-for-deep-excavation-to-construct-multiple-basements-of-buildings-and-underground-metro-stations-13-1_qmbvqe.jpg",
  },
  {
    id: 12,
    title: "",
    photoUrl: "https://res.cloudinary.com/dalpf8iip/image/upload/v1755150266/BASE-Design-of-effective-retaining-structures-for-deep-excavation-to-construct-multiple-basements-of-buildings-and-underground-metro-stations-14-1_hw797x.jpg",
  },
  {
    id: 13,
    title: "",
    photoUrl: "https://res.cloudinary.com/dalpf8iip/image/upload/v1755150312/BASE-Design-of-effective-retaining-structures-for-deep-excavation-to-construct-multiple-basements-of-buildings-and-underground-metro-stations-15-1_nc5fmn.jpg",
  },
  {
    id: 14,
    title: "",
    photoUrl: "https://res.cloudinary.com/dalpf8iip/image/upload/v1755150343/BASE-Design-of-effective-retaining-structures-for-deep-excavation-to-construct-multiple-basements-of-buildings-and-underground-metro-stations-16-1_bhvdjs.jpg",
  },
  {
    id: 15,
    title: "",
    photoUrl: "https://res.cloudinary.com/dalpf8iip/image/upload/v1755150368/BASE-Design-of-effective-retaining-structures-for-deep-excavation-to-construct-multiple-basements-of-buildings-and-underground-metro-stations-17-1_mjbuwl.jpg",
  }
];

// Grid positions for random placement
const gridPositions = [
  { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 1, col: 3 }, { row: 1, col: 4 }, { row: 1, col: 5 },
  { row: 2, col: 1 }, { row: 2, col: 2 }, { row: 2, col: 3 }, { row: 2, col: 4 }, { row: 2, col: 5 },
  { row: 3, col: 1 }, { row: 3, col: 2 }, { row: 3, col: 3 }, { row: 3, col: 4 }, { row: 3, col: 5 }
];

const Gallery = () => {
  const [displayedItems, setDisplayedItems] = useState<DisplayedItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to get random items for display
  const getRandomItems = (): DisplayedItem[] => {
    const shuffled = [...galleryItems].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 15).map((item, index) => ({
      ...item,
      position: gridPositions[index],
      key: `${item.id}-${Date.now()}-${index}` // Unique key for animations
    }));
  };

  // Initialize and set up interval for changing items
  useEffect(() => {
    // Set initial items
    setDisplayedItems(getRandomItems());

    // Change items every 4 seconds
    const interval = setInterval(() => {
      setDisplayedItems(getRandomItems());
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Modal functions
  const openModal = (imageIndex: number) => {
    setSelectedImage(imageIndex);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  const goToPrevious = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage > 0 ? selectedImage - 1 : galleryItems.length - 1);
    }
  };

  const goToNext = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage < galleryItems.length - 1 ? selectedImage + 1 : 0);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isModalOpen) {
        switch (event.key) {
          case 'Escape':
            closeModal();
            break;
          case 'ArrowLeft':
            goToPrevious();
            break;
          case 'ArrowRight':
            goToNext();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, selectedImage]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 20 
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <>
      <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          

          <ProfessionalAnimatedTitle title="  Photo Gallery" subTitle="   Explore our beautiful collection of images" />


          {/* Gallery Grid */}
          <motion.div 
            className="relative"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6 max-w-6xl mx-auto">
              <AnimatePresence mode="popLayout">
                {displayedItems.map((item, index) => (
                  <motion.div
                    key={item.key}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="relative group cursor-pointer"
                    whileHover={{ scale: 1.05, zIndex: 10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    onClick={() => openModal(galleryItems.findIndex(galleryItem => galleryItem.id === item.id))}
                  >
                    {/* Image Card */}
                    <div className="relative bg-white rounded-2xl p-1 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:shadow-2xl">
                      {/* Gradient Border */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                      
                      {/* Content */}
                      <div className="relative bg-white rounded-2xl overflow-hidden">
                        {/* Image */}
                        <div className="aspect-square relative overflow-hidden rounded-xl">
                          <Image
                            src={item.photoUrl}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                          
                          {/* Overlay with title */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-2 left-2 right-2 text-white">
                              <p className="font-semibold text-sm truncate">{item.title}</p>
                            </div>
                          </div>

                          {/* View Badge */}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                              📷 View
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Floating Elements */}
                    <motion.div
                      className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-100"
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Background Decorative Elements */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 right-20 w-12 h-12 bg-pink-200 rounded-full opacity-20 animate-pulse delay-2000"></div>
          </motion.div>
        </div>
      </section>

      {/* Image Modal */}
      <AnimatePresence>
        {isModalOpen && selectedImage !== null && (
          <motion.div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            {/* Modal Content */}
            <motion.div
              className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              >
                <X size={24} />
              </button>

              {/* Previous Button */}
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
              >
                <ChevronLeft size={32} />
              </button>

              {/* Next Button */}
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
              >
                <ChevronRight size={32} />
              </button>

              {/* Main Image */}
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={galleryItems[selectedImage].photoUrl}
                  alt={galleryItems[selectedImage].title}
                  width={800}
                  height={800}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
                
                {/* Image Title */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/50 text-white p-4 rounded-lg backdrop-blur-sm">
                  <h3 className="text-xl font-semibold">{galleryItems[selectedImage].title}</h3>
                  <p className="text-sm opacity-75">{selectedImage + 1} of {galleryItems.length}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Gallery;
