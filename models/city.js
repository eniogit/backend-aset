const mongoose = require("mongoose");

const CitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
});

CitySchema.index({ name: 1, country: 1 }, { unique: true });

module.exports = mongoose.model("City", CitySchema);
