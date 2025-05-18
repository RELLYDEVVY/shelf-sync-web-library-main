import mongoose from 'mongoose';

const borrowingRequestSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User' // References the User model
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Book' // References the Book model
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'approved', 'issued', 'rejected', 'returned', 'cancelled'], // Added 'cancelled' for user cancellation
      default: 'pending'
    },
    requestDate: {
      type: Date,
      default: Date.now
    },
    approvalDate: {
      type: Date
    },
    issueDate: {
      type: Date
    },
    dueDate: {
      type: Date
    },
    returnDate: {
      type: Date
    },
    // Optional: notes for admin or user related to this request
    notes: {
        type: String,
        trim: true
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt timestamps
  }
);

const BorrowingRequest = mongoose.model('BorrowingRequest', borrowingRequestSchema);

export default BorrowingRequest;
