import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { PdfService } from '../services/pdf.service';

export class TicketController {
    static async listByUser(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const tickets = await prisma.ticket.findMany({
                where: { order: { userId } },
                include: {
                    order: {
                        include: { championship: true }
                    }
                }
            });
            res.json(tickets);
        } catch (e) {
            res.status(500).json({ error: 'Erro ao listar tickets' });
        }
    }

    static async validate(req: Request, res: Response) {
        try {
            const { uuid } = req.body;
            const ticket = await prisma.ticket.findUnique({
                where: { uuid },
                include: { order: { include: { championship: true, user: true } } }
            });

            if (!ticket) return res.status(404).json({ error: 'TICKET INVÁLIDO' });
            if (ticket.status === 'USED') return res.status(400).json({ error: 'TICKET JÁ UTILIZADO' });

            const updated = await prisma.ticket.update({
                where: { id: ticket.id },
                data: { status: 'USED', validatedAt: new Date() }
            });

            res.json({ message: 'ACESSO LIBERADO', ticket: updated });
        } catch (e) {
            res.status(500).json({ error: 'Erro ao validar ticket' });
        }
    }

    static async downloadPdf(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const ticketId = req.params.id as string;

            const ticket = await prisma.ticket.findUnique({
                where: { id: ticketId },
                include: {
                    order: {
                        include: {
                            user: true,
                            championship: true
                        }
                    }
                }
            });

            if (!ticket) return res.status(404).json({ error: 'TICKET INVÁLIDO' });

            const ticketWithOrder = ticket as any;

            // Verifica se o ticket pertence ao usuário (ou se é ADMIN, mas vamos focar no usuário por agora)
            if (ticketWithOrder.order.userId !== userId && (req as any).user.role !== 'ADMIN') {
                return res.status(403).json({ error: 'NÃO AUTORIZADO' });
            }

            const { order } = ticketWithOrder;
            const { user, championship } = order;

            const ticketData = {
                championshipName: championship.name,
                ticketType: order.type === 'COMPETITOR' ? 'Competidor' : 'Espectador',
                eventDate: championship.date,
                eventLocation: championship.location,
                userName: user.name,
                purchaseDate: ticket.createdAt,
                uuid: ticket.uuid
            };

            const pdfBuffer = await PdfService.generateTicketPdf(ticketData);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="ingresso-${championship.name.replace(/\s+/g, '-').toLowerCase()}.pdf"`);
            res.send(pdfBuffer);

        } catch (error) {
            console.error('Erro ao gerar PDF do ticket:', error);
            res.status(500).json({ error: 'Erro ao gerar PDF do ticket' });
        }
    }
}
