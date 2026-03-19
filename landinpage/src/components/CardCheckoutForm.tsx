import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface CardCheckoutFormProps {
    amount: number;
    orderId: string;
    mpPublicKey: string;
    onPaymentSuccess: (paymentData: any) => Promise<void>;
    onCancel: () => void;
}

export function CardCheckoutForm({ amount, orderId, mpPublicKey, onPaymentSuccess, onCancel }: CardCheckoutFormProps) {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const mpKey = mpPublicKey || import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;
        if (!mpKey) {
            console.error("MERCADOPAGO_PUBLIC_KEY is not defined nor provided by championship");
            toast.error("Integração financeira offline para este evento.");
            return;
        }

        const mp = new (window as any).MercadoPago(mpKey);
        const cardForm = mp.cardForm({
            amount: amount.toString(),
            iframe: true,
            form: {
                id: "form-checkout",
                cardNumber: {
                    id: "form-checkout__cardNumber",
                    placeholder: "Número do cartão",
                    style: {
                        color: "#ffffff"
                    }
                },
                expirationDate: {
                    id: "form-checkout__expirationDate",
                    placeholder: "MM/YY",
                    style: {
                        color: "#ffffff"
                    }
                },
                securityCode: {
                    id: "form-checkout__securityCode",
                    placeholder: "Cód. Seg.",
                    style: {
                        color: "#ffffff"
                    }
                },
                cardholderName: {
                    id: "form-checkout__cardholderName",
                    placeholder: "Titular do cartão",
                },
                issuer: {
                    id: "form-checkout__issuer",
                    placeholder: "Banco emissor",
                },
                installments: {
                    id: "form-checkout__installments",
                    placeholder: "Parcelas",
                },
                identificationType: {
                    id: "form-checkout__identificationType",
                    placeholder: "Tipo",
                },
                identificationNumber: {
                    id: "form-checkout__identificationNumber",
                    placeholder: "CPF/CNPJ",
                },
                cardholderEmail: {
                    id: "form-checkout__cardholderEmail",
                    placeholder: "E-mail",
                },
            },
            callbacks: {
                onFormMounted: (error: any) => {
                    if (error) {
                        console.warn("Form Mounted handling error: ", error);
                    } else {
                        console.log("Form mounted");
                    }
                },
                onSubmit: async (event: any) => {
                    event.preventDefault();
                    setLoading(true);

                    try {
                        const rawData = cardForm.getCardFormData();

                        const formData = {
                            transaction_amount: Number(rawData.amount),
                            token: rawData.token,
                            installments: Number(rawData.installments),
                            payment_method_id: rawData.paymentMethodId,
                            issuer_id: rawData.issuerId,
                            cardholderName: rawData.cardholderName,
                            payer: {
                                email: rawData.cardholderEmail,
                                identification: {
                                    type: rawData.identificationType,
                                    number: rawData.identificationNumber,
                                }
                            }
                        };

                        await onPaymentSuccess({ formData, orderId });
                    } catch (err: any) {
                        console.error(err);
                        toast.error("Erro ao processar dados do cartão.");
                        setLoading(false);
                    }
                },
                onFetching: (_resource: any) => {
                    setProgress(prev => prev < 90 ? prev + 30 : prev);

                    return () => {
                        setProgress(100);
                        setTimeout(() => setProgress(0), 1000);
                    };
                }
            },
        });

        return () => {
            // Let MercadoPago manage its own listeners on unmount
            cardForm.unmount?.();
        };
    }, [amount, orderId, onPaymentSuccess]);

    return (
        <form id="form-checkout" className="w-full flex flex-col gap-4 text-left">
            <h3 className="text-xl font-bold uppercase tracking-widest text-blue-400 mb-2">Cartão de Crédito</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-400">Número do Cartão</label>
                    <div id="form-checkout__cardNumber" className="h-10 px-3 bg-zinc-900 border border-zinc-700 rounded-lg flex items-center text-white"></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-400">Validade</label>
                        <div id="form-checkout__expirationDate" className="h-10 px-3 bg-zinc-900 border border-zinc-700 rounded-lg flex items-center text-white"></div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-400">CVV</label>
                        <div id="form-checkout__securityCode" className="h-10 px-3 bg-zinc-900 border border-zinc-700 rounded-lg flex items-center text-white"></div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">Nome do Titular do Cartão</label>
                <input type="text" id="form-checkout__cardholderName" className="h-10 px-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white outline-none focus:border-blue-400 transition-colors placeholder-zinc-500" placeholder="Nome como no cartão" />
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">E-mail do Titular</label>
                <input type="email" id="form-checkout__cardholderEmail" className="h-10 px-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white outline-none focus:border-blue-400 transition-colors placeholder-zinc-500" placeholder="E-mail" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-400">Banco Emissor</label>
                    <select id="form-checkout__issuer" className="h-10 px-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white outline-none focus:border-blue-400 transition-colors"></select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-400">Parcelas</label>
                    <select id="form-checkout__installments" className="h-10 px-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white outline-none focus:border-blue-400 transition-colors"></select>
                </div>
            </div>

            <div className="grid grid-cols-[100px_1fr] gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-400">Tipo Doc</label>
                    <select id="form-checkout__identificationType" className="h-10 px-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white outline-none focus:border-blue-400 transition-colors"></select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-400">Número do Documento</label>
                    <input type="text" id="form-checkout__identificationNumber" className="h-10 px-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white outline-none focus:border-blue-400 transition-colors placeholder-zinc-500" placeholder="000.000.000-00" />
                </div>
            </div>

            {progress > 0 && (
                <div className="w-full bg-zinc-800 rounded-full h-1 mt-2 overflow-hidden">
                    <div className="bg-blue-400 h-1 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
            )}

            <div className="flex gap-4 mt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="flex-1 py-3 text-white border border-zinc-700 rounded-lg font-bold uppercase transition-colors hover:bg-zinc-800 disabled:opacity-50"
                >
                    Voltar
                </button>
                <button
                    type="submit"
                    id="form-checkout__submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-blue-400 text-black rounded-lg font-bold uppercase hover:bg-blue-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                            Processando...
                        </>
                    ) : (
                        `Pagar R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}`
                    )}
                </button>
            </div>
        </form>
    );
}
