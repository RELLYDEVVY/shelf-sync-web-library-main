import asyncHandler from 'express-async-handler';
import Borrowing from '../models/borrowingModel.js';
import Book from '../models/bookModel.js';
import User from '../models/userModel.js';

const borrowBook = asyncHandler(async (req, res) => {
  const { bookId, dueDate, userId: targetUserId } = req.body;
  const userIdForBorrowing = (req.user.role === 'admin' && targetUserId) ? targetUserId : req.user._id;
  
  const borrowingUser = await User.findById(userIdForBorrowing);

  if (!borrowingUser) {
    res.status(404);
    throw new Error('User attempting to borrow not found');
  }

  if (!borrowingUser.isActive) {
    res.status(403);
    throw new Error('User account is deactivated. Cannot borrow books.');
  }

  const book = await Book.findById(bookId);

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  if (book.quantity < 1) {
    res.status(400);
    throw new Error('Book is out of stock');
  }

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

  book.quantity -= 1;
  await book.save();

  res.status(201).json(createdBorrowing);
});

const returnBook = asyncHandler(async (req, res) => {
  const borrowing = await Borrowing.findById(req.params.id);

  if (borrowing) {
    if (borrowing.returned) {
      res.status(400);
      throw new Error('Book already returned');
    }

    borrowing.returned = true;
    borrowing.returnDate = Date.now();

    const book = await Book.findById(borrowing.bookId);
    if (book) {
      book.quantity += 1;
      await book.save();
    } else {
    }

    const updatedBorrowing = await borrowing.save();
    res.json(updatedBorrowing);
  } else {
    res.status(404);
    throw new Error('Borrowing record not found');
  }
});

const getAllBorrowings = asyncHandler(async (req, res) => {
  const borrowings = await Borrowing.find({})
    .populate({
      path: 'userId',
      select: 'name email role'
    })
    .populate({
      path: 'bookId',
      select: 'title author isbn category imageUrl quantity'
    })
    .sort({ createdAt: -1 });
  res.json(borrowings);
});

const getUserBorrowings = asyncHandler(async (req, res) => {
  const userId = req.params.userId || req.user._id; 
  const borrowings = await Borrowing.find({ userId })
    .populate('bookId', 'title author isbn category imageUrl'); 
  res.json(borrowings);
});

const getMyBorrowedBooks = asyncHandler(async (req, res) => {
  const borrowings = await Borrowing.find({ userId: req.user._id })
    .populate({
      path: 'bookId',
      select: 'title author isbn category imageUrl'
    })
    .lean(); 

  const transformedBorrowings = borrowings.map(b => {
    return {
      ...b,
      book: b.bookId, 
      bookId: b.bookId._id 
    };
  });

  res.json(transformedBorrowings);
});

const deleteBorrowingRecord = asyncHandler(async (req, res) => {
  const borrowing = await Borrowing.findById(req.params.id);

  if (borrowing) {
    if (!borrowing.returned) {
      const book = await Book.findById(borrowing.bookId);
      if (book) {
        book.quantity += 1;
        await book.save();
      } else {
        console.warn(`Book with ID ${borrowing.bookId} not found while trying to adjust quantity for deleted borrowing record ${borrowing._id}`);
      }
    }

    await borrowing.deleteOne();
    res.json({ message: 'Borrowing record removed' });
  } else {
    res.status(404);
    throw new Error('Borrowing record not found');
  }
});

export {
  borrowBook,
  returnBook,
  getAllBorrowings,
  getUserBorrowings,
  getMyBorrowedBooks,
  deleteBorrowingRecord,
};
