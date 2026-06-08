const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      required: true,
    },
    busName: String,
    from: String,
    to: String,
    travelDate: {
      type: String,
      required: true,
    },
    departureTime: String,
    arrivalTime: String,
    seats: {
      type: [String],
      required: true,
    },
    passengerCount: Number,
    fare: Number,
    farePerSeat: Number,
    status: {
      type: String,
      enum: ['confirmed', 'completed', 'cancelled'],
      default: 'confirmed',
    },
    paymentMode: {
      type: String,
      enum: ['Card', 'UPI', 'Wallet', 'Cash'],
      default: 'UPI',
    },
    cancellationDate: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Booking', bookingSchema);