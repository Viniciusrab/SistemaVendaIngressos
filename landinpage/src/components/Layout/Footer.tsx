import { Link, useLocation } from 'react-router-dom';
import { Instagram, Phone } from 'lucide-react';

export function Footer() {
    const location = useLocation();

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // Contacts Map defined inside component for simplicity
    const contactsMap: Record<string, { instagram?: string; whatsapp: string }> = {
        '/': {
            instagram: 'https://www.instagram.com/vini.bzk/',
            whatsapp: 'https://wa.me/553499299543'
        },
        '/aba-1': {
            instagram: 'https://www.instagram.com/vini.bzk/',
            whatsapp: 'https://wa.me/553499299543'
        },
        '/aba-2': {
            instagram: 'https://www.instagram.com/vini.bzk/',
            whatsapp: 'https://wa.me/553499299543'
        },
        '/aba-3': {
            instagram: 'https://www.instagram.com/vini.bzk/',
            whatsapp: 'https://wa.me/553499299543'
        }
    };

    // Fallback to home contacts if path not found (e.g., 404 or unknown)
    const currentContacts = contactsMap[location.pathname] || contactsMap['/'];

    return (
        <footer className="bg-zinc-950 text-gray-400 py-16 border-t border-white/10 font-sans">
            <div className="container mx-auto px-6 grid md:grid-cols-4 gap-12">
                {/* About */}
                <div className="space-y-6">
                    <h4 className="text-white text-lg font-bold uppercase tracking-wider">vinidev</h4>
                    <p className="text-sm leading-relaxed">
                        A plataforma definitiva para eventos e workshops de tecnologia.
                        Conectando desenvolvedores e impulsionando a inovação.
                    </p>
                    <p className="text-xs text-blue-400 font-medium">vinicius.raphael1311@gmail.com</p>
                </div>

                {/* Links */}
                <div className="space-y-6">
                    <h4 className="text-white text-lg font-bold uppercase tracking-wider">Navegação</h4>
                    <ul className="space-y-4 text-sm">
                        <li><Link to="/" onClick={scrollToTop} className="hover:text-blue-400 transition-colors">Home</Link></li>
                        <li><Link to="/aba-1" onClick={scrollToTop} className="hover:text-blue-400 transition-colors">Aba 1</Link></li>
                        <li><Link to="/aba-2" onClick={scrollToTop} className="hover:text-blue-400 transition-colors">Aba 2</Link></li>
                        <li><Link to="/aba-3" onClick={scrollToTop} className="hover:text-blue-400 transition-colors">Aba 3</Link></li>
                    </ul>
                </div>

                {/* Contact - Dynamic */}
                <div className="space-y-6">
                     <h4 className="text-xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-cyan-200 bg-clip-text text-transparent">Contato</h4>
                    <ul className="space-y-4 text-gray-400">
                        <li className="flex items-center gap-3 hover:text-white transition-colors group">
                            <a
                                href={currentContacts.whatsapp}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 w-full"
                            >
                                <span className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                    <Phone className="w-5 h-5 text-blue-500" />
                                </span>
                                <span>WhatsApp</span>
                            </a>
                        </li>
                        <li className="flex items-center gap-3 hover:text-white transition-colors group">
                            <a
                                href={currentContacts.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 w-full"
                            >
                                <span className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                    <Instagram className="w-5 h-5 text-blue-500" />
                                </span>
                                <span>Instagram</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="container mx-auto px-6 pt-8 mt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-sm opacity-60">
                <p>&copy; 2024 vinidev. Todos os direitos reservados.</p>
                <div className="flex gap-6 mt-4 md:mt-0">
                    <a href="#" className="hover:text-blue-400 transition-colors">Termos</a>
                    <a href="#" className="hover:text-blue-400 transition-colors">Privacidade</a>
                </div>
            </div>
        </footer>
    );
}
