import asyncHandler from 'express-async-handler';
import BorrowingRequest from '../models/borrowingRequestModel.js';
import Book from '../models/bookModel.js';
import User from '../models/userModel.js';

// @desc    Create a new borrowing request
// @route   POST /api/requests
// @access  Private (User)
const createBorrowingRequest = asyncHandler(async (req, res) => {
  const { bookId } = req.body;

  if (!bookId) {
    res.status(400);
    throw new Error('Book ID is required.');
  }

  const book = await Book.findById(bookId);
  if (!book) {
    res.status(404);
    throw new Error('Book not found.');
  }

  // Check if the user already has an active request or an issued copy of this book
  const existingRequest = await BorrowingRequest.findOne({
    book: bookId,
    user: req.user._id,
    status: { $in: ['pending', 'approved', 'issued'] } 
  });

  if (existingRequest) {
    res.status(400);
    throw new Error(`You already have an active request or currently possess this book (Status: ${existingRequest.status}).`);
  }

  // Check actual availability: book.quantity minus non-returned/non-rejected/non-cancelled requests
  const activeOrIssuedCount = await BorrowingRequest.countDocuments({
    book: bookId,
    status: { $in: ['approved', 'issued'] } // 'pending' requests don't hold a copy yet
  });

  if (book.quantity <= activeOrIssuedCount) {
    res.status(400);
    throw new Error('This book is currently not available for request (all copies are issued or reserved).');
  }

  const borrowingRequest = new BorrowingRequest({
    user: req.user._id,
    book: bookId,
    status: 'pending' 
  });

  const createdRequest = await borrowingRequest.save();
  
  // Populate user and book details for the response
  const populatedRequest = await BorrowingRequest.findById(createdRequest._id)
    .populate('user', 'name email')
    .populate('book', 'title author isbn');

  res.status(201).json(populatedRequest);
});

// @desc    Get logged in user's borrowing requests
// @route   GET /api/requests/myrequests
// @access  Private (User)
const getMyBorrowingRequests = asyncHandler(async (req, res) => {
  const requests = await BorrowingRequest.find({ user: req.user._id })
    .populate('book', 'title author isbn imageUrl category')
    .populate('user', 'name')
    .sort({ createdAt: -1 });

  if (requests) {
    res.json(requests);
  } else {
    res.status(404);
    throw new Error('No borrowing requests found for this user.');
  }
});

// @desc    Get all borrowing requests
// @route   GET /api/requests
// @access  Private (Admin)
const getAllBorrowingRequests = asyncHandler(async (req, res) => {
  // Basic implementation without pagination for now
  // TODO: Add pagination if the number of requests grows large
  const requests = await BorrowingRequest.find({})
    .populate('user', 'name email') // Populate user details
    .populate('book', 'title author isbn category imageUrl quantity') // Populate book details, including quantity
    .sort({ createdAt: -1 }); // Show newest requests first

  if (requests) {
    res.json(requests);
  } else {
    // This case might not be hit if find({}) returns [] for no documents
    res.status(404);
    throw new Error('No borrowing requests found.');
  }
});

// @desc    Update request status (e.g., approve, issue, reject)
// @route   PUT /api/requests/:id/status
// @access  Private (Admin for approve, issue, reject; User for cancel - to be refined)
const updateRequestStatus = asyncHandler(async (req, res) => {
  // Implementation pending - this will likely be split or have more specific logic
  res.status(501).json({ message: 'Not Implemented Yet' });
});

// @desc    Admin: Approve a borrowing request
// @route   PUT /api/requests/:id/approve
// @access  Private (Admin)
const approveBorrowingRequest = asyncHandler(async (req, res) => {
  const request = await BorrowingRequest.findById(req.params.id).populate('book');

  if (!request) {
    res.status(404);
    throw new Error('Borrowing request not found.');
  }

  if (request.status !== 'pending') {
    res.status(400);
    throw new Error(`Request cannot be approved. Current status: ${request.status}`);
  }

  const book = request.book;
  if (!book) {
    // Should not happen if populated correctly and DB is consistent
    res.status(404);
    throw new Error('Book associated with this request not found.');
  }

  // Check availability again at the time of approval
  const activeOrIssuedCount = await BorrowingRequest.countDocuments({
    book: book._id,
    status: { $in: ['approved', 'issued'] },
    _id: { $ne: request._id } // Exclude current request from count before it's approved
  });

  if (book.quantity <= activeOrIssuedCount) {
    res.status(400);
    throw new Error('Book is no longer available. Cannot approve request.');
  }

  request.status = 'approved';
  request.approvalDate = Date.now();
  
  // Set a default due date, e.g., 2 weeks from approval
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14); 
  request.dueDate = dueDate;

  const updatedRequest = await request.save();
  
  // Repopulate for full details in response
  const populatedRequest = await BorrowingRequest.findById(updatedRequest._id)
    .populate('user', 'name email')
    .populate('book', 'title author isbn category imageUrl quantity');

  res.json(populatedRequest);
});

