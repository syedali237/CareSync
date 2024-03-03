// const mongoose = require("mongoose");
import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
  // Define user schema fields
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

const User = mongoose.model("User", userSchema);

// module.exports = User;
export default User;
