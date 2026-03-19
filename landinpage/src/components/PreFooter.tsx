

export function PreFooter() {
    return (
        <section className="relative py-24 px-6 overflow-hidden bg-zinc-900 border-t border-white/5">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[120px] -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -ml-32 -mb-32" />
            </div>

            <div className="container mx-auto relative z-10 text-center">
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight uppercase">
                    Eleve seu <span className="text-blue-400">Nível</span>
                </h2>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
                    Adquira os produtos oficiais e vista a armadura dos campeões.
                    Qualidade superior para quem não aceita menos que o topo.
                </p>

                <a
                    href="https://clothingbodybuilding.com.br"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-white text-black px-10 py-5 rounded-full font-bold text-lg uppercase tracking-wider hover:bg-blue-400 hover:text-white transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(212,175,55,0.4)] transform hover:-translate-y-1"
                >
                    <span>Acessar Loja Oficial</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </a>
            </div>
        </section>
    );
}
