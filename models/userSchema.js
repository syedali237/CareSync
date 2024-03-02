const mongoose = require("mongoose");
const { Schema } = mongoose; // Import Schema from mongoose

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Use mongoose.model() to create the model
const User = mongoose.model("User", userSchema);

module.exports = User;
