const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "City",
    required: true,
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "City",
    required: true,
  },
  departure: {
    type: Date,
    required: true,
  },
  arrival: {
    type: Date,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  seats: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Trip", tripSchema);