
"use client";

import type { SchoolEvent, Announcement } from '@/types'; // Updated import
import { useEffect, useState } from 'react';
import { AnnouncementCard } from './AnnouncementCard';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';

interface KioskCarouselProps {
  items: (Announcement | SchoolEvent)[]; // Changed type to accept both
  interval?: number; // in milliseconds
}

export function KioskCarousel({ items, interval = 7000 }: KioskCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    if (items.length <= 1) return;

    const timer = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, interval);

    return () => clearTimeout(timer);
  }, [currentIndex, items.length, interval]);

  if (!items || items.length === 0) {
    return <p className="text-center text-muted-foreground text-lg">{t('noEventsGeneralHint')}</p>;
  }

  const [direction, setDirection] = useState(0);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) {
        return items.length - 1;
      }
      return nextIndex % items.length;
    });
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto overflow-hidden" style={{ minHeight: '300px' }}>
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          className="absolute w-full" // Ensure the motion div takes full width for proper positioning
        >
          <AnnouncementCard item={items[currentIndex]} />
        </motion.div>
      </AnimatePresence>
      
      {items.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-10 bg-background/50 hover:bg-background/80"
            onClick={() => paginate(-1)}
            aria-label="Previous announcement"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-10 bg-background/50 hover:bg-background/80"
            onClick={() => paginate(1)}
            aria-label="Next announcement"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
           <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 w-2 rounded-full transition-all ${
                  currentIndex === index ? 'bg-primary w-4' : 'bg-muted-foreground/50'
                }`}
                aria-label={`Go to announcement ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
