var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/twitch_stars_users_data");



const user_schema = mongoose.Schema ({
  name: String,
  username: String,
  email : String,
  number: Number,
  password: String
  /*pics: [
    {
    date: { type: Date, default: Date.now },
    url: String,
    username: String,
    picid: String
  }
]*/
})


const pictureSchema = mongoose.Schema({
  filename: String,
  uploadedAt: { type: Date, default: Date.now },
});



user_schema.plugin(plm);
module.exports.user = mongoose.model("user",user_schema);
module.exports.pics = mongoose.model("pics",pictureSchema);
