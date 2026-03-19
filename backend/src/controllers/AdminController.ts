import { Request, Response } from 'express';
import { prisma } from '../prisma';
import bcrypt from 'bcrypt';

export class AdminController {
    static async toggleChampionshipStatus(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const champ = await prisma.championship.findUnique({ where: { id } });

            if (!champ) return res.status(404).json({ error: 'Campeonato não encontrado' });

            const newStatus = champ.status === 'OPEN' ? 'CLOSED' : 'OPEN';

            const updated = await prisma.championship.update({
                where: { id },
                data: { status: newStatus }
            });

            res.json(updated);
        } catch (e) {
            res.status(500).json({ error: 'Erro ao atualizar status' });
        }
    }

    static async listChampionships(req: Request, res: Response) {
        try {
            const championships = await prisma.championship.findMany({
                orderBy: { date: 'asc' }
            });
            res.json(championships);
        } catch (e) {
            res.status(500).json({ error: 'Erro ao listar campeonatos' });
        }
    }

    static async listAllOrders(req: Request, res: Response) {
        try {
            const orders = await prisma.order.findMany({
                include: { user: true, championship: true },
                orderBy: { createdAt: 'desc' }
            });
            res.json(orders);
        } catch (e) {
            res.status(500).json({ error: 'Erro ao listar transações' });
        }
    }

    static async updateChampionship(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const data = { ...req.body };

            // Se o admin mandou as chaves em branco, presumimos que ele não quer alterá-las, preservando as originais
            if (!data.mpAccessToken) delete data.mpAccessToken;
            if (!data.mpPublicKey) delete data.mpPublicKey;
            if (!data.mpWebhookSecret) delete data.mpWebhookSecret;
            if (!data.mpFedAccessToken) delete data.mpFedAccessToken;
            if (!data.mpFedPublicKey) delete data.mpFedPublicKey;
            if (!data.mpFedWebhookSecret) delete data.mpFedWebhookSecret;

            const champ = await prisma.championship.update({
                where: { id },
                data
            });

            res.json(champ);
        } catch (e) {
            res.status(500).json({ error: 'Erro ao atualizar campeonato' });
        }
    }

    static async deleteChampionship(req: Request, res: Response) {
        try {
            const id = req.params.id as string;

            // Check if there are orders related to this championship
            const orders = await prisma.order.findFirst({ where: { championshipId: id } });
            if (orders) {
                return res.status(400).json({ error: 'Não é possível excluir um campeonato que já possui vendas registradas.' });
            }

            await prisma.championship.delete({
                where: { id }
            });

            res.json({ message: 'Campeonato excluído com sucesso' });
        } catch (e) {
            res.status(500).json({ error: 'Erro ao excluir campeonato' });
        }
    }

    static async listUsers(req: Request, res: Response) {
        try {
            const users = await prisma.user.findMany({
                include: {
                    orders: {
                        where: {
                            paymentStatus: 'APPROVED'
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            res.json(users);
        } catch (e) {
            res.status(500).json({ error: 'Erro ao listar usuários' });
        }
    }

    static async changeUserRole(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const { role } = req.body;

            if (!['ADMIN', 'USER', 'TICKETER', 'SUPPORT'].includes(role)) {
                return res.status(400).json({ error: 'Perfil inválido' });
            }

            const updated = await prisma.user.update({
                where: { id },
                data: { role }
            });

            // Prevent sending full sensitive user data back, just basic info
            res.json({ id: updated.id, name: updated.name, role: updated.role });
        } catch (e) {
            res.status(500).json({ error: 'Erro ao atualizar perfil do usuário' });
        }
    }

    static async createUser(req: Request, res: Response) {
        try {
            const { name, cpf, email, phone, password, role } = req.body;

            const exists = await prisma.user.findFirst({ where: { OR: [{ email }, { cpf }] } });
            if (exists) return res.status(400).json({ error: 'E-mail ou CPF já cadastrados' });

            const password_hash = await bcrypt.hash(password, 10);
            const user = await prisma.user.create({
                data: { name, cpf, email, phone, password_hash, role: role || 'USER' }
            });

            res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
        } catch (e) {
            res.status(500).json({ error: 'Erro ao criar usuário' });
        }
    }
}
