import { Router } from 'express';
import { BookController } from '../controllers/BookController.js';

const router = Router();

router.get('/', BookController.search);

export default router;
