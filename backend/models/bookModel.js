import mongoose from 'mongoose';

const bookSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a book title'],
      trim: true
    },
    author: {
      type: String,
      required: [true, 'Please provide an author name'],
      trim: true
    },
    isbn: {
      type: String,
      required: [true, 'Please provide an ISBN'],
      unique: true,
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      trim: true
    },
    quantity: {
      type: Number,
      required: [true, 'Please provide quantity'],
      min: [0, 'Quantity cannot be negative'],
      default: 1
    },
    imageUrl: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

bookSchema.virtual('isAvailable').get(function() {
  return this.quantity > 0;
});

const Book = mongoose.model('Book', bookSchema);

export default Book;
