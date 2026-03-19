import { useState, useEffect } from 'react';
import { initMercadoPago } from '@mercadopago/sdk-react';
import { Calendar, ChevronRight, MapPin, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { CardCheckoutForm } from './CardCheckoutForm';
import { createPortal } from 'react-dom';

initMercadoPago(import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || '');

interface Champ {
    id: string;
    name: string;
    description: string;
    date: string;
    location: string;
    status: string;
    priceComp: number;
    priceVis: number;
    banner?: string;
    mpPublicKey?: string;
    hasTshirtPromotion?: boolean;
    tshirtLimitComp?: number;
    tshirtLimitVis?: number;
}

export function ChampionshipsSection() {
    const [championships, setChampionships] = useState<Champ[]>([]);
    const [selectedChamp, setSelectedChamp] = useState<Champ | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useAuth();

    const [paymentStep, setPaymentStep] = useState(false);
    const [selectedType, setSelectedType] = useState<'COMPETITOR' | 'VISITOR' | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CREDIT_CARD'>('PIX');
    const [showCardForm, setShowCardForm] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [gatewayResponse, setGatewayResponse] = useState<any>(null);


    const location = useLocation();

    useEffect(() => {
        api.get('/championships').then(res => {
            setChampionships(Array.isArray(res.data) ? res.data : []);

            // Auto-open modal if returning from Auth
            if (user && location.state?.champId) {
                const targetChamp = res.data.find((c: any) => c.id === location.state.champId);
                if (targetChamp) {
                    setSelectedChamp(targetChamp);
                    // Restaurar o fluxo de checkout automaticamente se houver uma ação salva no estado
                    if (location.state.action) {
                        setSelectedType(location.state.action);
                        setPaymentStep(true);
                    }
                }
            }
        }).catch(err => {
            console.error('Failed to load championships', err);
            setChampionships([]);
        }).finally(() => setLoading(false));
    }, [user, location.state, navigate]);

    // Verificação de status do pedido em tempo real (Polling)
    useEffect(() => {
        let interval: any;
        if (gatewayResponse?.orderId && gatewayResponse?.status !== 'approved' && !gatewayResponse?.isFree) {
            interval = setInterval(async () => {
                try {
                    const { data } = await api.get(`/orders/${gatewayResponse.orderId}/status`);
                    if (data.paymentStatus === 'APPROVED') {
                        toast.success("Pagamento aprovado com sucesso!");
                        setGatewayResponse((prev: any) => ({
                            ...prev,
                            status: 'approved',
                            message: 'Pagamento Aprovado!'
                        }));
                        setTimeout(() => {
                            navigate('/minha-conta');
                        }, 3000);
                    } else if (data.paymentStatus === 'FAILED' || data.paymentStatus === 'REJECTED') {
                        toast.error("Pagamento não foi aprovado.");
                        setGatewayResponse((prev: any) => ({
                            ...prev,
                            status: 'rejected',
                            message: 'Pagamento Recusado'
                        }));
                    }
                } catch (e) {
                    console.error("Erro ao verificar status do pedido", e);
                }
            }, 5000); // Check every 5 seconds
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [gatewayResponse, navigate]);

    const isFederated = user?.federationYear === new Date().getFullYear();

    const handleAction = (c: any, type: 'COMPETITOR' | 'VISITOR') => {
        if (!user) {
            navigate('/auth', { state: { returnTo: '/', champId: c.id, action: type } });
            return;
        }

        setSelectedType(type);
        setPaymentStep(true);
        setShowCardForm(false);
        setGatewayResponse(null);
    };

    const calculateTotal = () => {
        if (!selectedChamp || !selectedType) return 0;
        let total = selectedType === 'COMPETITOR' ? selectedChamp.priceComp : selectedChamp.priceVis;
        return total;
    };


    const processTransparentPayment = async (cardData?: any) => {
        if (!selectedChamp || !selectedType) return;
        setProcessing(true);
        try {
            const amount = calculateTotal();

            // 1. Criar o pedido (Order)
            const orderPayload = {
                championshipId: selectedChamp.id,
                type: selectedType,
                paymentMethod: paymentMethod,
            };

            const { data: orderData } = await api.post('/orders', orderPayload);
            const orderId = orderData.order.id;

            // Se for gratuito, já encerra aqui (o OrderController já aprovou)
            if (orderData.order.paymentStatus === 'APPROVED') {
                setGatewayResponse({ isFree: true });
                return;
            }

            // 2. Processar o Pagamento Transparente
            let paymentData: any = {};

            if (paymentMethod === 'PIX') {
                paymentData = {
                    transaction_amount: amount,
                    payment_method_id: 'pix',
                    payer: {
                        email: user?.email,
                    }
                };
            } else if (cardData) {
                // Dados vindos do CardCheckoutForm
                paymentData = cardData.formData;
            } else {
                toast.error("Método de pagamento não configurado.");
                setProcessing(false);
                return;
            }

            const { data: payData } = await api.post('/payment/process', {
                paymentData,
                orderId
            });

            console.log('[Frontend] Pagamento processado:', payData);

            if (paymentMethod === 'PIX') {
                setGatewayResponse({
                    qrCodeUrl: payData.ticket_url,
                    qrCodeData: payData.qr_code,
                    qrCodeBase64: payData.qr_code_base64,
                    orderId: orderId,
                    status: 'pending' // Added to trigger polling
                });
            } else {
                setGatewayResponse({
                    message: payData.status === 'approved' ? 'Pagamento Aprovado!' : (payData.status === 'rejected' ? 'Pagamento Recusado' : 'Processando Pagamento...'),
                    transactionId: payData.id,
                    status: payData.status,
                    orderId: orderId
                });
                
                if (payData.status === 'approved') {
                    toast.success("Pagamento aprovado com sucesso!");
                    setTimeout(() => navigate('/minha-conta'), 3000);
                } else if (payData.status === 'rejected') {
                    toast.error("Pagamento não foi aprovado pela operadora.");
                }
            }

        } catch (e: any) {
            console.error(e);
            toast.error(e.response?.data?.details || 'Falha ao processar pagamento transparente.');
        } finally {
            setProcessing(false);
        }
    };

    const closeAll = () => {
        setSelectedChamp(null);
        setPaymentStep(false);
        setGatewayResponse(null);
        setShowCardForm(false);
    };

    if (loading) return <div className="text-blue-400 text-center py-20">Carregando Campeonatos...</div>;
    
    const openChampionships = (Array.isArray(championships) ? championships : []).filter(c => c.status === 'OPEN');
    if (openChampionships.length === 0) return null;

    return (
        <>
            <section id="campeonatos" className="py-24 relative z-10 bg-zinc-950 border-t border-white/5">
                <div className="container mx-auto px-6 relative">
                    <div className="text-center mb-16">
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Próximos Meetups & Workshops</h3>
                        <h2 className="text-3xl md:text-5xl font-black text-blue-400">Eventos de Tecnologia</h2>
                        <p className="text-gray-400 mt-4 max-w-2xl mx-auto">Garanta seu lugar nos próximos workshops e palestras da vinidev.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {openChampionships.map(c => (
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
                                    <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                        DISPONÍVEL
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
                                    <button className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-blue-500 hover:text-white rounded-lg transition-colors font-bold uppercase text-sm group-hover:bg-blue-500 group-hover:text-white">
                                        Explorar Workshop
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {selectedChamp && createPortal(
                <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 py-8 md:py-12">
                    <div className="bg-zinc-900 border border-blue-400/30 w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden relative shadow-2xl flex flex-col mt-12 md:mt-0">
                        <button onClick={closeAll} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-black/50 p-2 rounded-full z-10 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                        <div className="h-48 md:h-64 bg-zinc-800 flex-shrink-0 relative">
                            {selectedChamp.banner ? (
                                <img 
                                    src={selectedChamp.banner.startsWith('/') ? `${api.defaults.baseURL?.replace('/api', '')}${selectedChamp.banner}` : selectedChamp.banner} 
                                    alt={selectedChamp.name} 
                                    className="w-full h-full object-cover" 
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-600">Sem Banner</div>
                            )}
                        </div>
                        <div className="p-8 overflow-y-auto w-full relative">
                            {!paymentStep ? (
                                <>
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
                                            className="bg-blue-500 hover:bg-blue-400 text-white py-4 rounded-xl font-black uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center"
                                        >
                                            <span>Palestrante</span>
                                            <span className="text-xs opacity-75 mt-1">R$ {selectedChamp.priceComp?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}</span>
                                        </button>
                                        <button
                                            disabled={selectedChamp.status !== 'OPEN'}
                                            onClick={() => handleAction(selectedChamp, 'VISITOR')}
                                            className="border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white py-4 rounded-xl font-black uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center"
                                        >
                                            <span>Ouvinte</span>
                                            <span className="text-xs opacity-75 mt-1">R$ {selectedChamp.priceVis?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}</span>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <h2 className="text-2xl font-black mb-4 uppercase tracking-widest text-blue-400">Checkout</h2>
                                    <div className="text-gray-400 mb-6 bg-zinc-950 p-4 rounded-xl border border-white/5">
                                        <div className="flex justify-between items-center mb-2">
                                            <span>{selectedType === 'COMPETITOR' ? 'Passe Palestrante' : 'Ingresso Ouvinte'}</span>
                                            <strong className="text-white">R$ {(selectedType === 'COMPETITOR' ? selectedChamp.priceComp : selectedChamp.priceVis).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                                        </div>
                                        <div className="h-px bg-white/10 my-2"></div>
                                        <div className="flex justify-between items-center text-lg mt-2">
                                            <span className="font-bold text-white">Total</span>
                                            <strong className="text-blue-400 font-black">R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                                        </div>
                                    </div>

                                    {gatewayResponse ? (
                                        <div className="text-center p-6 bg-zinc-800 border border-blue-400/20 rounded-xl">
                                            {gatewayResponse.isFree || gatewayResponse.status === 'approved' ? (
                                                <>
                                                    <h3 className="text-blue-400 font-bold mb-2 uppercase tracking-widest">
                                                        {gatewayResponse.isFree ? 'Ingresso Gratuito!' : 'Pagamento Aprovado!'}
                                                    </h3>
                                                    <p className="text-sm text-gray-400 mb-6">
                                                        {gatewayResponse.isFree 
                                                            ? "Sua inscrição foi confirmada com sucesso." 
                                                            : `Seu pedido #${gatewayResponse.transactionId} foi processado.`}
                                                    </p>
                                                    <button onClick={() => navigate('/minha-conta')} className="px-6 py-3 bg-blue-400 text-black font-bold uppercase rounded-lg hover:bg-blue-300 w-full transition-colors">Acessar Meu Ingresso</button>
                                                </>
                                            ) : paymentMethod === 'PIX' ? (
                                                <>
                                                    <h3 className="text-blue-400 font-bold mb-4 uppercase tracking-widest">Pague com PIX</h3>
                                                    <div className="flex justify-center mb-6 bg-white p-4 rounded-xl inline-block mx-auto">
                                                        {gatewayResponse.qrCodeBase64 ? (
                                                            <img src={`data:image/jpeg;base64,${gatewayResponse.qrCodeBase64}`} alt="QR Code PIX" className="w-48 h-48" />
                                                        ) : (
                                                            <div className="w-48 h-48 flex items-center justify-center text-zinc-400">QR Code não disponível</div>
                                                        )}
                                                    </div>
                                                    <div className="space-y-4">
                                                        <p className="text-xs text-gray-400 text-center">Código PIX (Copia e Cola):</p>
                                                        <p className="text-[10px] text-gray-400 break-all bg-black/50 p-3 rounded font-mono border border-zinc-800 select-all">{gatewayResponse.qrCodeData}</p>
                                                        <button 
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(gatewayResponse.qrCodeData);
                                                                toast.success("Código PIX copiado!");
                                                            }}
                                                            className="text-blue-400 text-xs font-bold uppercase hover:underline"
                                                        >
                                                            Copiar Código
                                                        </button>
                                                    </div>
                                                    <button onClick={() => navigate('/minha-conta')} className="mt-8 px-6 py-3 border border-blue-400 text-blue-400 font-bold uppercase rounded-lg hover:bg-blue-400 hover:text-black w-full transition-all">Já paguei, ver meus ingressos</button>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-4">
                                                    {gatewayResponse.status === 'rejected' ? (
                                                        <>
                                                            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                                                                <X className="w-8 h-8" />
                                                            </div>
                                                            <h3 className="text-red-500 font-bold mb-2 uppercase tracking-widest">{gatewayResponse.message || 'Pagamento Recusado'}</h3>
                                                            <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">Sua transação ({gatewayResponse.transactionId}) foi negada pelo banco ou emissor. Verifique os dados e tente novamente.</p>
                                                            <button onClick={() => setGatewayResponse(null)} className="px-6 py-3 border border-red-500 text-red-500 font-bold uppercase rounded-lg hover:bg-red-500 hover:text-white w-full transition-colors">Tentar Novamente</button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="mb-6 relative">
                                                                <div className="w-16 h-16 border-4 border-blue-400/20 border-t-blue-400 rounded-full animate-spin mx-auto"></div>
                                                            </div>
                                                            <h3 className="text-blue-400 font-bold mb-2 uppercase tracking-widest">Processando Pagamento...</h3>
                                                            <p className="text-sm text-gray-400 font-mono mb-6 max-w-sm mx-auto">Aguardando confirmação da operadora do cartão. Por favor, não feche esta página enquanto avaliamos sua transação ({gatewayResponse.transactionId}).</p>
                                                            <button disabled className="px-6 py-3 bg-zinc-800 text-zinc-500 cursor-not-allowed font-bold uppercase rounded-lg w-full flex items-center justify-center gap-2">
                                                                <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin"></div>
                                                                Aguarde...
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-6">
                                            {showCardForm ? (
                                                <CardCheckoutForm 
                                                    amount={calculateTotal()}
                                                    orderId="TEMP" // Será gerado internamente
                                                    mpPublicKey={selectedChamp.mpPublicKey || ''}
                                                    onPaymentSuccess={(data) => processTransparentPayment(data)}
                                                    onCancel={() => setShowCardForm(false)}
                                                />
                                            ) : (
                                                <>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <button 
                                                            onClick={() => setPaymentMethod('PIX')}
                                                            className={`py-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'PIX' ? 'border-blue-400 bg-blue-400/10 text-white' : 'border-zinc-800 bg-zinc-900 text-gray-500 hover:border-zinc-700'}`}
                                                        >
                                                            <span className="font-bold">PIX</span>
                                                            <span className="text-[10px] uppercase tracking-wider">Instantâneo</span>
                                                        </button>
                                                        <button 
                                                            onClick={() => setPaymentMethod('CREDIT_CARD')}
                                                            className={`py-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'CREDIT_CARD' ? 'border-blue-400 bg-blue-400/10 text-white' : 'border-zinc-800 bg-zinc-900 text-gray-500 hover:border-zinc-700'}`}
                                                        >
                                                            <span className="font-bold">CARTÃO DE CRÉDITO</span>
                                                            <span className="text-[10px] uppercase tracking-wider">Até 12x</span>
                                                        </button>
                                                    </div>

                                                    <button
                                                        onClick={() => paymentMethod === 'PIX' ? processTransparentPayment() : setShowCardForm(true)}
                                                        disabled={processing}
                                                        className="w-full bg-blue-400 text-black py-4 rounded-xl font-black uppercase tracking-wider hover:bg-blue-300 transition-colors disabled:opacity-50"
                                                    >
                                                        {processing ? (
                                                            <div className="flex items-center justify-center gap-2">
                                                                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                                                <span>Processando...</span>
                                                            </div>
                                                        ) : (
                                                            paymentMethod === 'PIX' ? 'Gerar QR Code PIX' : 'Seguir para Dados do Cartão'
                                                        )}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                , document.body)}
        </>
    );
}
