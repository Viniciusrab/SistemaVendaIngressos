import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { LogOut, User as UserIcon, Calendar, Ticket, Download, ShieldCheck, Shield } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CardCheckoutForm } from '../../components/CardCheckoutForm';

interface Order {
    id: string;
    type: string;
    paymentStatus: string;
    amount: number;
    createdAt: string;
    championship?: {
        name: string;
        date: string;
    };
}

interface Ticket {
    id: string;
    uuid: string;
    status: string;
    order: {
        type: string;
        championship: {
            name: string;
            date: string;
        };
    };
}

export function ClientAreaPage() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('tickets');
    const [orders, setOrders] = useState<Order[]>([]);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    
    const location = useLocation();
    const navigate = useNavigate();




    useEffect(() => {
        if (activeTab === 'competitions') {
            api.get('/orders/my-orders').then(res => setOrders(Array.isArray(res.data) ? res.data : []));
        } else if (activeTab === 'tickets') {
            api.get('/tickets/my-tickets').then(res => setTickets(Array.isArray(res.data) ? res.data : []));
        }
    }, [activeTab]);



    const handleDownloadTicket = async (ticketId: string, championshipName: string) => {
        try {
            const response = await api.get(`/tickets/${ticketId}/pdf`, { responseType: 'blob' });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `ingresso-${championshipName.replace(/\s+/g, '-').toLowerCase()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erro ao baixar ingresso:', error);
            alert('Não foi possível baixar o ingresso no momento.');
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12 px-6">
            <div className="container mx-auto max-w-6xl">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Sidebar */}
                    <div className="w-full md:w-64 flex-shrink-0">
                        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 sticky top-24">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center text-black">
                                    <UserIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold">{user?.name} <span className="text-[10px] opacity-30">({user?.role})</span></h3>
                                    <p className="text-xs text-gray-400">
                                        {(user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'SUPPORT' || user?.role?.toUpperCase() === 'TICKETER') 
                                            ? 'Membro da Equipe (Admin)' 
                                            : 'Palestrante / Ouvinte'}
                                    </p>
                                </div>
                            </div>

                            <nav className="flex flex-col gap-2">
                                <button
                                    onClick={() => setActiveTab('tickets')}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${activeTab === 'tickets' ? 'bg-blue-400 text-black shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                >
                                    <Ticket className="w-4 h-4" /> Meus Ingressos
                                </button>
                                <button
                                    onClick={() => setActiveTab('competitions')}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${activeTab === 'competitions' ? 'bg-blue-400 text-black shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                >
                                    <Calendar className="w-4 h-4" /> Meus Eventos
                                </button>

                                <button
                                    onClick={() => setActiveTab('data')}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${activeTab === 'data' ? 'bg-blue-400 text-black shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                >
                                    <UserIcon className="w-4 h-4" /> Dados Pessoais
                                </button>
                                


                                {['ADMIN', 'TICKETER', 'SUPPORT'].includes(user?.role?.toUpperCase() || '') && (
                                    <a
                                        href="/admin"
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm text-blue-400 border border-blue-400/30 hover:bg-blue-400/10 mt-2"
                                    >
                                        <ShieldCheck className="w-4 h-4" /> Ir para Admin Dashboard
                                    </a>
                                )}

                                <div className="h-px bg-white/10 my-4"></div>

                                <button
                                    onClick={logout}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors font-bold text-sm"
                                >
                                    <LogOut className="w-4 h-4" /> Sair
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {activeTab === 'tickets' && (
                            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8">
                                <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                                    <Ticket className="text-blue-400" /> Seus Ingressos
                                </h2>

                                {tickets.length === 0 ? (
                                    <p className="text-gray-400 py-10 text-center">Nenhum ingresso encontrado.</p>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                { (Array.isArray(tickets) ? tickets : []).map(t => (
                                            <div key={t.id} className="bg-zinc-800 rounded-xl overflow-hidden border border-white/5 flex flex-col md:flex-row shadow-2xl relative">
                                                {t.status === 'USED' && (
                                                    <div className="absolute inset-0 bg-black/80 z-10 flex items-center justify-center backdrop-blur-sm">
                                                        <span className="text-red-500 border border-red-500 px-6 py-2 border-2 text-2xl font-black rotate-[-15deg] uppercase tracking-widest bg-black/50">Utilizado</span>
                                                    </div>
                                                )}
                                                <div className="p-6 flex-1 flex flex-col justify-center">
                                                    <span className={`text-xs font-black uppercase tracking-widest mb-1 ${t.order.type === 'COMPETITOR' ? 'text-blue-400' : 'text-blue-500'}`}>
                                                        {t.order.type === 'COMPETITOR' ? 'Passe Palestrante' : 'Ingresso Ouvinte'}
                                                    </span>
                                                    <h4 className="text-lg font-bold mb-1 leading-tight">{t.order.championship.name}</h4>
                                                    <p className="text-xs text-gray-400 mb-4">{new Date(t.order.championship.date).toLocaleString('pt-BR')}</p>
                                                    <div className="text-[10px] text-zinc-500 mt-auto break-all font-mono">
                                                        ID: {t.uuid}
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-white flex flex-col items-center justify-center border-l-2 border-dashed border-zinc-300 relative">
                                                    <QRCodeSVG value={t.uuid} size={100} />
                                                    <button
                                                        onClick={() => handleDownloadTicket(t.id, t.order.championship.name)}
                                                        className="mt-4 flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-black transition-colors"
                                                    >
                                                        <Download className="w-3 h-3" /> Salvar PDF
                                                    </button>
                                                    {/* Pseudo cut-outs */}
                                                    <div className="absolute -top-3 -left-3 w-6 h-6 bg-zinc-800 rounded-full"></div>
                                                    <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-zinc-800 rounded-full"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'competitions' && (
                            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8">
                                <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                                    <Calendar className="text-blue-400" /> Histórico de Eventos
                                </h2>
                                { (Array.isArray(orders) ? orders : []).filter(o => o.type === 'COMPETITOR' && o.paymentStatus === 'APPROVED').length === 0 ? (
                                    <p className="text-gray-400 py-10 text-center">Nenhuma inscrição aprovada como palestrante até o momento.</p>
                                ) : (
                                    <div className="space-y-4">
                                        { (Array.isArray(orders) ? orders : []).filter(o => o.type === 'COMPETITOR' && o.paymentStatus === 'APPROVED').map(o => (
                                            <div key={o.id} className="bg-zinc-800 p-6 rounded-xl flex items-center justify-between border border-white/5">
                                                <div>
                                                    <p className="text-sm text-gray-400 mb-1">Pagamento {o.paymentStatus}</p>
                                                    <h4 className="font-bold text-lg">{o.championship?.name}</h4>
                                                    <span className="text-xs bg-black/50 px-2 py-1 rounded text-blue-400 border border-blue-400/20">{o.type === 'COMPETITOR' ? 'Palestrante' : 'Ouvinte'}</span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-black">R$ {o.amount.toFixed(2)}</p>
                                                    <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString('pt-BR')}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'data' && (
                            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8">
                                <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                                    <UserIcon className="text-blue-400" /> Dados Pessoais
                                </h2>
                                <div className="space-y-4 max-w-md">
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Nome Completo</label>
                                        <div className="bg-zinc-800 px-4 py-3 rounded-lg text-white border border-white/5">{user?.name}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">E-mail</label>
                                        <div className="bg-zinc-800 px-4 py-3 rounded-lg text-white border border-white/5">{user?.email}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">CPF</label>
                                        <div className="bg-zinc-800 px-4 py-3 rounded-lg text-white border border-white/5">{user?.cpf || 'Não informado'}</div>
                                    </div>
                                </div>
                            </div>
                        )}



                    </div>
                </div>
            </div>
        </div>
    );
}
