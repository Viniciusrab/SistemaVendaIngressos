import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ShieldCheck, Plus, Power, Pencil, Camera, CheckCircle, XCircle, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

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
    hasTshirtPromotion?: boolean;
    tshirtLimitComp?: number;
    tshirtLimitVis?: number;
}

interface Order {
    id: string;
    championshipId: string;
    type: string;
    paymentStatus: string;
    amount: number;
    createdAt: string;
    wonTshirt?: boolean;
    user?: {
        name: string;
        email: string;
    };
    championship?: {
        name: string;
    };
}

export function AdminDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const userRole = user?.role?.toUpperCase() || '';
    const [activeTab, setActiveTab] = useState(userRole === 'TICKETER' ? 'validator' : 'champs');
    const [championships, setChampionships] = useState<Champ[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [selectedChampFilter, setSelectedChampFilter] = useState<string>('');
    const [selectedStartDate, setSelectedStartDate] = useState<string>('');
    const [selectedEndDate, setSelectedEndDate] = useState<string>('');

    // Validator State
    const [scanResult, setScanResult] = useState<any>(null);
    const [manualUuid, setManualUuid] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);

    // Create User State
    const [showUserModal, setShowUserModal] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', cpf: '', email: '', phone: '', password: '', role: 'USER' });

    // New Champ Form / Edit Form
    const [form, setForm] = useState({
        name: '', description: '', date: '', location: '', priceComp: 0, priceVis: 0, banner: '',
        mpPublicKey: '', mpAccessToken: '', mpWebhookSecret: '',
        hasTshirtPromotion: false, tshirtLimitComp: 50, tshirtLimitVis: 100
    });
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        if (!user || (!['ADMIN', 'SUPPORT', 'TICKETER'].includes(userRole))) {
            navigate('/');
            return;
        }

        if (activeTab === 'champs' || activeTab === 'orders' || activeTab === 'Palestrantes') {
            fetchChamps();
            fetchOrders();
            if (activeTab === 'Palestrantes') fetchUsers();
        }

        // Scanner Cleanup
        return () => {
            // Se houver algum scanner rodando, ele morre aqui no unmount
        };
    }, [activeTab, user, navigate]);

    useEffect(() => {
        let scanner: any = null;
        if (activeTab === 'validator') {
            scanner = new Html5QrcodeScanner("reader", {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            }, false);

            scanner.render((decodedText: string) => {
                scanner.pause(true);
                handleValidate(decodedText);
            }, () => { });
        }

        return () => {
            if (scanner) {
                scanner.clear().catch((e: any) => console.error("Erro ao limpar scanner", e));
            }
        };
    }, [activeTab]);

    const handleValidate = async (uuid: string) => {
        setIsValidating(true);
        setScanResult(null);
        try {
            const { data } = await api.post('/tickets/validate', { uuid });
            setScanResult({ status: 'success', message: data.message, detail: data.ticket });
            setShowResultModal(true);
            // Se validou com sucesso, talvez atualizar a lista de ordens se estivermos vendo também
            if (activeTab === 'orders') fetchOrders();
        } catch (err: any) {
            setScanResult({ status: 'error', message: err.response?.data?.error || 'Erro na validação' });
            setShowResultModal(true);
        } finally {
            setIsValidating(false);
        }
    };

    const fetchChamps = async () => {
        const { data } = await api.get('/admin/championships');
        setChampionships(data);
    };

    const fetchOrders = async () => {
        const { data } = await api.get('/admin/orders');
        setOrders(data);
    };

    const fetchUsers = async () => {
        const { data } = await api.get('/admin/users');
        setUsers(data);
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            await api.patch(`/admin/users/${userId}/role`, { role: newRole });
            alert('Perfil atualizado com sucesso!');
            fetchUsers();
        } catch (err) {
            alert('Erro ao atualizar perfil.');
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/admin/users', newUser);
            alert('Usuário criado com sucesso!');
            setShowUserModal(false);
            setNewUser({ name: '', cpf: '', email: '', phone: '', password: '', role: 'USER' });
            fetchUsers();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Erro ao criar usuário.');
        }
    };

    const toggleStatus = async (id: string) => {
        await api.patch(`/admin/championships/${id}/status`);
        fetchChamps();
    };

    const handleCreateOrEditChamp = async (e: any) => {
        e.preventDefault();
        try {
            const payload = {
                ...form,
                date: new Date(form.date).toISOString(),
                priceComp: Number(form.priceComp),
                priceVis: Number(form.priceVis)
            };

            if (editingId) {
                await api.put(`/admin/championships/${editingId}`, payload);
                alert('Campeonato atualizado com sucesso!');
            } else {
                await api.post('/admin/championships', payload);
                alert('Campeonato criado com sucesso!');
            }

            fetchChamps();
            resetForm();
        } catch (err) {
            alert('Erro ao salvar campeonato');
        }
    };

    const handleEdit = (c: any) => {
        setEditingId(c.id);
        const formattedDate = new Date(c.date).toISOString().slice(0, 16);
        setForm({
            name: c.name,
            description: c.description,
            date: formattedDate,
            location: c.location,
            priceComp: c.priceComp,
            priceVis: c.priceVis,
            banner: c.banner || '',
            mpPublicKey: c.mpPublicKey || '',
            mpAccessToken: c.mpAccessToken || '',
            mpWebhookSecret: c.mpWebhookSecret || '',
            hasTshirtPromotion: c.hasTshirtPromotion || false,
            tshirtLimitComp: c.tshirtLimitComp || 50,
            tshirtLimitVis: c.tshirtLimitVis || 100
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setForm({ 
            name: '', description: '', date: '', location: '', priceComp: 0, priceVis: 0, banner: '', 
            mpPublicKey: '', mpAccessToken: '', mpWebhookSecret: '',
            hasTshirtPromotion: false, tshirtLimitComp: 50, tshirtLimitVis: 100
        });
        setEditingId(null);
    };

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12 px-6">
            <div className="container mx-auto max-w-7xl">
                <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
                    <ShieldCheck className="w-10 h-10 text-blue-400" />
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-widest text-blue-400">Painel de Controle vinidev</h1>
                        <p className="text-gray-400">Gerenciamento de Eventos e Transações</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 mb-8">
                    {userRole !== 'TICKETER' && (
                        <button
                            onClick={() => setActiveTab('champs')}
                            className={`px-6 py-3 font-bold rounded-lg transition-colors ${activeTab === 'champs' ? 'bg-blue-400 text-black' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
                        >
                            Eventos Tech
                        </button>
                    )}
                    {userRole !== 'TICKETER' && (
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`px-6 py-3 font-bold rounded-lg transition-colors ${activeTab === 'orders' ? 'bg-blue-400 text-black' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
                        >
                            Vendas & Ingressos
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab('validator')}
                        className={`px-6 py-3 font-bold rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'validator' ? 'bg-blue-400 text-black' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
                    >
                        <Camera className="w-4 h-4" /> Portaria (Validar)
                    </button>
                    {userRole !== 'TICKETER' && (
                        <button
                            onClick={() => setActiveTab('Palestrantes')}
                            className={`px-6 py-3 font-bold rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'Palestrantes' ? 'bg-blue-400 text-black' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
                        >
                            Usuários / Palestrantes
                        </button>
                    )}
                </div>

                {activeTab === 'champs' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            <h2 className="text-xl font-bold uppercase mb-4 text-gray-300">Eventos Cadastrados</h2>
                            {championships.map(c => (
                                <div key={c.id} className="bg-zinc-900 border border-white/5 p-6 rounded-xl flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-bold text-lg">{c.name}</h3>
                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${c.status === 'OPEN' ? 'border-green-500 text-green-500 bg-green-500/10' : 'border-red-500 text-red-500 bg-red-500/10'}`}>
                                                {c.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-400 mb-2">{new Date(c.date).toLocaleDateString('pt-BR')} - {c.location}</p>
                                        <div className="flex gap-3 mt-2">
                                            <div className="bg-black/50 px-3 py-1.5 rounded border border-white/5">
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Palestrantes</p>
                                                <p className="text-blue-400 font-black text-lg leading-none">{orders.filter(o => o.championshipId === c.id && o.type === 'COMPETITOR' && o.paymentStatus === 'APPROVED').length}</p>
                                            </div>
                                            <div className="bg-black/50 px-3 py-1.5 rounded border border-white/5">
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Ouvintes</p>
                                                <p className="text-blue-500 font-black text-lg leading-none">{orders.filter(o => o.championshipId === c.id && o.type === 'VISITOR' && o.paymentStatus === 'APPROVED').length}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 relative z-10">
                                        <button
                                            onClick={() => handleEdit(c)}
                                            title="Editar Campeonato"
                                            className="p-3 rounded-full transition-colors bg-zinc-700 hover:bg-zinc-600 text-white"
                                        >
                                            <Pencil className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => toggleStatus(c.id)}
                                            title="Alternar Status"
                                            className={`p-3 rounded-full transition-colors ${c.status === 'OPEN' ? 'bg-blue-400 text-black hover:bg-blue-300' : 'bg-zinc-700 hover:bg-zinc-600 text-white'}`}
                                        >
                                            <Power className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div>
                            <div className="bg-zinc-900 border border-blue-400/30 p-6 rounded-xl sticky top-24">
                                <h2 className="text-xl font-bold uppercase mb-4 flex items-center gap-2 text-blue-400">
                                    {editingId ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                    {editingId ? 'Editar Evento' : 'Novo Evento'}
                                </h2>
                                <form onSubmit={handleCreateOrEditChamp} className="space-y-4 text-sm">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Nome do Evento</label>
                                        <input type="text" placeholder="Ex: vinidev Open" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-zinc-800 border-zinc-700 border p-3 rounded" />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Descrição e Regras</label>
                                        <textarea placeholder="Detalhes do campeonato..." required rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full bg-zinc-800 border-zinc-700 border p-3 rounded" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Data e Hora</label>
                                            <input type="datetime-local" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full bg-zinc-800 border-zinc-700 border p-3 rounded text-gray-400" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Local / Arena</label>
                                            <input type="text" placeholder="Cidade - UF" required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full bg-zinc-800 border-zinc-700 border p-3 rounded" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Valor Inscrição (Palestrante)</label>
                                            <input type="number" step="0.01" min="0" placeholder="R$ 0,00" required value={form.priceComp} onChange={e => setForm({ ...form, priceComp: Number(e.target.value) })} className="w-full bg-zinc-800 border-zinc-700 border p-3 rounded" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Valor Ingresso (Ouvinte)</label>
                                            <input type="number" step="0.01" min="0" placeholder="R$ 0,00" required value={form.priceVis} onChange={e => setForm({ ...form, priceVis: Number(e.target.value) })} className="w-full bg-zinc-800 border-zinc-700 border p-3 rounded" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-gray-500">Banner do Evento (Upload ou URL)</label>
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                placeholder="URL da Imagem" 
                                                value={form.banner} 
                                                onChange={e => setForm({ ...form, banner: e.target.value })} 
                                                className="flex-1 bg-zinc-800 border-zinc-700 border p-3 rounded text-sm" 
                                            />
                                            <label className="cursor-pointer bg-zinc-700 hover:bg-zinc-600 px-4 flex items-center justify-center rounded transition-colors group">
                                                <Camera className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                                                <input 
                                                    type="file" 
                                                    className="hidden" 
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;
                                                        
                                                        const formData = new FormData();
                                                        formData.append('banner', file);
                                                        
                                                        try {
                                                            toast.loading('Enviando imagem...', { id: 'upload' });
                                                            const { data } = await api.post('/uploads/banner', formData, {
                                                                headers: { 'Content-Type': 'multipart/form-data' }
                                                            });
                                                            setForm({ ...form, banner: data.url });
                                                            toast.success('Imagem enviada!', { id: 'upload' });
                                                        } catch (err: any) {
                                                            console.error('Erro no upload da imagem:', err);
                                                            toast.dismiss('upload');
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                        {form.banner && (
                                            <div className="mt-2 relative rounded-lg overflow-hidden border border-white/10 aspect-video">
                                                <img src={form.banner.startsWith('/') ? `${api.defaults.baseURL?.replace('/api', '')}${form.banner}` : form.banner} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="border border-green-500/20 rounded-lg p-4 bg-black/20 space-y-3">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-green-500 mb-2">Credenciais Mercado Pago (Evento)</h3>
                                        {editingId && <p className="text-[10px] text-gray-400 mb-2">Deixe em branco para manter as chaves atreladas atualmente.</p>}
                                        <input type="text" placeholder="Public Key" value={form.mpPublicKey} onChange={e => setForm({ ...form, mpPublicKey: e.target.value })} className="w-full bg-zinc-900 border-zinc-700 border p-3 rounded" />
                                        <input type="password" placeholder="Access Token" value={form.mpAccessToken} onChange={e => setForm({ ...form, mpAccessToken: e.target.value })} className="w-full bg-zinc-900 border-zinc-700 border p-3 rounded" />
                                        <input type="password" placeholder="Webhook Secret" value={form.mpWebhookSecret} onChange={e => setForm({ ...form, mpWebhookSecret: e.target.value })} className="w-full bg-zinc-900 border-zinc-700 border p-3 rounded" />
                                    </div>

                                    <div className="border border-blue-400/20 rounded-lg p-4 bg-black/20 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400">Promoção de Camiseta</h3>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="sr-only peer"
                                                    checked={form.hasTshirtPromotion}
                                                    onChange={e => setForm({ ...form, hasTshirtPromotion: e.target.checked })}
                                                />
                                                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-400"></div>
                                            </label>
                                        </div>
                                        
                                        {form.hasTshirtPromotion && (
                                            <div className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in duration-200">
                                                <div>
                                                    <p className="text-[10px] text-gray-500 mb-1 uppercase font-bold">Limite Palestrantes</p>
                                                    <input type="number" value={form.tshirtLimitComp} onChange={e => setForm({ ...form, tshirtLimitComp: Number(e.target.value) })} className="w-full bg-zinc-900 border-zinc-700 border p-2 rounded text-xs" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-500 mb-1 uppercase font-bold">Limite Ouvintes</p>
                                                    <input type="number" value={form.tshirtLimitVis} onChange={e => setForm({ ...form, tshirtLimitVis: Number(e.target.value) })} className="w-full bg-zinc-900 border-zinc-700 border p-2 rounded text-xs" />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <button type="submit" className="flex-1 bg-blue-400 text-black font-black uppercase py-3 rounded hover:bg-blue-300 transition-colors">
                                            {editingId ? 'Salvar Edição' : 'Criar Campeonato'}
                                        </button>
                                        {editingId && (
                                            <button type="button" onClick={resetForm} className="bg-zinc-700 text-white font-bold uppercase px-4 py-3 rounded hover:bg-zinc-600 transition-colors">
                                                Cancelar
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="space-y-6">
                        {/* Summary Metrics */}
                        <div className="flex flex-col md:flex-row gap-4 mb-2 items-end">
                             <div className="flex-1">
                                 <label className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2 block">Filtrar por Campeonato</label>
                                 <select 
                                    className="bg-zinc-900 border border-zinc-700 text-white p-3 rounded-lg w-full md:w-auto min-w-[300px] focus:outline-none focus:border-blue-400"
                                    value={selectedChampFilter}
                                    onChange={e => setSelectedChampFilter(e.target.value)}
                                 >
                                     <option value="">Todos os Eventos</option>
                                     {championships.map(c => (
                                         <option key={c.id} value={c.id}>{c.name}</option>
                                     ))}
                                 </select>
                             </div>
                             <div>
                                 <label className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2 block">Data Inicial</label>
                                 <input 
                                     type="date" 
                                     className="bg-zinc-900 border border-zinc-700 text-white p-3 rounded-lg w-full md:w-auto focus:outline-none focus:border-blue-400"
                                     value={selectedStartDate}
                                     onChange={e => setSelectedStartDate(e.target.value)}
                                 />
                             </div>
                             <div>
                                 <label className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2 block">Data Final</label>
                                 <input 
                                     type="date" 
                                     className="bg-zinc-900 border border-zinc-700 text-white p-3 rounded-lg w-full md:w-auto focus:outline-none focus:border-blue-400"
                                     value={selectedEndDate}
                                     onChange={e => setSelectedEndDate(e.target.value)}
                                 />
                             </div>
                             <div>
                                 <button 
                                     onClick={() => {
                                         setSelectedChampFilter('');
                                         setSelectedStartDate('');
                                         setSelectedEndDate('');
                                     }}
                                     className="bg-zinc-800 text-gray-300 hover:text-white hover:bg-zinc-700 p-3 rounded-lg border border-zinc-700 font-bold uppercase text-xs transition-colors h-[48px] flex items-center gap-2"
                                 >
                                     <XCircle className="w-4 h-4" /> Limpar
                                 </button>
                             </div>
                        </div>

                        {/* Helper Function to check filters */}
                        {(() => {
                            const filteredOrders = orders.filter(o => {
                                const matchStatus = o.paymentStatus === 'APPROVED';
                                const matchChamp = !selectedChampFilter || o.championshipId === selectedChampFilter;
                                
                                let matchDate = true;
                                if ((selectedStartDate || selectedEndDate) && o.createdAt) {
                                    const orderDate = new Date(o.createdAt);
                                    // Zera a hora para focar só no dia
                                    orderDate.setHours(0, 0, 0, 0); 
                                    
                                    if (selectedStartDate) {
                                        const startDataObj = new Date(selectedStartDate + 'T00:00:00');
                                        if (orderDate < startDataObj) matchDate = false;
                                    }
                                    if (selectedEndDate) {
                                        const endDataObj = new Date(selectedEndDate + 'T00:00:00');
                                        if (orderDate > endDataObj) matchDate = false;
                                    }
                                }

                                return matchStatus && matchChamp && matchDate;
                            });

                            return (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="bg-zinc-900 border border-white/5 p-6 rounded-xl flex flex-col justify-center">
                                            <span className="text-gray-400 uppercase font-bold text-xs tracking-widest mb-1">Vendas</span>
                                            <span className="text-4xl font-black text-blue-400">
                                                {filteredOrders.length}
                                            </span>
                                        </div>
                                        <div className="bg-zinc-900 border border-white/5 p-6 rounded-xl flex flex-col justify-center">
                                            <span className="text-gray-400 uppercase font-bold text-xs tracking-widest mb-1">Palestrantes</span>
                                            <span className="text-4xl font-black text-blue-400">
                                                {filteredOrders.filter(o => o.type === 'COMPETITOR').length}
                                            </span>
                                        </div>
                                        <div className="bg-zinc-900 border border-white/5 p-6 rounded-xl flex flex-col justify-center">
                                            <span className="text-gray-400 uppercase font-bold text-xs tracking-widest mb-1">Ouvintes</span>
                                            <span className="text-4xl font-black text-blue-400">
                                                {filteredOrders.filter(o => o.type === 'VISITOR').length}
                                            </span>
                                        </div>
                                        <div className="bg-zinc-900 border border-white/5 p-6 rounded-xl flex flex-col justify-center">
                                            <span className="text-gray-400 uppercase font-bold text-xs tracking-widest mb-1">Receita</span>
                                            <span className="text-2xl font-black text-blue-400">
                                                R$ {filteredOrders.reduce((acc, o) => acc + o.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Orders Table */}
                                    <div className="bg-zinc-900 border border-white/5 rounded-xl overflow-x-auto mt-6">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-white/10 uppercase tracking-widest text-xs text-blue-400 bg-black/30">
                                                    <th className="p-4 rounded-tl-xl text-center">Data</th>
                                                    <th className="p-4 text-center">Hora</th>
                                                    <th className="p-4">Cliente</th>
                                                    <th className="p-4">Evento</th>
                                                    <th className="p-4">Tipo</th>
                                                    <th className="p-4 text-center">Brinde</th>
                                                    <th className="p-4">Valor</th>
                                                    <th className="p-4 rounded-tr-xl text-center">Status</th>
                                                </tr>
                                            </thead>
                                             <tbody>
                                                {filteredOrders.length === 0 ? (
                                                    <tr><td colSpan={8} className="p-8 text-center text-gray-400">Nenhuma venda concluída registrada com os filtros informados.</td></tr>
                                                ) : (
                                                    filteredOrders.map(o => {
                                                        const dateObj = new Date(o.createdAt);
                                                        const dateStr = dateObj.toLocaleDateString('pt-BR');
                                                        const timeStr = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                                                        
                                                        return (
                                                            <tr key={o.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-sm">
                                                                <td className="p-4 text-center font-mono text-xs text-gray-300">{dateStr}</td>
                                                                <td className="p-4 text-center font-mono text-xs text-gray-500">{timeStr}</td>
                                                                <td className="p-4">
                                                                    <div className="font-bold">{o.user?.name}</div>
                                                                    <div className="text-xs text-gray-500">{o.user?.email}</div>
                                                                </td>
                                                                <td className="p-4 font-bold">{o.championship?.name}</td>
                                                                <td className="p-4 text-xs font-mono">{o.type}</td>
                                                                <td className="p-4 text-center">
                                                                    {o.wonTshirt ? (
                                                                        <span className="text-[10px] font-black bg-blue-400 text-black px-2 py-0.5 rounded shadow-[0_0_10px_rgba(251,191,36,0.5)]">CAMISETA</span>
                                                                    ) : (
                                                                        <span className="text-gray-700">-</span>
                                                                    )}
                                                                </td>
                                                                <td className="p-4 font-bold text-blue-400">R$ {o.amount.toFixed(2)}</td>
                                                                <td className="p-4">
                                                                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded border ${o.paymentStatus === 'APPROVED' ? 'border-green-500 text-green-500 bg-green-500/10' : 'border-blue-400 text-blue-400 bg-blue-400/10'}`}>
                                                                        {o.paymentStatus}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                )}

                {activeTab === 'validator' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-white/10 bg-black/30 flex items-center justify-between">
                                <h2 className="text-xl font-bold uppercase flex items-center gap-2">
                                    <Camera className="text-blue-400" /> Scanner de Ingressos
                                </h2>
                                {isValidating && <span className="text-xs animate-pulse text-blue-400 font-bold">Processando...</span>}
                            </div>

                            <div className="p-8">
                                <div id="reader" className="bg-black rounded-xl overflow-hidden border border-zinc-800 mb-6"></div>

                                <div className="flex items-center gap-4 text-gray-500 mb-6 font-bold text-[10px] uppercase tracking-tighter">
                                    <hr className="flex-1 border-white/5" /> ou digitar código manual <hr className="flex-1 border-white/5" />
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="UUID do Ingresso"
                                        value={manualUuid}
                                        onChange={e => setManualUuid(e.target.value)}
                                        className="flex-1 bg-zinc-800 border border-zinc-700 p-3 rounded text-sm font-mono focus:outline-none focus:border-blue-400"
                                    />
                                    <button
                                        onClick={() => handleValidate(manualUuid)}
                                        disabled={isValidating || !manualUuid}
                                        className="bg-zinc-700 hover:bg-zinc-600 px-4 rounded transition-colors disabled:opacity-50"
                                    >
                                        <Search className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Modal de Resultado da Validação */}
                        {showResultModal && scanResult && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                                <div className={`w-full max-w-md p-8 rounded-3xl border-2 flex flex-col items-center text-center shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in duration-300 ${scanResult.status === 'success' ? 'bg-zinc-900 border-green-500/50 text-green-500' : 'bg-zinc-900 border-red-500/50 text-red-500'}`}>
                                    {scanResult.status === 'success' ? (
                                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                                            <CheckCircle className="w-12 h-12" />
                                        </div>
                                    ) : (
                                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                                            <XCircle className="w-12 h-12" />
                                        </div>
                                    )}


                                    <h3 className="text-3xl font-black uppercase mb-2 tracking-tighter leading-none">{scanResult.message}</h3>

                                    {scanResult.detail ? (
                                        <div className="mt-8 text-left w-full space-y-4 bg-black/40 p-6 rounded-2xl border border-white/5">
                                            <div>
                                                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Ouvinte</p>
                                                <p className="text-white font-bold text-lg leading-tight">{scanResult.detail.order?.user?.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Campeonato</p>
                                                <p className="text-white font-bold leading-snug">{scanResult.detail.order?.championship?.name}</p>
                                            </div>
                                            <div className="flex justify-between items-end gap-2">
                                                <div>
                                                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Tipo de Ingresso</p>
                                                    <p className="text-blue-400 font-black text-sm uppercase tracking-wider">
                                                        {scanResult.detail.order?.type === 'COMPETITOR' ? 'Passe Competidor' : 'Ingresso Ouvinte'}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Status</p>
                                                    <p className="text-green-500 font-black text-xs uppercase bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">Válido para Acesso</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-4 p-4 text-sm text-gray-400 font-medium">
                                            {scanResult.message === 'TICKET JÁ UTILIZADO' ? 'Este ingresso já foi validado anteriormente e não pode ser usado novamente.' : 'Não conseguimos localizar este ingresso em nossa base de dados.'}
                                        </div>
                                    )}

                                    <button
                                        onClick={() => {
                                            setShowResultModal(false);
                                            setScanResult(null);
                                            // O scanner voltará ao estado original ou resetará dependendo de como o useEffect lida com isso.
                                            // Na verdade, como demos scanner.pause(true), precisamos dar resume ou recriar.
                                            // Vamos forçar um refresh do tab para simplificar ou gerenciar o scanner melhor.
                                            setActiveTab('');
                                            setTimeout(() => setActiveTab('validator'), 10);
                                        }}
                                        className={`mt-10 w-full py-5 rounded-2xl font-black uppercase tracking-widest text-lg transition-all active:scale-95 shadow-lg ${scanResult.status === 'success' ? 'bg-green-500 text-black hover:bg-green-400' : 'bg-red-500 text-white hover:bg-red-400'}`}
                                    >
                                        Próximo Ingresso
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 text-center text-gray-500 text-xs">
                            <p>Dica: No celular, aponte a câmera para o QR Code do ingresso. <br /> A validação ocorrerá instantaneamente.</p>
                        </div>

                        <style>{`
                            #reader button { background: #f59e0b !important; color: black !important; font-weight: 800 !important; border-radius: 6px !important; border: none !important; padding: 8px 16px !important; text-transform: uppercase !important; cursor: pointer !important; margin-top: 10px !important; }
                            #reader select { background: #27272a !important; color: white !important; border: 1px solid #3f3f46 !important; border-radius: 4px !important; padding: 4px !important; margin: 4px !important; }
                            #reader a { display: none !important; }
                            #reader { border: none !important; }
                            #reader__scan_region { display: flex; justify-content: center; }
                        `}</style>
                    </div>
                )}

                {activeTab === 'Palestrantes' && (
                    <div className="space-y-6">
                        {userRole === 'ADMIN' && (
                            <div className="flex justify-end mb-4">
                                <button
                                    onClick={() => setShowUserModal(true)}
                                    className="bg-blue-400 text-black px-4 py-2 font-bold rounded-lg hover:bg-blue-300 transition-colors flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> Novo Usuário
                                </button>
                            </div>
                        )}

                        <div className="bg-zinc-900 border border-white/5 rounded-xl overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 uppercase tracking-widest text-xs text-blue-400 bg-black/30">
                                        <th className="p-4 rounded-tl-xl">Nome</th>
                                        <th className="p-4">CPF</th>
                                        <th className="p-4">Contato</th>
                                        <th className="p-4 text-center">Cadastro</th>
                                        {userRole === 'ADMIN' && <th className="p-4 rounded-tr-xl text-center">Perfil de Acesso</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length === 0 ? (
                                        <tr><td colSpan={userRole === 'ADMIN' ? 5 : 4} className="p-8 text-center text-gray-400">Nenhum Palestrante cadastrado.</td></tr>
                                    ) : (
                                        users.map(u => {
                                            return (
                                                <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-sm">
                                                    <td className="p-4 font-bold">{u.name}</td>
                                                    <td className="p-4 font-mono text-xs">{u.cpf}</td>
                                                    <td className="p-4">
                                                        <div className="text-white">{u.email}</div>
                                                        <div className="text-xs text-gray-500">{u.phone}</div>
                                                    </td>
                                                    <td className="p-4 text-center text-gray-400 text-xs">
                                                        {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                                                    </td>
                                                    {userRole === 'ADMIN' && (
                                                        <td className="p-4 text-center">
                                                            <select
                                                                value={u.role || 'USER'}
                                                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                                className="bg-zinc-800 border-zinc-700 text-white text-xs p-2 rounded"
                                                            >
                                                                <option value="USER">Usuário (Padrão)</option>
                                                                <option value="TICKETER">Portaria (Apenas Validar)</option>
                                                                <option value="SUPPORT">Suporte Interno</option>
                                                                <option value="ADMIN">Administrador VIP</option>
                                                            </select>
                                                        </td>
                                                    )}
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Create User Modal */}
                {showUserModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
                        <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 relative">
                            <button 
                                onClick={() => setShowUserModal(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-white"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                            
                            <h2 className="text-2xl font-bold uppercase text-blue-400 mb-6 flex items-center gap-2">
                                <Plus className="w-5 h-5" /> Criar Novo Usuário
                            </h2>
                            
                            <form onSubmit={handleCreateUser} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Cpf</label>
                                    <input required type="text" value={newUser.cpf} onChange={e => setNewUser({...newUser, cpf: e.target.value})} className="w-full bg-zinc-800 border-zinc-700 border p-3 rounded" placeholder="Apenas números" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nome Completo</label>
                                        <input required type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full bg-zinc-800 border-zinc-700 border p-3 rounded" />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">E-mail</label>
                                        <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full bg-zinc-800 border-zinc-700 border p-3 rounded" />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Telefone (Whatsapp)</label>
                                        <input required type="tel" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} className="w-full bg-zinc-800 border-zinc-700 border p-3 rounded" />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Senha de Acesso</label>
                                        <input required type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full bg-zinc-800 border-zinc-700 border p-3 rounded" />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Perfil de Acesso</label>
                                        <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="w-full bg-zinc-800 border-zinc-700 border p-3 rounded">
                                            <option value="USER">Usuário (Padrão)</option>
                                            <option value="TICKETER">Portaria (Apenas Validar)</option>
                                            <option value="SUPPORT">Suporte Interno</option>
                                            <option value="ADMIN">Administrador VIP</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <button type="submit" className="w-full bg-blue-400 text-black py-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-300 transition-colors mt-6 text-lg">
                                    Cadastrar Usuário
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
