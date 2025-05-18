import asyncHandler from 'express-async-handler';
import Book from '../models/bookModel.js';
import BorrowingRequest from '../models/borrowingRequestModel.js'; // Import BorrowingRequest model

const getBooks = asyncHandler(async (req, res) => {
  const { keyword, category } = req.query;
  const query = {};

  if (keyword) {
    query.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { author: { $regex: keyword, $options: 'i' } },
      { isbn: { $regex: keyword, $options: 'i' } },
    ];
  }

  if (category) {
    query.category = { $regex: `^${category}$`, $options: 'i' }; // Exact match for category, case-insensitive
  }

  const books = await Book.find(query).lean(); // Use .lean() for plain JS objects to modify them

  // Calculate available quantity for each book
  const booksWithAvailability = await Promise.all(
    books.map(async (book) => {
      const activeRequestsCount = await BorrowingRequest.countDocuments({
        book: book._id,
        status: { $in: ['approved', 'issued'] },
      });
      const availableForRequest = Math.max(0, book.quantity - activeRequestsCount);
      return {
        ...book,
        availableForRequest, // Number of copies actually available for new requests
        isActuallyAvailable: availableForRequest > 0 // Boolean for easier frontend use
      };
    })
  );

  res.json(booksWithAvailability);
});

const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id).lean();

  if (book) {
    const activeRequestsCount = await BorrowingRequest.countDocuments({
      book: book._id,
      status: { $in: ['approved', 'issued'] },
    });
    const availableForRequest = Math.max(0, book.quantity - activeRequestsCount);
    
    res.json({
      ...book,
      availableForRequest,
      isActuallyAvailable: availableForRequest > 0
    });
  } else {
    res.status(404);
    throw new Error('Book not found');
  }
});

const createBook = asyncHandler(async (req, res) => {
  const { title, author, isbn, category, quantity, imageUrl } = req.body;

  const bookExists = await Book.findOne({ isbn });

  if (bookExists) {
    res.status(400);
    throw new Error('Book with this ISBN already exists');
  }

  const book = new Book({
    title,
    author,
    isbn,
    category,
    quantity,
    imageUrl,
  });

  const createdBook = await book.save();
  res.status(201).json(createdBook);
});

const updateBook = asyncHandler(async (req, res) => {
  const { title, author, isbn, category, quantity, imageUrl } = req.body;

  const book = await Book.findById(req.params.id);

  if (book) {
    book.title = title || book.title;
    book.author = author || book.author;
    book.isbn = isbn || book.isbn;
    book.category = category || book.category;
    book.quantity = quantity !== undefined ? quantity : book.quantity;
    book.imageUrl = imageUrl !== undefined ? imageUrl : book.imageUrl;

    const updatedBook = await book.save();
    res.json(updatedBook);
  } else {
    res.status(404);
    throw new Error('Book not found');
  }
});

const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (book) {
    await book.deleteOne(); 
    res.json({ message: 'Book removed' });
  } else {
    res.status(404);
    throw new Error('Book not found');
  }
});

export {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};
