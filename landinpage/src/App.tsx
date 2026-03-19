import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { StandardPage } from './pages/StandardPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthPage } from './pages/Auth/AuthPage';
import { ResetPasswordPage } from './pages/Auth/ResetPasswordPage';
import { ClientAreaPage } from './pages/ClientArea/ClientAreaPage';
import { ValidatorPage } from './pages/Validator/ValidatorPage';
import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { Toaster } from 'react-hot-toast';

import TechHero from './assets/images/tech_hero.png';
import Aba1Logo from './assets/images/aba1_code.png';
import Aba2Logo from './assets/images/aba2_cloud.png';
import Aba3Logo from './assets/images/aba3_database.png';
import Evento1 from './assets/images/evento1.jpeg';



import ProfileAlex from './assets/images/profile_alex.png';
import ProfileJordan from './assets/images/profile_jordan.png';
import ProfileTaylor from './assets/images/profile_taylor.png';
import ProfileMorgan from './assets/images/profile_morgan.png';
import QrCode from './assets/images/qrcode.jpeg';

export default function App() {
    const vinidevTeam = [
        { id: 2, name: 'Alex Rivers', role: '• Cloud Architect \n• Tech Lead \n• Open Source Contributor \n• CTO & Founder of vinidev', image: ProfileAlex, duration: 8000 },
        { id: 7, name: 'Jordan Smith', role: 'Senior Security Engineer / Infrastructure Specialist', image: ProfileJordan },
        { id: 6, name: 'Taylor Reed', role: 'Full Stack Developer / Community Manager', image: ProfileTaylor },
        { id: 8, name: 'Morgan Chen', role: 'UX Designer / Product Strategist', image: ProfileMorgan },
    ];



    return (
        <>
            <Toaster
                position="bottom-right"
                toastOptions={{
                    style: { background: '#18181b', color: '#fff', border: '1px solid #27272a' },
                    success: { iconTheme: { primary: '#60a5fa', secondary: '#000' } }
                }}
            />
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Layout>
                    <Routes>
                        <Route path="/" element={<StandardPage
                            title="VINIDEV TECH"
                            subtitle="Empowering the Next Generation of Developers"
                            image={TechHero}
                            showPartnership={true}
                            events={[Evento1]}
                            mvv={{
                                mission: "To foster a collaborative environment where technology and innovation thrive, providing developers with high-level learning and networking opportunities.",
                                vision: "To be the premier developer-focused event platform in the region, known for technical excellence and community impact.",
                                values: "• Innovation: Pushing the boundaries of what is possible.\n• Collaboration: Building a stronger community together.\n• Inclusivity: Welcoming developers from all backgrounds.\n• Excellence: Delivering top-tier workshops and talks.\n• Scalability: Preparing for a future that never stops evolving."
                            }}
                            contacts={{
                                instagram: "https://www.instagram.com/vini.bzk/",
                                whatsapp: "https://wa.me/553499299543",
                                email: "vinicius.raphael1311@gmail.com"
                            }}
                            historyTitle="A Jornada da vinidev"
                            team={vinidevTeam}
                            documents={[
                                { label: "Technical Roadmap", file: "#" },
                                { label: "Speaker Guidelines", file: "#" }
                            ]}
                            qrCode={QrCode}
                            history={`A vinidev nasceu de uma visão compartilhada entre desenvolvedores que acreditavam que os eventos de tecnologia precisavam de mais substância e conexão real. Lorem ipsum dolor sit amet, consectetur adipiscing elit.

O que começou como um pequeno workshop local se transformou em uma plataforma dedicada à evolução contínua. Nosso compromisso é com a qualidade técnica e o crescimento da comunidade dev.

Hoje, focamos em trazer o melhor do ecossistema de software para o palco, garantindo que cada Ouvinte saia mais preparado para os desafios do futuro digital.`}
                            color="#00BFFF"
                            secondaryColor="#000000"
                            variant="vinidev"
                        />} />

                        {/* New Core Routes */}
                        <Route path="/auth" element={<AuthPage />} />
                        <Route path="/login" element={<AuthPage />} />
                        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                        <Route path="/minha-conta" element={<ProtectedRoute><ClientAreaPage /></ProtectedRoute>} />
                        <Route path="/validar-ticket" element={<ProtectedRoute adminOnly><ValidatorPage /></ProtectedRoute>} />
                        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />

                        {/* Companies Left */}
                        <Route path="/aba-1" element={<StandardPage title="Desenvolvedores" subtitle="Networking & Coding" image={Aba1Logo} color="#00BFFF" />} />
                        <Route path="/aba-2" element={<StandardPage title="Infraestrutura" subtitle="Cloud & Servers" image={Aba2Logo} color="#00BFFF" />} />
                        <Route path="/aba-3" element={<StandardPage title="Inteligência Artificial" subtitle="Data & AI" image={Aba3Logo} color="#00BFFF" />} />
                    </Routes>
                </Layout>
            </Router>
        </>
    );
}
