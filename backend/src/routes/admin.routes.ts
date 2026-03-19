import { Router } from 'express';
import { adminMiddleware } from '../middleware/admin.middleware';
import { authMiddleware } from '../middleware/auth';
import { AdminController } from '../controllers/AdminController';
import { ChampionshipController } from '../controllers/ChampionshipController';
import { requireRoles } from '../middleware/role.middleware';

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

// Campeonatos (ADMIN e SUPPORT podem criar/editar/excluir, mas tickets podem ser validados por TICKETER via outras rotas)
router.get('/championships', AdminController.listChampionships);
router.patch('/championships/:id/status', requireRoles(['ADMIN', 'SUPPORT']), AdminController.toggleChampionshipStatus);
router.put('/championships/:id', requireRoles(['ADMIN', 'SUPPORT']), AdminController.updateChampionship);
router.delete('/championships/:id', requireRoles(['ADMIN', 'SUPPORT']), AdminController.deleteChampionship);
router.post('/championships', requireRoles(['ADMIN', 'SUPPORT']), ChampionshipController.create);

// Financeiro / Pedidos (Apenas ADMIN ou SUPPORT para visualizar pedidos gerais, mas dashboard principal é só ADMIN via front)
router.get('/orders', requireRoles(['ADMIN', 'SUPPORT']), AdminController.listAllOrders);

// Usuários
router.get('/users', requireRoles(['ADMIN', 'SUPPORT']), AdminController.listUsers);
router.post('/users', requireRoles(['ADMIN']), AdminController.createUser);
router.patch('/users/:id/role', requireRoles(['ADMIN']), AdminController.changeUserRole);

export default router;
