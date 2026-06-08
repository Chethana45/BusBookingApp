const Bus = require('../models/Bus');

const getBuses = async (req, res) => {
  try {
    const { from, to, type } = req.query;

    const filter = {};

    if (from) {
      filter.from = new RegExp(`^${from}$`, 'i');
    }

    if (to) {
      filter.to = new RegExp(`^${to}$`, 'i');
    }

    if (type) {
      filter.busType = new RegExp(type, 'i');
    }

    const buses = await Bus.find(filter).sort({ fare: 1 });

    res.json(buses);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch buses', error: error.message });
  }
};

const getBusById = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);

    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    res.json(bus);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bus', error: error.message });
  }
};

const createBus = async (req, res) => {
  try {
    const bus = await Bus.create(req.body);
    res.status(201).json(bus);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create bus', error: error.message });
  }
};

module.exports = {
  getBuses,
  getBusById,
  createBus,
};