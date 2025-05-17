import asyncHandler from 'express-async-handler';
import Borrowing from '../models/borrowingModel.js';
import Book from '../models/bookModel.js';
import User from '../models/userModel.js';

// @desc    Borrow a book
// @route   POST /api/borrowing
// @access  Private
const borrowBook = asyncHandler(async (req, res) => {
  const { bookId, dueDate, userId: targetUserId } = req.body;
  // If admin is issuing a book to another user, use that user's ID
  // Otherwise, use the current user's ID
  const userIdForBorrowing = (req.user.role === 'admin' && targetUserId) ? targetUserId : req.user._id;
  
  // Fetch the user who is attempting to borrow or for whom the book is being borrowed
  const borrowingUser = await User.findById(userIdForBorrowing);

  if (!borrowingUser) {
    res.status(404);
    throw new Error('User attempting to borrow not found');
  }

  // Check if the user is active
  if (!borrowingUser.isActive) {
    res.status(403); // Forbidden
    throw new Error('User account is deactivated. Cannot borrow books.');
  }

  console.log('Borrowing book with:', { bookId, userId: userIdForBorrowing, dueDate, adminUser: req.user }); // Debug log

  const book = await Book.findById(bookId);

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  if (book.quantity <= 0) {
    res.status(400);
    throw new Error('Book is not available for borrowing');
  }

  // Check if user has already borrowed this book and not returned it
  const existingBorrowing = await Borrowing.findOne({ bookId, userId: userIdForBorrowing, returned: false });
  if (existingBorrowing) {
    res.status(400);
    throw new Error('You have already borrowed this book and not returned it yet.');
  }

  const borrowing = new Borrowing({
    bookId,
    userId: userIdForBorrowing,
    dueDate,
  });

  const createdBorrowing = await borrowing.save();

  // Decrease book quantity
  book.quantity -= 1;
  await book.save();

  // Populate book data before sending response
  const populatedBorrowing = await Borrowing.findById(createdBorrowing._id)
    .populate('bookId', 'title author isbn category imageUrl');

  res.status(201).json(populatedBorrowing);
});

// @desc    Return a borrowed book
// @route   PUT /api/borrowing/:id/return
// @access  Private
const returnBook = asyncHandler(async (req, res) => {
  const borrowing = await Borrowing.findById(req.params.id);

  if (!borrowing) {
    res.status(404);
    throw new Error('Borrowing record not found');
  }

  // Check if the user returning the book is the one who borrowed it or an admin
  if (borrowing.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to return this book');
  }

  if (borrowing.returned) {
    res.status(400);
    throw new Error('Book already returned');
  }

  borrowing.returned = true;
  borrowing.returnDate = Date.now();

  const updatedBorrowing = await borrowing.save();

  // Increase book quantity
  const book = await Book.findById(borrowing.bookId);
  if (book) {
    book.quantity += 1;
    await book.save();
  }

  // Populate book data before sending response
  const populatedBorrowing = await Borrowing.findById(updatedBorrowing._id)
    .populate('bookId', 'title author isbn category imageUrl');

  res.json(populatedBorrowing);
});

// @desc    Get all borrowed books (for admin)
// @route   GET /api/borrowing
// @access  Private/Admin
const getAllBorrowedBooks = asyncHandler(async (req, res) => {
  const borrowings = await Borrowing.find({}).populate('bookId', 'title isbn').populate('userId', 'name email');
  res.json(borrowings);
});

// @desc    Get borrowed books for a specific user
// @route   GET /api/borrowing/mybooks
// @access  Private
const getMyBorrowedBooks = asyncHandler(async (req, res) => {
  console.log('Getting borrowed books for user:', req.user._id); // Debug log
  
  try {
    // Find all borrowings for this user, including returned ones
    const borrowings = await Borrowing.find({ 
      userId: req.user._id.toString() // Ensure we're using string comparison
    }).populate({
      path: 'bookId',
      select: 'title author isbn category imageUrl'
    }).lean();
    
    console.log('Raw borrowings found:', borrowings.length); // Debug log
    
    if (!borrowings || borrowings.length === 0) {
      console.log('No borrowings found for user');
      return res.json([]);
    }
    
    // Transform borrowings to match frontend expectation
    const transformedBorrowings = borrowings.map(borrowing => {
      // Handle the case where bookId might be null or undefined
      if (!borrowing.bookId) {
        console.log('Warning: Found borrowing without book data:', borrowing._id);
        // Create a placeholder book object
        borrowing.book = null;
        return borrowing;
      }
      
      // Create the expected structure
      return {
        ...borrowing,
        book: {
          _id: borrowing.bookId._id,
          title: borrowing.bookId.title,
          author: borrowing.bookId.author,
          isbn: borrowing.bookId.isbn,
          category: borrowing.bookId.category,
          imageUrl: borrowing.bookId.imageUrl
        },
        bookId: borrowing.bookId._id.toString()
      };
    });
    
    console.log('Transformed borrowings:', transformedBorrowings.length); // Debug log
    res.json(transformedBorrowings);
  } catch (error) {
    console.error('Error in getMyBorrowedBooks:', error);
    res.status(500).json({ message: 'Server error fetching borrowed books' });
  }
});

// @desc    Delete a borrowing record (for admin, e.g., if a record was made in error)
// @route   DELETE /api/borrowing/:id
// @access  Private/Admin
const deleteBorrowingRecord = asyncHandler(async (req, res) => {
  const borrowing = await Borrowing.findById(req.params.id);

  if (!borrowing) {
    res.status(404);
    throw new Error('Borrowing record not found');
  }

  // Optional: Add logic to revert book quantity if the borrowing was active
  if (!borrowing.returned) {
    const book = await Book.findById(borrowing.bookId);
    if (book) {
      book.quantity += 1;
      await book.save();
    }
  }

  await borrowing.deleteOne();
  res.json({ message: 'Borrowing record removed' });
});


export {
  borrowBook,
  returnBook,
  getAllBorrowedBooks,
  getMyBorrowedBooks,
  deleteBorrowingRecord
};
