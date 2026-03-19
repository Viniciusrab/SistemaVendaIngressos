import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Carousel, Collaborator } from '../components/Carousel';
import { Footer } from '../components/Layout/Footer';
import { PreFooter } from '../components/PreFooter';
import { Mail, MessageSquare } from 'lucide-react';

import { ImageCarousel } from '../components/ImageCarousel';
import { FixedContacts } from '../components/FixedContacts';
import { ChampionshipsSection } from '../components/ChampionshipsSection';

interface MVV {
    mission: string;
    vision: string;
    values: string;
}

interface Contacts {
    instagram?: string;
    whatsapp?: string;
}

interface Document {
    label: string;
    file: string;
}

interface StandardPageProps {
    title: string;
    subtitle: string;
    image: string;
    video?: string;
    events?: string[];
    products?: string[];
    mvv?: MVV;
    contacts?: Contacts;
    color: string;
    secondaryColor?: string;
    history?: string;
    secondaryVideo?: string;
    historyTitle?: string;
    team?: Collaborator[];
    documents?: Document[];
    qrCode?: string;
    variant?: 'default' | 'vinidev';
    showPartnership?: boolean;
}

export function StandardPage({ title, subtitle, image, video, products, mvv, contacts, color, secondaryColor, history, secondaryVideo, historyTitle, team, documents, qrCode, variant = 'default', showPartnership = false }: StandardPageProps) {
    const location = useLocation();

    const renderHero = () => (
        <section className="aspect-[16/10] md:aspect-auto md:h-screen bg-zinc-900 relative flex items-center p-6 md:p-20 pt-32 md:pt-28 overflow-hidden">
            <div className="hidden md:block md:w-1/2 z-20 space-y-8 relative">
                <motion.h1
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 drop-shadow-xl"
                >
                    {title}
                </motion.h1>
                <div className="relative">
                    <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-widest mb-4 flex items-center gap-4" style={{ color }}>
                        <span className="w-16 h-2 rounded-full" style={{ background: `linear-gradient(to right, ${color}, ${secondaryColor || color})` }} />
                        O Que É
                    </h2>
                    <p className="text-gray-300 text-lg md:text-xl max-w-lg leading-relaxed font-light">
                        {subtitle}
                    </p>
                </div>
            </div>

            {/* Hero Image - Optimized to avoid clipping */}
            <div className="absolute top-0 left-0 right-0 bottom-8 z-10 overflow-hidden">
                {video ? (
                    <video
                        src={video}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover object-center transform scale-105"
                        style={{ objectPosition: 'center 20%' }}
                    />
                ) : (
                    <img
                        src={image}
                        className="w-full h-full object-contain object-center md:object-contain md:object-top md:pt-20 bg-zinc-950"
                        alt={title}
                    />
                )}
            </div>

            {/* Brand Strip - Separated with gap */}
            <div className="absolute bottom-4 left-6 right-6 h-1 z-20 rounded-full" style={{ background: `linear-gradient(to right, ${color}, ${secondaryColor || color})` }} />
        </section>
    );

    const renderMVV = () => (
        <section className="bg-white py-24 relative z-10 -mt-10 rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Fundamentos</h3>
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900">Missão, Visão e Valores</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto">
                    <div className="group p-8 border border-gray-100 rounded-3xl hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 hover:-translate-y-2 bg-white relative overflow-hidden">
                        {/* Accents */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500" style={{ backgroundColor: color }} />
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-[100px] -mr-8 -mt-8 transition-colors group-hover:bg-opacity-50" style={{ backgroundColor: `${secondaryColor || color}10` }} />

                        <div className="w-16 h-16 mb-8 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg transform group-hover:rotate-12 transition-transform duration-500" style={{ backgroundColor: color }}>M</div>
                        <h4 className="text-xl font-bold mb-4 text-gray-900">Missão</h4>
                        <p className="text-gray-500 leading-relaxed group-hover:text-gray-700 transition-colors whitespace-pre-line">
                            {mvv?.mission || "Transformar o cenário competitivo através da excelência, inspirando Palestrantes a superarem seus próprios limites."}
                        </p>
                    </div>

                    <div className="group p-8 border border-gray-100 rounded-3xl hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 hover:-translate-y-2 bg-white relative overflow-hidden">
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500" style={{ backgroundColor: secondaryColor || color }} />

                        <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-[100px] -mr-8 -mt-8 transition-colors opacity-10" style={{ backgroundColor: color }} />

                        <div className="w-16 h-16 mb-8 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg transform group-hover:rotate-12 transition-transform duration-500" style={{ backgroundColor: secondaryColor || color }}>V</div>
                        <h4 className="text-xl font-bold mb-4 text-gray-900">Visão</h4>
                        <p className="text-gray-500 leading-relaxed group-hover:text-gray-700 transition-colors whitespace-pre-line">
                            {mvv?.vision || "Ser a referência inquestionável em inovação, organização e impacto positivo no esporte."}
                        </p>
                    </div>

                    <div className="group p-8 border border-gray-100 rounded-3xl hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 hover:-translate-y-2 bg-white relative overflow-hidden">
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500" style={{ backgroundColor: color }} />

                        <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-[100px] -mr-8 -mt-8 transition-colors opacity-10" style={{ backgroundColor: secondaryColor || color }} />

                        <div className="w-16 h-16 mb-8 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg transform group-hover:rotate-12 transition-transform duration-500" style={{ backgroundColor: color }}>E</div>
                        <h4 className="text-xl font-bold mb-4 text-gray-900">Valores</h4>
                        <p className="text-gray-500 leading-relaxed group-hover:text-gray-700 transition-colors whitespace-pre-line">
                            {mvv?.values || "Integridade inegociável, paixão ardente pelo esporte e compromisso total com resultados reais."}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );

    const renderHistory = () => history && (
        <section className="py-24 relative z-10 overflow-hidden bg-gray-50/50">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-5 -mr-40 -mt-20 pointer-events-none" style={{ backgroundColor: color }} />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-5 -ml-40 -mb-20 pointer-events-none" style={{ backgroundColor: secondaryColor || color }} />

            <div className="container mx-auto px-6 relative">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">Nossa Trajetória</h3>
                        <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6">{historyTitle || "Como Tudo Começou"}</h2>
                        <div className="flex justify-center gap-2">
                            <div className="w-12 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                            <div className="w-4 h-1.5 rounded-full" style={{ backgroundColor: secondaryColor || color }} />
                        </div>
                    </div>

                    <div className="bg-white p-8 md:p-14 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 relative">
                        {/* Decorative Quote Icon */}
                        <div className="absolute -top-10 -left-6 text-9xl leading-none opacity-10 font-serif select-none pointer-events-none" style={{ color: color }}>
                            &ldquo;
                        </div>

                        <div className="prose prose-lg text-gray-600 leading-relaxed whitespace-pre-line text-justify relative z-10 font-light">
                            <span className="float-left text-7xl font-black mr-4 mt-[-10px] leading-[0.8]" style={{ color }}>
                                {history.charAt(0)}
                            </span>
                            {history.slice(1)}
                        </div>

                        {/* Bottom Accent */}
                        <div className="absolute bottom-0 right-0 w-40 h-40 opacity-5 rounded-tl-[100px] pointer-events-none" style={{ backgroundColor: secondaryColor || color }} />
                    </div>
                </div>
            </div>
        </section>
    );

    const renderVideo = () => secondaryVideo && (
        <section className="py-24 bg-zinc-900 relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative aspect-video max-w-5xl mx-auto">
                    <video
                        src={secondaryVideo}
                        controls
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        </section>
    );


    const renderProducts = () => products && products.length > 0 && (
        <section className="py-24 bg-white relative z-10 border-t border-gray-100">
            <ImageCarousel images={products} color={color} />
        </section>
    );

    const renderTeam = () => team && team.length > 0 && (
        <section className="py-24 bg-gray-50 border-t border-gray-100 relative">
            <div className="container mx-auto px-6 relative z-10">
                <Carousel color={color} collaborators={team} />
            </div>
        </section>
    );

    const renderDocuments = () => documents && documents.length > 0 && (
        <section className="py-24 bg-white relative z-10 border-t border-gray-100">
            <div className="container mx-auto px-6 relative">
                <div className="text-center mb-16">
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Oficial</h3>
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900">Nomeações</h2>
                </div>

                <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
                    {documents.map((doc, idx) => (
                        <motion.a
                            key={idx}
                            href={doc.file}
                            download
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-center gap-4 bg-zinc-900 hover:bg-black p-6 rounded-2xl border border-white/10 group transition-all duration-300 min-w-[280px]"
                        >
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform shadow-lg"
                                style={{ backgroundColor: color }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Download PDF</span>
                                <span className="text-lg font-bold text-white group-hover:opacity-80 transition-opacity" style={{ color: color }}>{doc.label}</span>
                            </div>
                        </motion.a>
                    ))}
                </div>
            </div>
        </section>
    );


    const renderQrCode = () => qrCode && (
        <section className="py-24 bg-white relative z-10 border-t border-gray-100">
            <div className="container mx-auto px-6 text-center">
                <div className="mb-12">
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Conecte-se</h3>
                            <h2 className="text-3xl md:text-5xl font-black text-gray-900">Fale com a Equipe Tech</h2>
                </div>
                <div className="max-w-xs mx-auto p-4 bg-white rounded-[2rem] shadow-2xl border border-gray-100 group transition-transform hover:scale-105 duration-500">
                    <img src={qrCode} alt="QR Code" className="w-full h-auto rounded-2xl" />
                </div>
                <p className="mt-8 text-gray-500 font-medium">Escaneie o código para acessar o WhatsApp oficial</p>
            </div>
        </section>
    );

    const renderPartnership = () => showPartnership && (
        <section className="container mx-auto px-6 py-12 relative z-10">
            <div className="bg-gradient-to-br from-zinc-900 to-black p-8 md:p-12 rounded-3xl border border-white/10 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 blur-[80px] rounded-full pointer-events-none" />
                <div className="relative z-10 max-w-4xl text-left">
                            <h2 className="text-xl md:text-3xl font-bold text-white mb-6 leading-tight">
                                Empresas interessadas em parcerias tecnológicas ou representantes que queiram participar de nossos workshops podem nos contactar através dos canais abaixo.
                            </h2>

                    <div className="flex flex-col md:flex-row gap-4 mt-8">
                        <a
                            href="https://wa.me/5500000000000"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-blue-400 hover:text-white transition-all group"
                        >
                            <MessageSquare className="w-5 h-5 transition-transform group-hover:scale-110" />
                            <span>Parceria Comercial</span>
                        </a>
                        <a
                            href="https://wa.me/5500000000000"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-3 bg-zinc-800 text-white px-8 py-4 rounded-xl font-bold border border-white/10 hover:border-blue-400/50 transition-all group"
                        >
                            <Mail className="w-5 h-5 transition-transform group-hover:scale-110" />
                            <span>Levar vinidev para Meu Estado ou Região</span>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );

    const renderHeroTextMobile = () => (
        <section className="md:hidden px-6 py-12 bg-black border-b border-white/5">
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-black uppercase tracking-tighter text-white mb-6"
            >
                {title}
            </motion.h1>
            <div className="space-y-4">
                <h2 className="text-xl font-bold uppercase tracking-widest flex items-center gap-3" style={{ color }}>
                    <span className="w-12 h-1 rounded-full" style={{ backgroundColor: color }} />
                    O Que É
                </h2>
                <p className="text-gray-400 text-lg leading-relaxed font-light">
                    {subtitle}
                </p>
            </div>
        </section>
    );

    return (
        <div className="min-h-screen text-gray-100 font-sans flex flex-col">
            {renderHero()}
            {renderHeroTextMobile()}

            {variant === 'vinidev' ? (
                <>
                    <ChampionshipsSection />
                    {renderTeam()}
                    {renderDocuments()}
                    {renderVideo()}
                    {renderPartnership()}
                    {renderHistory()}
                    {renderMVV()}
                    {/* Keeping Products at the end */}
                    {renderProducts()}
                    {renderQrCode()}
                </>
            ) : (
                <>
                    {renderMVV()}
                    {renderHistory()}
                    {renderVideo()}
                    {renderProducts()}
                    {renderTeam()}
                </>
            )}


            {/* Contacts Section */}
            {/* Fixed Contacts */}
            <FixedContacts contacts={contacts} color={color} secondaryColor={secondaryColor} />

            <div className="mt-auto relative">
                <div className="absolute top-0 left-0 right-0 h-1 z-20" style={{ background: `linear-gradient(to right, ${color}, ${secondaryColor || color})` }} />
                {location.pathname === '/clothing-bodybuilding' && <PreFooter />}
                <Footer />
            </div>

        </div >
    );
}
