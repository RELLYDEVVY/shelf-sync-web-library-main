import mongoose from 'mongoose';

const borrowingSchema = mongoose.Schema(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Book'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    borrowDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    dueDate: {
      type: Date,
      required: true
    },
    returned: {
      type: Boolean,
      default: false
    },
    returnDate: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

borrowingSchema.virtual('isOverdue').get(function() {
  if (this.returned) return false;
  return new Date() > this.dueDate;
});

borrowingSchema.index({ bookId: 1, userId: 1 });
borrowingSchema.index({ returned: 1 });
borrowingSchema.index({ dueDate: 1 });

const Borrowing = mongoose.model('Borrowing', borrowingSchema);

export default Borrowing;
