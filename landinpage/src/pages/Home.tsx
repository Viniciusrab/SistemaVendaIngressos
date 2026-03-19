import { motion } from 'framer-motion';
import CapaBanner from '../assets/images/capa.jpeg';
import { Mail, MessageSquare } from 'lucide-react';


export function Home() {
    return (
        <div className="space-y-20 pb-20">
            {/* Hero Section */}
            <section className="relative aspect-[16/10] md:aspect-auto md:min-h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src={CapaBanner}
                        alt="Arena Background"
                        className="w-full h-full object-cover md:object-contain object-top pt-0 md:pt-20 bg-black"
                    />
                </div>

                <div className="relative z-10 text-center px-4 w-full pt-8 md:pt-20">
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, type: "spring" }}
                        className="text-[12vw] leading-none font-black mb-6 text-white tracking-tighter drop-shadow-2xl uppercase"
                        style={{ textShadow: '0 0 40px rgba(0,0,0,0.5)' }}
                    >
                        vinidev
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl md:text-2xl text-gray-300 mb-10 font-light"
                    >
                        Onde inovação converge e o futuro é codificado. O palco definitivo para a excelência técnica.
                    </motion.p>

                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="px-8 py-4 bg-white text-black font-bold rounded-full text-lg hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                    >
                        Entrar no Evento
                    </motion.button>
                </div>
            </section>

            {/* Explanation Section */}
            <section className="container mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="space-y-6"
                    >
                        <h2 className="text-4xl font-bold bg-gradient-to-l from-blue-400 to-cyan-300 bg-clip-text text-transparent">O Que É O Projeto?</h2>
                        <p className="text-gray-400 leading-relaxed text-lg">
                            O "vinidev" não é apenas uma competição; é um ecossistema de elite onde os maiores talentos se enfrentam em desafios de alto nível. Projetado para testar limites, inovar estratégias e coroar a verdadeira excelência.
                        </p>
                        <p className="text-gray-400 leading-relaxed text-lg">
                            Nossa plataforma unifica dados em tempo real, inteligência competitiva e uma comunidade vibrante para criar experiências inesquecíveis.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 to-purple-900/40 z-10" />
                        <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop" alt="Strategy" className="w-full h-full object-cover" />
                    </motion.div>
                </div>
            </section>

            {/* Partnership Section */}
            <section className="container mx-auto px-6 py-12">
                <div className="bg-gradient-to-br from-zinc-900 to-black p-8 md:p-12 rounded-3xl border border-white/10 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 blur-[80px] rounded-full pointer-events-none" />
                    <div className="relative z-10 max-w-4xl">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
                            Empresas interessadas em patrocínio ou representantes estaduais que queiram trazer o vinidev para sua região podem nos contactar através dos canais abaixo.
                        </h2>

                        <div className="flex flex-col md:flex-row gap-4 mt-8">
                            <a
                                href="https://wa.me/5500000000000"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-blue-400 hover:text-white transition-all group"
                            >
                                <MessageSquare className="w-5 h-5" />
                                <span>Parceria Comercial</span>
                            </a>
                            <a
                                href="https://wa.me/5500000000000"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-3 bg-zinc-800 text-white px-8 py-4 rounded-xl font-bold border border-white/10 hover:border-blue-400/50 transition-all group"
                            >
                                <Mail className="w-5 h-5" />
                                <span>Levar vinidev para Meu Estado ou Região</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="container mx-auto px-6 py-20 bg-white/5 rounded-3xl border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10 text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-4xl font-bold mb-6">Como Funciona</h2>
                    <p className="text-gray-400">Um processo transparente e desafiador dividido em três etapas cruciais.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 relative z-10">
                    {[
                        { step: '01', title: 'Inscrição & Seleção', desc: 'Os candidatos submetem seus perfis e passam por uma triagem rigorosa baseada em métricas de performance.' },
                        { step: '02', title: 'O Confronto', desc: 'Séries de desafios práticos e teóricos onde cada decisão conta e a adaptabilidade é chave.' },
                        { step: '03', title: 'A Glória', desc: 'Os vencedores recebem reconhecimento global, prêmios exclusivos e um lugar no Hall da Fama.' }
                    ].map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.2 }}
                            className="p-8 rounded-2xl bg-black/40 border border-white/10 hover:border-blue-500/50 transition-colors group"
                        >
                            <span className="text-5xl font-black text-white/5 group-hover:text-blue-500/20 transition-colors mb-4 block">{item.step}</span>
                            <h3 className="text-xl font-bold mb-4 text-white group-hover:text-blue-400 transition-colors">{item.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
}
