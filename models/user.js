const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // prevents duplicate usernames
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  }, // admin users can create, update, and delete cities
});

module.exports = mongoose.model("User", UserSchema);
