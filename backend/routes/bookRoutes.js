import express from 'express';
const router = express.Router();
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} from '../controllers/bookController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').get(getBooks);
router.route('/:id').get(getBookById);

router.route('/').post(protect, admin, createBook);
router.route('/:id').put(protect, admin, updateBook).delete(protect, admin, deleteBook);

export default router;
