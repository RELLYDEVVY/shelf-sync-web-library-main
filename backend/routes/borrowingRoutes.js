import express from 'express';
const router = express.Router();
import {
  borrowBook,
  returnBook,
  getAllBorrowings,
  getMyBorrowedBooks,
  deleteBorrowingRecord
} from '../controllers/borrowingController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').post(protect, borrowBook);
router.route('/mybooks').get(protect, getMyBorrowedBooks);
router.route('/:id/return').put(protect, returnBook);

router.route('/').get(protect, admin, getAllBorrowings);
router.route('/:id').delete(protect, admin, deleteBorrowingRecord);

export default router;
