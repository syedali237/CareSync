import express from "express";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import { default as OpenAI } from 'openai';
import dotenv from 'dotenv';
import { log } from "console";
import bodyParser from 'body-parser';
import { fetchNearbyPlaces } from "./google-map/places.js";
import { getLatLong } from "./google-map/getLatLon.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
import bcrypt from "bcrypt";
// const User = require("./models/userSchema");
import User from "./models/userSchema.js";
// const Patient = require("./models/appointSchema");
import Patient from "./models/appointSchema.js";

//Database Connextion
mongoose.connect("mongodb://localhost:27017/User").then(() => {
  console.log("User Connected Successfully");
});

const Dis = JSON.parse(fs.readFileSync("disease.json", "utf8"));

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// View Engine
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(express.static("public"));

// Initialize OpenAI instance with your API key
const openai = new OpenAI(process.env.OPENAI_API_KEY);

let conversationHistory = [{role : 'assistant' , content: 'Ask me your doubts related to health & fitness..'}];

// Function to generate text based on user input
async function generateText(userInput) {
  try {
    conversationHistory.push({ role: "user", content: userInput });
    const completion = await openai.chat.completions.create({
      messages: conversationHistory,
      model: "gpt-3.5-turbo",
    });

    const generatedText = completion.choices[0].message.content;
    conversationHistory.push({ role: "assistant", content: generatedText });
    return conversationHistory;
  } catch (error) {
    console.error("Error generating text:", error);
    return "An error occurred while generating text.";
  }
}

app.get('/findHospitals' , (req,res) => {
  res.render('hospitals' , {data : null});
})

app.get('/findPharmacy' , (req,res) => {
  res.render('pharmacy' , {data : null});
})

app.get('/findDoctors' , (req,res) => {
  res.render('doctors' , {data : null});
})

app.post('/doctorNearby' , async (req,res) => {
  try {
    const address = req.body.address;
    const location = await getLatLong(address);
    
    if (location) {
        const places = await fetchNearbyPlaces(`${location.latitude},${location.longitude}`, 'doctor');
        res.render("doctors", { data: places });
    } else {
        console.log("Failed to fetch location information");
        res.status(500).send("Failed to fetch location information");
    }
} catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
}
})

app.post('/hospitalsNearby' , async (req, res) => {
  try {
      const address = req.body.address;
      const location = await getLatLong(address);
      
      if (location) {
          const places = await fetchNearbyPlaces(`${location.latitude},${location.longitude}`, 'hospital');
          res.render("hospitals", { data: places });
      } else {
          console.log("Failed to fetch location information");
          res.status(500).send("Failed to fetch location information");
      }
  } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
  }
});

app.post('/pharmaciesNearby', async (req, res) => {
  try {
      const address = req.body.address;
      const location = await getLatLong(address);
      
      if (location) {
          const places = await fetchNearbyPlaces(`${location.latitude},${location.longitude}`, 'pharmacy');
          res.render("pharmacy", { data: places });
      } else {
          console.log("Failed to fetch location information");
          res.status(500).send("Failed to fetch location information");
      }
  } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
  }
});

app.get("/chatbot", (req, res) => {
  res.render("chat", { generatedText: conversationHistory });
});

app.post("/messages", async (req, res) => {
  try {
    // Get user input from the request body
    const generatedText = await generateText(req.body.content);

    // Return the generated text as the response
    res.render("chat", { generatedText });
  } catch (error) {
    console.error("Error handling message:", error);
    res
      .status(500)
      .json({ error: "An error occurred while handling the message." });
  }
});


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

//Appointment
app.post("/user/appointment", async (req, res) => {
  try {
    const { name, email, phone_no, date } = req.body;
    console.log(req.body);
    const appointment = new Patient({ name, email, phone_no, date });
    await appointment.save();
    console.log(appointment);

    // Fetch all appointments from the database
    const appointments = await Patient.find({});

    // Render the appointment.ejs template with appointment data
    res.render("appointment", { appointments });
  } catch (error) {
    console.error("Error occurred during appointment creation:", error);
    res.status(500).send("Internal Server Error");
  }
});

//See Appointments

app.get("/appoint", async (req, res) => {
  try {
    const appointments = await Patient.find();
    res.render("appointment", { appointments });
  } catch (error) {
    console.error("Error occurred while fetching appointments:", error);
    res.status(500).send("Internal Server Error");
  }
});

// app.get("/appoint",(req,res)=>{
//   const appointments = Patient.find();
//   console
// })

//Authentication

app.get("/", async (req, res) => {
  res.render("signup");
});

app.post("/signup/user", async (req, res) => {
  try {
    const { name, password, email } = req.body;
    console.log(req.body);
    const newUser = new User({ name, password, email });
    await newUser.save(); // Ensure to await the save operation
    res.redirect("/home");
  } catch (error) {
    console.error("Error occurred during signup:", error);
    // Handle error appropriately, maybe redirect to an error page
    res.status(500).send("Internal Server Error");
  }
});

app.get("/login", (req, res) => {
  res.render("login.ejs"); // Assuming your login page is named login.ejs
});

app.get("/login", (req, res) => {
  res.render("login.ejs"); // Assuming your login page is named login.ejs
});
app.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) {
      res.redirect("/");
    } else {
      res.redirect("/home");
    }
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/home", (req, res) => {
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
