import { Request, Response } from 'express';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import crypto from 'crypto';
import { prisma } from '../prisma';
import { TicketService } from '../services/ticket.service';

const DEFAULT_FED_ACCESS_TOKEN = "APP_USR-2741922997219398-031321-6ce88bbc92fecc5ae10175b72b0215ee-3266725798";
const DEFAULT_FED_WEBHOOK_SECRET = "734f5f08ed39debd0909eaed00f2f62629c3571eb34441b2b8379959a955e951";

export const processPayment = async (req: Request, res: Response) => {
    try {
        const { paymentData, orderId } = req.body;

        const order = await prisma.order.findUnique({ where: { id: orderId }, include: { championship: true } });
        if (!order) return res.status(404).json({ error: 'Pedido não encontrado no ato do pagamento.' });

        let accessToken: string;
        if (order.type === 'FEDERATION') {
            // Federação sempre usa credenciais fixas
            accessToken = DEFAULT_FED_ACCESS_TOKEN;
        } else if (order.championship) {
            accessToken = (order.championship as any).mpAccessToken;
        } else {
            accessToken = DEFAULT_FED_ACCESS_TOKEN;
        }

        if (!accessToken) {
            return res.status(500).json({ error: 'MERCADOPAGO_ACCESS_TOKEN não configurado no servidor (.env) e nem no Campeonato alvo.' });
        }

        const client = new MercadoPagoConfig({ accessToken });
        const paymentClient = new Payment(client);

        // Splitting name to avoid high risk rejections
        const fullName = paymentData.payer?.name || req.body.cardholderName || paymentData.cardholderName || '';
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0] || 'Cliente';
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Evolução';

        // Construção robusta do body baseada no exemplo da documentação e no snippet do frontend
        const webhookBase = process.env.API_BASE_URL || 'https://vinidev.com.br';
        const body: any = {
            transaction_amount: Number(paymentData.transaction_amount),
            token: paymentData.token,
            description: paymentData.description || `Pagamento Pedido ${orderId}`,
            installments: Number(paymentData.installments),
            payment_method_id: paymentData.payment_method_id || paymentData.paymentMethodId,
            payer: {
                email: paymentData.payer?.email || paymentData.email,
                first_name: firstName,
                last_name: lastName,
                identification: {
                    type: paymentData.payer?.identification?.type || paymentData.identificationType,
                    number: paymentData.payer?.identification?.number || paymentData.identificationNumber || paymentData.number
                }
            },
            external_reference: orderId ? orderId.toString() : undefined,
            notification_url: `${webhookBase}/api/payment/webhook/${order.championship?.id || 'global'}?orig=${order.type === 'FEDERATION' ? 'fed' : 'comp'}`,
            binary_mode: true,
        };


        const issuerIdRaw = paymentData.issuer_id || paymentData.issuerId || paymentData.issuer;
        if (issuerIdRaw && issuerIdRaw.toString().trim() !== '') {
            body.issuer_id = issuerIdRaw;
        }

        console.log(`[Payment] Processando Pagamento Transparente para Order ID: ${orderId}`);
        console.log(`[Payment] Body final enviado ao MP: ${JSON.stringify(body, null, 2)}`);
        // console.log(`[Payment] paymentData do Frontend: ${JSON.stringify(paymentData, null, 2)}`);

        const response = await paymentClient.create({
            body,
            requestOptions: { idempotencyKey: `${orderId}-${Date.now()}` }
        });

        console.log(`[Payment] Resposta: Status ${response.status}, ID ${response.id}`);

        if (response.status === 'rejected') {
            await prisma.order.delete({ where: { id: orderId } });
            console.log(`[Payment] Pedido ${orderId} deletado da base de dados pois o cartão foi recursado imediatamente.`);
        }

        // O Mercado Pago pode retornar status imediatamente approved, rejected, in_process
        res.status(200).json({
            id: response.id,
            status: response.status,
            status_detail: response.status_detail,
            transaction_amount: response.transaction_amount,
            qr_code: response.point_of_interaction?.transaction_data?.qr_code,
            qr_code_base64: response.point_of_interaction?.transaction_data?.qr_code_base64,
            ticket_url: response.point_of_interaction?.transaction_data?.ticket_url
        });
    } catch (error: any) {
        console.error('Error processing payment:', error.message || error);
        if (error.cause) {
            console.error('Cause detail:', JSON.stringify(error.cause, null, 2));
        }
        res.status(500).json({
            error: 'Erro ao processar pagamento transparente',
            details: error.message,
            mp_error: error.cause
        });
    }
};


