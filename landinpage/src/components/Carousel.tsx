import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const defaultCollaborators = [
    { id: 1, name: 'Colaborador 1', role: 'Diretor', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' },
    { id: 2, name: 'Colaborador 2', role: 'Gerente', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop' },
    { id: 3, name: 'Colaborador 3', role: 'Coordenador', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop' },
    { id: 4, name: 'Colaborador 4', role: 'Analista', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop' },
    { id: 5, name: 'Colaborador 5', role: 'Supervisor', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop' },
];

export interface Collaborator {
    id: number | string;
    name: string;
    role: string;
    image: string;
    scale?: number;
    duration?: number;
}

interface CarouselProps {
    color: string;
    collaborators?: Collaborator[];
}

export function Carousel({ color, collaborators = defaultCollaborators }: CarouselProps) {
    const [index, setIndex] = useState(0);

    const next = () => setIndex((prev) => (prev + 1) % collaborators.length);
    const prev = () => setIndex((prev) => (prev - 1 + collaborators.length) % collaborators.length);

    useEffect(() => {
        const currentDuration = collaborators[index].duration || 3000;
        const timeout = setTimeout(() => {
            next();
        }, currentDuration);
        return () => clearTimeout(timeout);
    }, [index, collaborators]);

    return (
        <div className="relative w-full max-w-5xl mx-auto px-12">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold uppercase tracking-widest text-gray-500">Nossos Colaboradores</h3>
                <div className="flex gap-2">
                    <button onClick={prev} className="p-2 rounded-full border hover:bg-gray-100 transition-colors" style={{ borderColor: color, color }}>
                        ←
                    </button>
                    <button onClick={next} className="p-2 rounded-full border hover:bg-gray-100 transition-colors" style={{ borderColor: color, color }}>
                        →
                    </button>
                </div>
            </div>

            <div className="flex justify-center overflow-hidden">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={collaborators[index].id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.4 }}
                        className="w-full max-w-md bg-black p-8 rounded-3xl border border-white/10 text-center shadow-2xl"
                    >
                        <div className="flex flex-col items-center gap-6">
                            <div className="relative">
                                {/* Theme colored glow */}
                                <div
                                    className="absolute inset-0 blur-3xl rounded-full opacity-10"
                                    style={{ backgroundColor: color }}
                                />
                                <div className="w-32 h-32 rounded-full overflow-hidden border-2 relative z-10 transition-transform duration-500 hover:scale-105 bg-zinc-800"
                                    style={{ borderColor: color }}>
                                    <img
                                        src={collaborators[index].image}
                                        alt={collaborators[index].name}
                                        className="w-full h-full object-cover"
                                        style={{ transform: `scale(${collaborators[index].scale || 1})` }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-2xl font-black uppercase tracking-tight text-white">
                                    {collaborators[index].name.split(/(\*\*.*?\*\*)/g).map((part, i) =>
                                        part.startsWith('**') && part.endsWith('**')
                                            ? <span key={i} style={{ color: color }}>{part.slice(2, -2)}</span>
                                            : part
                                    )}
                                </h4>
                                <p className="text-sm text-white/90 leading-relaxed whitespace-pre-line text-left border-t border-white/10 pt-4 inline-block">
                                    {collaborators[index].role}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
