const Booking = require('../models/Booking');
const Bus = require('../models/Bus');

const getBookings = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {
      user: req.user._id,
    };

    if (status && status !== 'all') {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate('bus')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('bus');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch booking', error: error.message });
  }
};

const createBooking = async (req, res) => {
  try {
    const { busId, travelDate, seats, paymentMode } = req.body;

    if (!busId || !travelDate || !seats || seats.length === 0) {
      return res.status(400).json({ message: 'Bus, travel date and seats are required' });
    }

    const bus = await Bus.findById(busId);

    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    const requestedSeats = seats.map((seat) => Number(seat));
    const alreadyBooked = requestedSeats.some((seat) => bus.bookedSeats.includes(seat));

    if (alreadyBooked) {
      return res.status(409).json({ message: 'One or more selected seats are already booked' });
    }

    if (bus.availableSeats < seats.length) {
      return res.status(409).json({ message: 'Not enough seats available' });
    }

    const farePerSeat = bus.fare;
    const totalFare = farePerSeat * seats.length;

    const booking = await Booking.create({
      user: req.user._id,
      bus: bus._id,
      busName: bus.busName,
      from: bus.from,
      to: bus.to,
      travelDate,
      departureTime: bus.departureTime,
      arrivalTime: bus.arrivalTime,
      seats,
      passengerCount: seats.length,
      fare: totalFare,
      farePerSeat,
      paymentMode: paymentMode || 'UPI',
    });

    bus.bookedSeats.push(...requestedSeats);
    bus.availableSeats -= seats.length;
    await bus.save();

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create booking', error: error.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    const bus = await Bus.findById(booking.bus);

    if (bus) {
      const cancelledSeats = booking.seats.map((seat) => Number(seat));
      bus.bookedSeats = bus.bookedSeats.filter((seat) => !cancelledSeats.includes(seat));
      bus.availableSeats += booking.seats.length;
      await bus.save();
    }

    booking.status = 'cancelled';
    booking.cancellationDate = new Date().toISOString().split('T')[0];
    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel booking', error: error.message });
  }
};

module.exports = {
  getBookings,
  getBookingById,
  createBooking,
  cancelBooking,
};