// @desc    Admin: Mark a request as issued
// @route   PUT /api/requests/:id/issue
// @access  Private (Admin)
const issueBorrowingRequest = asyncHandler(async (req, res) => {
  const request = await BorrowingRequest.findById(req.params.id);

  if (!request) {
    res.status(404);
    throw new Error('Borrowing request not found.');
  }

  if (request.status !== 'approved') {
    res.status(400);
    throw new Error(`Request cannot be marked as issued. Current status: ${request.status}. It must be 'approved' first.`);
  }

  request.status = 'issued';
  request.issueDate = Date.now();
  // dueDate is typically set at approval, but could be re-confirmed or adjusted if system allows

  const updatedRequest = await request.save();

  // Repopulate for full details in response
  const populatedRequest = await BorrowingRequest.findById(updatedRequest._id)
    .populate('user', 'name email')
    .populate('book', 'title author isbn category imageUrl quantity');

  res.json(populatedRequest);
});

// @desc    Admin: Reject a borrowing request
// @route   PUT /api/requests/:id/reject
// @access  Private (Admin)
const rejectBorrowingRequest = asyncHandler(async (req, res) => {
  const { notes } = req.body; // Optional notes for rejection reason
  const request = await BorrowingRequest.findById(req.params.id);

  if (!request) {
    res.status(404);
    throw new Error('Borrowing request not found.');
  }

  if (request.status !== 'pending' && request.status !== 'approved') {
    // Typically, only 'pending' requests are rejected. 
    // Rejecting 'approved' (but not issued) might be acceptable in some workflows.
    // If 'issued', it should be 'returned' or handled differently.
    res.status(400);
    throw new Error(`Request cannot be rejected. Current status: ${request.status}. Only pending or approved (pre-issue) requests can be rejected.`);
  }

  request.status = 'rejected';
  if (notes) {
    request.notes = notes; // Add rejection reason if provided
  }
  // No date field for rejection specifically, but timestamps.updatedAt will be set.

  const updatedRequest = await request.save();

  // Repopulate for full details in response
  const populatedRequest = await BorrowingRequest.findById(updatedRequest._id)
    .populate('user', 'name email')
    .populate('book', 'title author isbn category imageUrl quantity');

  res.json(populatedRequest);
});

// @desc    User: Cancel their own borrowing request (if pending)
// @route   PUT /api/requests/:id/cancel
// @access  Private (User)
const cancelBorrowingRequest = asyncHandler(async (req, res) => {
  const request = await BorrowingRequest.findById(req.params.id);

  if (!request) {
    res.status(404);
    throw new Error('Borrowing request not found.');
  }

  // Check if the user owns this request
  if (request.user.toString() !== req.user._id.toString()) {
    res.status(401); // Unauthorized
    throw new Error('User not authorized to cancel this request.');
  }

  if (request.status !== 'pending') {
    res.status(400);
    throw new Error(`Request cannot be cancelled. Current status: ${request.status}. Only 'pending' requests can be cancelled by the user.`);
  }

  request.status = 'cancelled';
  // No specific date for cancellation, timestamps.updatedAt will be set

  const updatedRequest = await request.save();

  // Repopulate for full details in response
  const populatedRequest = await BorrowingRequest.findById(updatedRequest._id)
    .populate('user', 'name email')
    .populate('book', 'title author isbn category imageUrl quantity');

  res.json(populatedRequest);
});

// @desc    Mark a borrowing request as returned
// @route   PUT /api/requests/:id/return
// @access  Private (Admin or User who borrowed - to be refined)
const markAsReturned = asyncHandler(async (req, res) => {
  const request = await BorrowingRequest.findById(req.params.id);

  if (!request) {
    res.status(404);
    throw new Error('Borrowing request not found.');
  }

  // For now, only admin can mark as returned. User self-return could be a future enhancement.
  // if (request.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
  //   res.status(401);
  //   throw new Error('User not authorized to mark this request as returned.');
  // }

  if (request.status !== 'issued') {
    res.status(400);
    throw new Error(`Request cannot be marked as returned. Current status: ${request.status}. Book must be 'issued'.`);
  }

  request.status = 'returned';
  request.returnDate = Date.now();

  const updatedRequest = await request.save();
  
  // Repopulate for full details in response
  const populatedRequest = await BorrowingRequest.findById(updatedRequest._id)
    .populate('user', 'name email')
    .populate('book', 'title author isbn category imageUrl quantity');

  res.json(populatedRequest);
});

export {
  createBorrowingRequest,
  getMyBorrowingRequests,
  getAllBorrowingRequests,
  updateRequestStatus, // This might be removed in favor of specific status update routes
  approveBorrowingRequest,
  issueBorrowingRequest,
  rejectBorrowingRequest,
  cancelBorrowingRequest,
  markAsReturned
};
