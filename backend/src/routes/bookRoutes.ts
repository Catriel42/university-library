import { Router } from 'express';
import { BookController } from '../controllers/BookController.js';

const router = Router();

router.get('/', BookController.search);
router.get('/:workKey', BookController.getDetails);

export default router;
