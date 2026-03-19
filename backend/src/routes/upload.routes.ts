import { Router } from 'express';
import { UploadController } from '../controllers/UploadController';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin.middleware';

const router = Router();

// Serve images from database (public — no auth needed)
router.get('/:id', UploadController.serveImage);

// Only admins can upload banners
router.post('/banner', authMiddleware, adminMiddleware, UploadController.uploadBanner);

export default router;
