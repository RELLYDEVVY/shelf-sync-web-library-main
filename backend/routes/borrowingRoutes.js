import express from 'express';
const router = express.Router();
import {
  borrowBook,
  returnBook,
  getAllBorrowedBooks,
  getMyBorrowedBooks,
  deleteBorrowingRecord
} from '../controllers/borrowingController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// Private routes for borrowing actions
router.route('/').post(protect, borrowBook);
router.route('/mybooks').get(protect, getMyBorrowedBooks);
router.route('/:id/return').put(protect, returnBook);

// Admin routes for managing borrowing records
router.route('/').get(protect, admin, getAllBorrowedBooks);
router.route('/:id').delete(protect, admin, deleteBorrowingRecord);

export default router;
