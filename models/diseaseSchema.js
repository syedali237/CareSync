const mongoose = require("mongoose");

const diseaseScheam = new mongoose.Schema({
  Fever: {
    type: String,
    require: true,
  },
  Cough: {
    type: String,
    require: true,
  },
  Fatigue: {
    type: String,
    require: true,
  },
  Difficulty_Breathing: {
    type: String,
  },
  Gender: {
    type: String,
    require: true,
  },
  Age: {
    type: Number,
    require: true,
  },
  Blood_Pressure: {
    type: String,
  },
  Cholesterol_Level: {
    type: String,
  },
});

const Dis = new mongoose.model("Dis", diseaseScheam);
module.exports = Dis;
