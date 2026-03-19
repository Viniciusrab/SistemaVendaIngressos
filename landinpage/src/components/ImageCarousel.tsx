import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageCarouselProps {
    images: string[];
    color: string;
}

export function ImageCarousel({ images, color }: ImageCarouselProps) {
    const [index, setIndex] = useState(0);

    const next = () => setIndex((prev) => (prev + 1) % images.length);
    const prev = () => setIndex((prev) => (prev - 1 + images.length) % images.length);

    useEffect(() => {
        const interval = setInterval(() => {
            next();
        }, 4000);
        return () => clearInterval(interval);
    }, [images.length]);

    // Calculate visible images for larger screens (e.g., 3 at a time)
    // For simplicity in this version, we will slide one by one but display a window

    return (
        <div className="relative w-full max-w-6xl mx-auto px-4 md:px-12">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold uppercase tracking-widest text-gray-400">Galeria</h3>
                <div className="flex gap-2">
                    <button
                        onClick={prev}
                        className="p-3 rounded-full border hover:bg-gray-100 transition-colors bg-white shadow-sm z-20"
                        style={{ borderColor: color, color }}
                        aria-label="Previous image"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                    <button
                        onClick={next}
                        className="p-3 rounded-full border hover:bg-gray-100 transition-colors bg-white shadow-sm z-20"
                        style={{ borderColor: color, color }}
                        aria-label="Next image"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                </div>
            </div>

            <div className="relative overflow-hidden h-[400px] md:h-[500px] w-full">
                <AnimatePresence initial={false} mode='popLayout'>
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0, zIndex: 1 }}
                        exit={{ opacity: 0, x: -100, zIndex: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <div className="relative w-full h-full p-4">
                            <img
                                src={images[index]}
                                alt={`Product ${index + 1}`}
                                className="w-full h-full object-contain drop-shadow-xl"
                            />
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Thumbnail/Indicator Dots */}
            <div className="flex justify-center gap-2 mt-6 flex-wrap">
                {images.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setIndex(i)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${i === index ? 'w-8' : 'hover:scale-125'}`}
                        style={{ backgroundColor: i === index ? color : '#e5e7eb' }}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
