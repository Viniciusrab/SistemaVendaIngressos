import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { TicketService } from '../services/ticket.service';

export class OrderController {
    static async create(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            const { championshipId, type, paymentMethod, creditCardId } = req.body;

            if (!userId) {
                return res.status(401).json({ error: 'Não autorizado' });
            }

            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

            let amount = 0;
            let includesFederation = false;
            const currentYear = new Date().getFullYear();
            const isFederated = user.federationYear === currentYear;

            const champ = championshipId ? await prisma.championship.findUnique({ where: { id: championshipId } }) : null;

            if (type === 'FEDERATION') {
                amount = champ ? (champ as any).federationFee : 50;
                includesFederation = true;
            } else {
                if (!champ) return res.status(404).json({ error: 'Campeonato não encontrado' });
                
                amount = type === 'COMPETITOR' ? champ.priceComp : champ.priceVis;
                
                if (type === 'COMPETITOR' && !isFederated) {
                    // Although the new flow blocks non-federated users from seeing the checkout for Competitor,
                    // we keep this fallback just in case some old state manages to reach here.
                    amount += (champ as any).federationFee;
                    includesFederation = true;
                }
            }

            let paymentStatus = 'PENDING';
            let gatewayResponse: any = {};

            // Se o valor for 0, aprova direto (gratuito)
            const amountVal = parseFloat(amount?.toString() || '0');
            if (amountVal === 0) {
                paymentStatus = 'APPROVED';
                gatewayResponse = {
                    message: 'Ingresso gratuito emitido com sucesso.',
                    isFree: true
                };
            } else if (paymentMethod === 'PIX' || paymentMethod === 'CREDIT_CARD' || paymentMethod === 'MERCADO_PAGO') {
                // Para Mercado Pago Transparente, o pedido nasce PENDING e o frontend processa em seguida
                paymentStatus = 'PENDING';
                gatewayResponse = {
                    message: 'Pedido criado. Aguardando processamento do pagamento.'
                };
            } else {
                return res.status(400).json({ error: 'Método de pagamento não disponível.' });
            }

            // Verifica se o usuário já tem um pedido não-aprovado para este mesmo contexto
            let order = await prisma.order.findFirst({
                where: {
                    userId,
                    championshipId: championshipId || null,
                    type,
                    paymentStatus: { in: ['PENDING', 'FAILED'] }
                }
            });

            if (order) {
                // Atualiza o valor e status caso tenham mudado ou estivessem em FAILED
                order = await prisma.order.update({
                    where: { id: order.id },
                    data: { amount, paymentStatus, includesFederation }
                });
            } else {
                order = await prisma.order.create({
                    data: {
                        userId,
                        championshipId: championshipId || null,
                        type,
                        amount,
                        paymentStatus,
                        includesFederation
                    }
                });
            }

            // Se for ingresso gratuito (paymentStatus aprovado direto) e NÃO FOR ORDEM APENAS DE FEDERAÇÃO, gera o ticket. 
            // Pagamentos do MP (PENDING) devem ser tratados no Webhook ou no callback sucessfull do frontend
            let ticket = null;
            if (paymentStatus === 'APPROVED' && amountVal === 0 && type !== 'FEDERATION') {
                // Previne duplicação de tickets gratuitos também
                ticket = await prisma.ticket.findUnique({ where: { orderId: order.id } });
                if (!ticket) {
                    ticket = await prisma.ticket.create({
                        data: {
                            orderId: order.id
                        }
                    });
                    TicketService.generateAndSendTicket(ticket.id);
                }
            }

            res.json({ order, ticket, gatewayResponse });
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: 'Erro ao criar pedido e processar pagamento' });
        }
    }

    static async listMine(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) return res.status(401).json({ error: 'Não autorizado' });

            const orders = await prisma.order.findMany({
                where: { userId },
                include: { championship: true, ticket: true },
                orderBy: { createdAt: 'desc' }
            });

            res.json(orders);
        } catch (e) {
            res.status(500).json({ error: 'Erro ao buscar pedidos' });
        }
    }

    static async getStatus(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            const { id } = req.params;

            if (!userId) return res.status(401).json({ error: 'Não autorizado' });

            const order = await prisma.order.findUnique({
                where: { id: id as string, userId: userId }
            });

            if (!order) {
                return res.status(404).json({ error: 'Pedido não encontrado' });
            }

            res.json({ paymentStatus: order.paymentStatus });
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: 'Erro ao buscar status do pedido' });
        }
    }
}
