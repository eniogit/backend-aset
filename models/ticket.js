const mongoose = require("mongoose");
const trip = require("./trip");

const ticketSchema = new mongoose.Schema({
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trip",
    required: true,
  },
  seat: {
    type: Number,
  },
  passenger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

ticketSchema.index({ trip: 1, seat: 1 }, { unique: true });

module.exports = mongoose.model("Ticket", ticketSchema);