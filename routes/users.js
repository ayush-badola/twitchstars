require('dotenv').config();
var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

mongoose.set('strictQuery', false);

const connectDB = async () => {
  try{
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  }
  catch(error){
    console.log("Error connecting to MongoDB: ", error);
    process.exit(1);
  }
}

connectDB();



const user_schema = mongoose.Schema ({
  name: String,
  username: String,
  email : String,
  password: String,
  isVerified: { type: Boolean, default: false },
  emailToken: { type: String },
})


const pictureSchema = mongoose.Schema({
  filename: String,
  uploadedAt: { type: Date, default: Date.now },
  tags: { type: [String], required: true }
});



user_schema.plugin(plm);


module.exports = {
  user: mongoose.model("user", user_schema),
  pics: mongoose.model("pics", pictureSchema),
  connectDB, // Export the connectDB function
};
