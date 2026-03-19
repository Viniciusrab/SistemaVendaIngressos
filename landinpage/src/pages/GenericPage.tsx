import { motion } from 'framer-motion';

interface GenericPageProps {
    title: string;
    subtitle: string;
}

export function GenericPage({ title, subtitle }: GenericPageProps) {
    return (
        <div className="space-y-16 pb-20">
            {/* Header Section */}
            <section className="relative h-[40vh] flex items-center justify-center bg-black/50 overflow-hidden border-b border-white/10">
                <div className="text-center relative z-10 px-4">
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent"
                    >
                        {title}
                    </motion.h1>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100px' }}
                        className="h-1 bg-blue-500 mx-auto rounded-full mb-6"
                    />
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">{subtitle}</p>
                </div>
            </section>

            {/* Content Section */}
            <section className="container mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <h3 className="text-2xl font-semibold text-blue-400">Detalhes da Seção</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Nesta seção de {title}, exploramos os aspectos fundamentais que compõem a excelência.
                            Aqui detalhamos tudo o que você precisa saber para se aprofundar no universo de vinidev.
                        </p>
                        <ul className="space-y-4 text-gray-400">
                            <li className="flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                Informações exclusivas e detalhadas.
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-purple-500" />
                                Análises profundas de performance.
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-pink-500" />
                                Histórico completo e atualizado.
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                        <h3 className="text-xl font-semibold mb-6">Destaques</h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-black/20 hover:bg-white/5 transition-colors cursor-pointer">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center font-bold text-gray-500">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-200">Tópico Relevante {i + 1}</h4>
                                        <p className="text-xs text-gray-500">Clique para saber mais</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
