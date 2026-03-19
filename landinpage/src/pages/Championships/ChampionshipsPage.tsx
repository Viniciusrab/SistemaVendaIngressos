import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Calendar, MapPin, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function ChampionshipsPage() {
    const [championships, setChampionships] = useState<any[]>([]);
    const [selectedChamp, setSelectedChamp] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        api.get('/championships').then(res => {
            setChampionships(res.data);
        }).finally(() => setLoading(false));
    }, []);

    const isFederated = user?.federationYear === new Date().getFullYear();

    const handleAction = (c: any, type: 'COMPETITOR' | 'VISITOR') => {
        if (!user) {
            navigate('/auth', { state: { returnTo: '/campeonatos', champId: c.id, action: type } });
            return;
        }

        if (type === 'COMPETITOR' && !isFederated) {
            alert("Você precisa pagar a taxa de filiação da federação para poder competir.");
            navigate('/minha-conta', { state: { requiredFederation: true, targetChampId: c.id } });
            return;
        }
        // Simple direct payment simulation for now wrapper... In a real scenario, this opens a checkout gateway.
        const confirmMessage = `Confirmar compra de ingresso como ${type === 'COMPETITOR' ? 'Competidor' : 'Ouvinte'} por R$ ${type === 'COMPETITOR' ? c.priceComp : c.priceVis}?`;
        if (window.confirm(confirmMessage)) {
            api.post('/orders', { championshipId: c.id, type }).then(() => {
                alert('Compra aprovada com sucesso! Seu ticket está disponível na Minha Conta.');
                navigate('/minha-conta');
            }).catch(() => {
                alert('Erro ao processar compra.');
            });
        }
    };

    if (loading) return <div className="text-blue-400 text-center py-20">Carregando Campeonatos...</div>;

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12 px-6">
            <div className="container mx-auto">
                <h1 className="text-4xl md:text-5xl font-black text-blue-400 mb-2 uppercase tracking-tight text-center">Campeonatos de Fisiculturismo</h1>
                <p className="text-gray-400 text-center mb-12">Inscreva-se ou compre seu ingresso para os próximos eventos do vinidev.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {championships.map(c => (
                        <div key={c.id} className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden hover:border-blue-400/50 transition-all cursor-pointer group" onClick={() => setSelectedChamp(c)}>
                            <div className="h-48 bg-zinc-800 relative">
                                {c.banner ? (
                                    <img 
                                        src={c.banner.startsWith('/') ? `${api.defaults.baseURL?.replace('/api', '')}${c.banner}` : c.banner} 
                                        alt={c.name} 
                                        className="w-full h-full object-cover" 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-600">Sem Banner</div>
                                )}
                                <div className="absolute top-4 right-4 bg-blue-400 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                    {c.status === 'OPEN' ? 'ABERTO' : 'ENCERRADO'}
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-3">{c.name}</h3>
                                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                                    <Calendar className="w-4 h-4 text-blue-400" />
                                    <span>{new Date(c.date).toLocaleDateString('pt-BR')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400 text-sm mb-6">
                                    <MapPin className="w-4 h-4 text-blue-400" />
                                    <span>{c.location}</span>
                                </div>
                                <button className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-blue-400 hover:text-black rounded-lg transition-colors font-bold uppercase text-sm group-hover:bg-blue-400 group-hover:text-black">
                                    Ver Detalhes
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {championships.length === 0 && (
                        <div className="col-span-full text-center text-gray-500 py-20">Nenhum campeonato cadastrado no momento.</div>
                    )}
                </div>
            </div>

            {selectedChamp && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-blue-400/30 w-full max-w-2xl rounded-2xl overflow-hidden relative shadow-2xl">
                        <button onClick={() => setSelectedChamp(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-black/50 p-2 rounded-full z-10">
                            <X className="w-5 h-5" />
                        </button>
                        <div className="h-48 md:h-64 bg-zinc-800">
                            {selectedChamp.banner && (
                                <img 
                                    src={selectedChamp.banner.startsWith('/') ? `${api.defaults.baseURL?.replace('/api', '')}${selectedChamp.banner}` : selectedChamp.banner} 
                                    alt={selectedChamp.name} 
                                    className="w-full h-full object-cover" 
                                />
                            )}
                        </div>
                        <div className="p-8">
                            <h2 className="text-3xl font-black mb-2">{selectedChamp.name}</h2>
                            <div className="flex flex-wrap gap-4 mb-6">
                                <span className="flex items-center gap-2 text-blue-400 font-medium">
                                    <Calendar className="w-5 h-5" /> {new Date(selectedChamp.date).toLocaleString('pt-BR')}
                                </span>
                                <span className="flex items-center gap-2 text-gray-300">
                                    <MapPin className="w-5 h-5" /> {selectedChamp.location}
                                </span>
                            </div>
                            <p className="text-gray-400 mb-8 leading-relaxed whitespace-pre-wrap">{selectedChamp.description || 'Descrição não disponível.'}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    disabled={selectedChamp.status !== 'OPEN'}
                                    onClick={() => handleAction(selectedChamp, 'COMPETITOR')}
                                    className="bg-blue-400 hover:bg-blue-300 text-black py-4 rounded-xl font-black uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center"
                                >
                                    <span>Competir</span>
                                    <span className="text-xs opacity-75 mt-1">R$ {selectedChamp.priceComp?.toFixed(2)}</span>
                                </button>
                                <button
                                    disabled={selectedChamp.status !== 'OPEN'}
                                    onClick={() => handleAction(selectedChamp, 'VISITOR')}
                                    className="border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black py-4 rounded-xl font-black uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center"
                                >
                                    <span>Comprar Ingresso</span>
                                    <span className="text-xs opacity-75 mt-1">R$ {selectedChamp.priceVis?.toFixed(2)}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