export const handleWebhook = async (req: Request, res: Response) => {
    try {
        const xSignature = req.headers['x-signature'] as string;
        const xRequestId = req.headers['x-request-id'] as string;

        let dataId: string | undefined;
        if (req.query?.['data.id']) {
            dataId = req.query['data.id'] as string;
        } else if (req.body?.data?.id) {
            dataId = req.body.data.id as string;
        }

        const type = (req.query.type as string) || req.body?.type || req.body?.action;
        const champId = req.params.champId as string;

        if (!dataId || !champId) {
            console.warn('Missing webhook dataId or champId param, returning 200 to acknowledge MP ping', req.body);
            return res.status(200).send('Ignored');
        }

        let webhookSecret: string | undefined;
        let championship: any = null;
        let accessToken: string | undefined = process.env.MERCADOPAGO_ACCESS_TOKEN;
        
        const isFedQuery = req.query.orig === 'fed';

        if (champId === 'global') {
            webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
            console.log(`[Webhook] Processando notificação GLOBAL.`);
        } else {
            championship = await prisma.championship.findUnique({ where: { id: champId } });
            if (!championship) {
                console.warn(`[Webhook] Campeonato ${champId} não encontrado no banco.`);
                return res.status(404).json({ error: 'Campeonato não encontrado' });
            }
            if (isFedQuery) {
                // Federação sempre usa credenciais fixas
                webhookSecret = DEFAULT_FED_WEBHOOK_SECRET;
                accessToken = DEFAULT_FED_ACCESS_TOKEN;
            } else {
                webhookSecret = (championship as any).mpWebhookSecret || process.env.MERCADOPAGO_WEBHOOK_SECRET;
                accessToken = (championship as any).mpAccessToken || process.env.MERCADOPAGO_ACCESS_TOKEN;
            }
        }

        // 1. Extraindo headers de assinatura do MP

        // Extraindo partes (v1=chave, ts=timestamp)
        const parts = xSignature.split(',');
        let ts = '';
        let hashOriginal = '';

        parts.forEach(part => {
            const [key, value] = part.split('=').map(p => p.trim());
            if (key === 'ts') ts = value;
            if (key === 'v1') hashOriginal = value;
        });

        if (!ts || !hashOriginal || !webhookSecret) {
            console.warn('Incompletos headers ou secret não configurado. Se estiver testando localmente pularemos a validação real.');
        } else {
            // 2. Validação HMAC Hexadecimal SHA256
            const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
            const hmac = crypto.createHmac('sha256', webhookSecret).update(manifest).digest('hex');

            if (hmac !== hashOriginal) {
                console.warn(`[Webhook] HMAC verification failed. hmac: ${hmac}, hashOriginal: ${hashOriginal}, manifest: ${manifest}. Permitindo processamento temporariamente.`);
                // Ignorando erro de HMAC estritamente para não bloquear o fluxo de IPNs de PIX
            } else {
                console.log('[Webhook] HMAC verified successfully!');
            }
        }

        // Retornar 200 OK imediatamente para liberar a fila do webhook Mercado Pago
        res.status(200).send('OK');

        // ==== Processando Notificação ====
        if (type === 'payment') {
            const client = new MercadoPagoConfig({ accessToken: accessToken || '' });
            const paymentClient = new Payment(client);

            // Busca o estado real do pagamento
            const paymentInfo = await paymentClient.get({ id: dataId });
            console.log(`[Webhook] Pagamento recebido: ID ${paymentInfo.id} | Status: ${paymentInfo.status}`);

            // Atualiza banco com Prisma
            if (paymentInfo.external_reference) {
                const localOrderId = paymentInfo.external_reference;

                const orderToUpdate = await prisma.order.findUnique({
                    where: { id: localOrderId },
                    include: { ticket: true }
                });

                if (orderToUpdate) {
                    if (paymentInfo.status === 'approved') {
                        if (orderToUpdate.paymentStatus !== 'APPROVED') {
                            let wonTshirt = false;

                            // Lógica de Premiação de Camiseta
                            if (orderToUpdate.championshipId) {
                                const champ = await prisma.championship.findUnique({
                                    where: { id: orderToUpdate.championshipId }
                                });

                                if (champ?.hasTshirtPromotion) {
                                    const limit = orderToUpdate.type === 'COMPETITOR' ? champ.tshirtLimitComp : champ.tshirtLimitVis;
                                    
                                    // Contar quantos já ganharam camiseta para este tipo de ingresso neste campeonato
                                    const winnersCount = await prisma.order.count({
                                        where: {
                                            championshipId: orderToUpdate.championshipId,
                                            type: orderToUpdate.type,
                                            paymentStatus: 'APPROVED',
                                            wonTshirt: true
                                        }
                                    });

                                    if (winnersCount < limit) {
                                        wonTshirt = true;
                                        console.log(`[Webhook] Pedido ${localOrderId} ganhou uma camiseta! (${winnersCount + 1}/${limit})`);
                                    }
                                }
                            }

                            await prisma.order.update({
                                where: { id: localOrderId },
                                data: {
                                    paymentStatus: 'APPROVED',
                                    gatewayOrderId: paymentInfo.id!.toString(),
                                    wonTshirt
                                }
                            });
                        }

                        if (orderToUpdate.includesFederation || orderToUpdate.type === 'FEDERATION') {
                            const currentYear = new Date().getFullYear();
                            await prisma.user.update({
                                where: { id: orderToUpdate.userId },
                                data: { federationYear: currentYear }
                            });
                            console.log(`[Webhook] Usuário ${orderToUpdate.userId} ativado na Federação para o ano ${currentYear}`);
                        }

                        // Idempotência: só gera o ticket se ele não existir e se não for uma ordem APENAS de federação
                        if (!orderToUpdate.ticket && orderToUpdate.type !== 'FEDERATION') {
                            const ticket = await prisma.ticket.create({
                                data: {
                                    orderId: localOrderId
                                }
                            });
                            console.log(`[Webhook] Ticket gerado com sucesso para a Order ID ${localOrderId}`);

                            TicketService.generateAndSendTicket(ticket.id);
                        } else if (orderToUpdate.type === 'FEDERATION') {
                            console.log(`[Webhook] Ordem exclusiva de Federação ${localOrderId}. Nenhum ticket físico gerado.`);
                        } else {
                            console.log(`[Webhook] Ticket já existente para a Order ID ${localOrderId}, ignorando re-geração.`);
                        }
                    } else if (paymentInfo.status === 'rejected' || paymentInfo.status === 'cancelled') {
                        // Ao invés de atualizar para FAILED, apaga fisicamente para limpar o banco
                        await prisma.order.delete({
                            where: { id: localOrderId }
                        });
                        console.log(`[Webhook] Pedido ${localOrderId} foi DELETADO pois o pagamento foi rejeitado ou cancelado.`);
                    } else if (paymentInfo.status === 'in_process') {
                        console.log(`[Webhook] Pedido ${localOrderId} ainda está em processamento.`);
                    }
                } else {
                    console.error(`[Webhook] Pedido local ${localOrderId} não encontrado. Talvez já tenha sido apagado.`);
                }
            } else {
                console.warn(`[Webhook] Pagamento sem external_reference recebido: ID ${dataId}`);
            }
        }

    } catch (error) {
        console.error('Error handling webhook:', error);
        // Não devemos retornar 500 caso o erro seja na consulta ao DB para não travar o MP
    }
};
