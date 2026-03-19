import React from 'react';
import { Header } from './Header';

interface LayoutProps {
    children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen bg-zinc-950 text-gray-100 flex flex-col font-sans selection:bg-blue-500/30">
            <Header />
            <main className="flex-grow relative overflow-hidden pt-20 md:pt-0">
                {/* Ambient Background Glow */}
                <div className="fixed inset-0 z-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
