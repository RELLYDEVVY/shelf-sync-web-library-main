import asyncHandler from 'express-async-handler';
import Book from '../models/bookModel.js';

// @desc    Fetch all books
// @route   GET /api/books
// @access  Public (or Private if only logged-in users can see books)
const getBooks = asyncHandler(async (req, res) => {
  // Add pagination, search, and filtering later if needed
  const books = await Book.find({});
  res.json(books);
});

// @desc    Fetch single book
// @route   GET /api/books/:id
// @access  Public (or Private)
const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (book) {
    res.json(book);
  } else {
    res.status(404);
    throw new Error('Book not found');
  }
});

// @desc    Create a book
// @route   POST /api/books
// @access  Private/Admin
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
    // user: req.user._id, // If you want to associate book with the admin who added it
  });

  const createdBook = await book.save();
  res.status(201).json(createdBook);
});

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private/Admin
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

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Private/Admin
const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (book) {
    await book.deleteOne(); // or book.remove() for older mongoose versions
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
