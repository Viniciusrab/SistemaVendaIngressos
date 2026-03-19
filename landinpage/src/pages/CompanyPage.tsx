import { motion } from 'framer-motion';

interface CompanyPageProps {
    name: string;
    description: string;
}

export function CompanyPage({ name, description }: CompanyPageProps) {
    return (
        <div className="min-h-screen bg-white text-gray-800 font-sans selection:bg-[#D4AF37]/30">
            {/* Hero Section */}
            <section className="relative h-[50vh] flex items-center justify-center overflow-hidden bg-zinc-900">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507679799987-a73775492de5?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/10" />

                <div className="relative z-10 text-center px-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-bold mb-4 text-[#D4AF37] drop-shadow-sm tracking-tight"
                    >
                        {name}
                    </motion.h1>
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.3 }}
                        className="h-1 w-32 bg-[#D4AF37] mx-auto rounded-full"
                    />
                </div>
            </section>

            {/* About Section */}
            <section className="py-20 container mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <h2 className="text-3xl font-bold text-[#D4AF37]">Sobre a Empresa</h2>
                    <p className="text-xl text-gray-600 leading-relaxed font-light">
                        {description} Somos uma referência no setor, comprometidos com a excelência e a inovação contínua.
                        Nossa trajetória é marcada por conquistas sólidas e parcerias duradouras que transformam o mercado.
                    </p>
                </div>
            </section>

            {/* Mission, Vision, Values */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            { title: 'Missão', icon: 'M', text: 'Entregar valor excepcional e superar expectativas através de soluções inovadoras.' },
                            { title: 'Visão', icon: 'V', text: 'Ser a líder global reconhecida pela integridade, qualidade e impacto positivo.' },
                            { title: 'Valores', icon: 'E', text: 'Ética, Transparência, Excelência e Foco no Cliente são os pilares que nos sustentam.' }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.2 }}
                                viewport={{ once: true }}
                                className="bg-white p-10 rounded-xl shadow-lg border border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all duration-300 group text-center"
                            >
                                <div className="w-16 h-16 mx-auto bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-[#D4AF37] transition-colors duration-300">
                                    <span className="text-2xl font-bold text-[#D4AF37] group-hover:text-white transition-colors duration-300">{item.icon}</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-4">{item.title}</h3>
                                <p className="text-gray-500 leading-relaxed">{item.text}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer Call to Action */}
            <section className="py-20 bg-[#D4AF37] text-white text-center">
                <h2 className="text-3xl font-bold mb-6">Pronto para fazer parte dessa história?</h2>
                <button className="px-8 py-3 bg-white text-[#D4AF37] font-bold rounded-full hover:bg-gray-100 transition-colors shadow-lg">
                    Entre em Contato
                </button>
            </section>
        </div>
    );
}
