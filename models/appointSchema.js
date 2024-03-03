// const mongoose = require("mongoose");
import mongoose from "mongoose";
const { Schema } = mongoose;

const patientSchema = new Schema({
  // Define user schema fields
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone_no: {
    type: Number,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
});

const Patient = mongoose.model("Patient", patientSchema);

// module.exports = Patient;
export default Patient;
