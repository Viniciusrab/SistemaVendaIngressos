import { Router } from 'express';
import { ChampionshipController } from '../controllers/ChampionshipController';

const router = Router();

router.get('/', ChampionshipController.list);
router.get('/:id', ChampionshipController.getById);
router.post('/', ChampionshipController.create); // Simples para seeding

export default router;
