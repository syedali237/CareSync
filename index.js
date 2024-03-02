const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const path = require("path");
const fs = require("fs");
// const Dis = require("./models/diseaseSchema");
const { default: mongoose } = require("mongoose");
const { log } = require("console");

//Database Connextion
mongoose.connect("mongodb://localhost:27017/Diseases").then(() => {
  console.log("Diseases Connected Successfully");
});

const Dis = JSON.parse(fs.readFileSync("disease.json", "utf8"));

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// View Engine
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(express.static("public"));

// In your Express route handler for displaying the result
app.post("/found", async (req, res) => {
  try {
    const {
      Fever,
      Cough,
      Fatigue,
      Difficulty_Breathing,
      Gender,
      Age,
      Blood_Pressure,
      Cholesterol_Level,
    } = req.body;

    console.log(req.body);

    const foundDisease = Dis.filter((disease) => {
      return (
        disease.Fever == Fever &&
        disease.Cough == Cough &&
        disease.Fatigue == Fatigue &&
        disease.Gender == Gender &&
        disease.Age == Age &&
        disease.Difficulty_Breathing == Difficulty_Breathing &&
        disease.Blood_Pressure == Blood_Pressure &&
        disease.Cholesterol_Level == Cholesterol_Level
      );
    });

    console.log(foundDisease);

    // Render the EJS template and pass the found disease as a parameter
    res.render("result", { disease: foundDisease });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/disease/detect", async (req, res) => {
  return await res.render("disease");
});

app.post("/signup/user", async (req, res) => {
  return await res.render("signup");
});

app.listen(PORT, () => {
  console.log(`App is running at ${PORT}`);
});
