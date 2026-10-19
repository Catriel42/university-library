import { Router } from 'express';
import { ReservationController } from '../controllers/ReservationController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', requireAuth, ReservationController.createReservation);
router.get('/me', requireAuth, ReservationController.getMyReservations);
router.delete('/:id', requireAuth, ReservationController.cancelReservation);

export default router;
