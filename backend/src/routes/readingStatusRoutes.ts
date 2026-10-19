import { Router } from 'express';
import { ReadingStatusController } from '../controllers/ReadingStatusController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.put('/:workKey', requireAuth, ReadingStatusController.setStatus);
router.delete('/:workKey', requireAuth, ReadingStatusController.clearStatus);
router.get('/me', requireAuth, ReadingStatusController.getMyBooks);
router.get('/:workKey', requireAuth, ReadingStatusController.getStatusForWork);

export default router;
