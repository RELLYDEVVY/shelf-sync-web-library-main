import express from 'express';
const router = express.Router();
import {
  createBorrowingRequest,
  getMyBorrowingRequests,
  getAllBorrowingRequests,
  approveBorrowingRequest,
  issueBorrowingRequest,
  rejectBorrowingRequest,
  cancelBorrowingRequest,
  markAsReturned
} from '../controllers/borrowingRequestController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// User routes
router.route('/').post(protect, createBorrowingRequest);
router.route('/my').get(protect, getMyBorrowingRequests);
router.route('/:id/cancel').put(protect, cancelBorrowingRequest);

// Admin routes
router.route('/').get(protect, admin, getAllBorrowingRequests);
router.route('/:id/approve').put(protect, admin, approveBorrowingRequest);
router.route('/:id/issue').put(protect, admin, issueBorrowingRequest);
router.route('/:id/reject').put(protect, admin, rejectBorrowingRequest);
router.route('/:id/return').put(protect, admin, markAsReturned);

export default router;