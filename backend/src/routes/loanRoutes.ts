import { Router } from 'express';
import { LoanController } from '../controllers/LoanController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', requireAuth, LoanController.borrow);
router.get('/me', requireAuth, LoanController.getMyLoans);
router.post('/:id/return', requireAuth, LoanController.returnBook);

export default router;
