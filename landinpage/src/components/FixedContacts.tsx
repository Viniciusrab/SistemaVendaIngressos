import { Instagram, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FixedContactsProps {
    contacts?: {
        instagram?: string;
        whatsapp?: string;
    };
    color: string;
    secondaryColor?: string;
}

// @ts-ignore
export function FixedContacts({ contacts, color, secondaryColor }: FixedContactsProps) {
    if (!contacts) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[9990] flex flex-col gap-4">
            <AnimatePresence>
                {contacts.instagram && (
                    <motion.a
                        key="instagram"
                        href={contacts.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ delay: 0.1 }}
                        className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden"
                    >
                        <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: '#E1306C' }} />
                        <Instagram className="w-7 h-7 relative z-10" style={{ color: '#E1306C' }} />

                        {/* Tooltip */}
                        <span className="absolute right-full mr-3 bg-white px-3 py-1 rounded-lg text-sm font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-gray-700">
                            Instagram
                        </span>
                    </motion.a>
                )}

                {contacts.whatsapp && (
                    <motion.a
                        key="whatsapp"
                        href={contacts.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ delay: 0.2 }}
                        className="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative group"
                    >
                        <MessageCircle className="w-7 h-7 text-white" />

                        {/* Tooltip */}
                        <span className="absolute right-full mr-3 bg-white px-3 py-1 rounded-lg text-sm font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-gray-700">
                            WhatsApp
                        </span>
                    </motion.a>
                )}
            </AnimatePresence>
        </div>
    );
}
