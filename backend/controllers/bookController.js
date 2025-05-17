import asyncHandler from 'express-async-handler';
import Book from '../models/bookModel.js';

const getBooks = asyncHandler(async (req, res) => {
  const books = await Book.find({});
  res.json(books);
});

const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (book) {
    res.json(book);
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
