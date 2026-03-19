import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ShieldCheck, Search, CheckCircle, XCircle } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface ValidationResult {
    status: 'success' | 'error';
    message: string;
    detail?: {
        uuid: string;
        order?: {
            type: string;
            user?: { name: string };
            championship?: { name: string };
        }
    };
}

export function ValidatorPage() {
    const [uuid, setUuid] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ValidationResult | null>(null);

    useEffect(() => {
        // Configura o scanner de QRCode após o render
        const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);

        scanner.render((decodedText) => {
            // Quando identificar um QRCode, preenche e tenta validar
            scanner.pause(true);
            setUuid(decodedText);
            validateTicket(decodedText);
            setTimeout(() => scanner.resume(), 3000); // 3 seconds pause after scan
        }, () => { });


        return () => {
            scanner.clear().catch(e => console.error(e));
        };
    }, []);

    const handleManualSubmit = (e: any) => {
        e.preventDefault();
        if (uuid) validateTicket(uuid);
    };

    const validateTicket = async (ticketUuid: string) => {
        setLoading(true);
        setResult(null);
        try {
            const res = await api.post('/tickets/validate', { uuid: ticketUuid });
            setResult({ status: 'success', message: res.data.message, detail: res.data.ticket });
        } catch (err: any) {
            setResult({ status: 'error', message: err.response?.data?.error || 'Erro na validação' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12 px-6 flex flex-col items-center">
            <div className="w-full max-w-3xl">
                <h1 className="text-3xl font-black uppercase text-center mb-8 text-blue-400 flex items-center justify-center gap-3">
                    <ShieldCheck className="w-8 h-8" /> Portaria - Validação de Ingressos
                </h1>

                <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8 shadow-2xl">

                    <div className="bg-black/50 rounded-xl overflow-hidden border border-zinc-800 mb-8" id="reader">
                        {/* O container HTML5-QRCode acoplará a câmera aqui */}
                    </div>

                    <div className="flex items-center gap-4 text-gray-500 mb-8">
                        <hr className="flex-1 border-white/10" />
                        <span className="text-xs uppercase font-bold tracking-widest">OU DIGITE O CÓDIGO</span>
                        <hr className="flex-1 border-white/10" />
                    </div>

                    <form onSubmit={handleManualSubmit} className="flex gap-4">
                        <input
                            type="text"
                            placeholder="UUID do Ingresso"
                            className="flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-6 py-4 font-mono text-center tracking-widest focus:outline-none focus:border-blue-400"
                            value={uuid}
                            onChange={e => setUuid(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={loading || !uuid}
                            className="bg-blue-400 hover:bg-blue-300 text-black px-8 rounded-lg font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            <Search className="w-5 h-5" /> {loading ? '...' : 'Validar'}
                        </button>
                    </form>

                    {/* Resultado da Validação */}
                    {result && (
                        <div className={`mt-8 p-8 rounded-2xl border flex flex-col items-center text-center animate-pulse-fast ${result.status === 'success' ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-red-500/10 border-red-500 text-red-500'}`}>
                            {result.status === 'success' ? <CheckCircle className="w-16 h-16 mb-4" /> : <XCircle className="w-16 h-16 mb-4" />}
                            <h2 className="text-3xl font-black uppercase tracking-widest mb-2">{result.message}</h2>
                            {result.detail && (
                                <div className="text-gray-300 w-full mt-6 bg-black/50 p-4 rounded-xl border border-white/5 mx-auto max-w-sm">
                                    <p className="flex justify-between border-b border-white/10 pb-2 mb-2"><span className="text-gray-500 text-sm">Cliente:</span> <span className="font-bold text-white">{result.detail.order?.user?.name || '---'}</span></p>
                                    <p className="flex justify-between border-b border-white/10 pb-2 mb-2"><span className="text-gray-500 text-sm">Evento:</span> <span className="font-bold text-white">{result.detail.order?.championship?.name || '---'}</span></p>
                                    <p className="flex justify-between"><span className="text-gray-500 text-sm">Tipo:</span> <span className="font-bold text-white uppercase">{result.detail.order?.type}</span></p>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>

            {/* Tailwind helper class */}
            <style>{`
        @keyframes pulse-fast {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-pulse-fast {
          animation: pulse-fast 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        #reader button { background: #d4af37 !important; border-radius: 4px; padding: 4px 12px; margin: 4px auto; color: black; font-weight: bold; border:none; cursor:pointer;}
        #reader a { color: #d4af37; display:none; }
      `}</style>
        </div>
    );
}
