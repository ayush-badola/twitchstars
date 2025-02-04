var express = require('express');
var router = express.Router();
const multer = require('multer');
const { v4 : uuidv4 } = require ('uuid');
const userModel = require("./users").user;
const pics = require("./users").pics;
const passport = require("passport");
const LocalStrategy = require("passport-local");
passport.use(userModel.createStrategy());
const cloudinary = require('cloudinary').v2;
require('dotenv').config();


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});


const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);  // Accept the file
  } else {
    cb(new Error('Only image files are allowed'), false);  // Reject non-image files
  }
};

const upload = multer({ storage: storage, fileFilter : fileFilter });




router.get('/', function(req, res, next) {
  res.render("index");
});



router.get("/login", function(req, res){
  res.render("login_page");
});

router.post("/login", 
  passport.authenticate("local", {successRedirect: "/feed" ,failureRedirect: "/login"}),
   );


  router.get("/register", function(req, res) {
    res.render("register_page");
    
  });

  const { sendVerificationEmail } = require("./emailsender");
  const jwt = require('jsonwebtoken'); 

  router.post("/register", async function(req, res, next) {
    try{
    const name = (req.body.name).charAt(0).toUpperCase()+(req.body.name).slice(1);
    const email = req.body.email;
    const exist = await userModel.findOne({email: email}||{username: username});
    if(!exist){
    const userdata = new userModel({
      name: name,
      username: req.body.username,
      email: req.body.email,
      emailToken: jwt.sign({ email }, 'process.env.SECRET_KEY', { expiresIn: '1h' })
    });
    userModel.register(userdata, req.body.password)
  .then(async function() {
    await sendVerificationEmail(userdata, userdata.emailToken);
        res.render('verisent', {name:userdata.name, email:userdata.email});
  });
    }
    else{
      res.redirect("/login");
    }
  }
  catch(err){
      res.status(500).send("An error occured");
  }
  });



  router.get('/verifyemail', async function (req, res) {
    const { token } = req.query;
  
    try {
      const decoded = jwt.verify(token, 'process.env.SECRET_KEY'); // Verify token
      const user = await userModel.findOne({ email: decoded.email });
  
      if (user && !user.isVerified) {
        user.isVerified = true;
        user.emailToken = null; // Clear the token after verification
        await user.save();
        res.render('verified', {name:user.name, email:user.email}); // A page saying "Email Verified"
      } else {
        res.render('verifail', {name:user.name, email:user.email}); // A page saying "Invalid or Expired Token"
      }
    } catch (err) {
      console.error('Error during email verification:', err);
      res.render('verifail', {name:user.name, email:user.email});
    }
  });
  


router.get("/logout", isLoggedIn ,function (req, res, next){
  const name = req.user.name;
  req.logout(function(err){
    if(err) {return next(err);}
    res.render("loggedout", {name : name});
  });
});


router.get("/upload", isLoggedIn, function (req, res){
  const name = req.user.name;
  res.render("upload", {name : name});
});


router.post("/upload", isLoggedIn, upload.single('picture'), async function(req, res) {
try{

  const uploadStream = await cloudinary.uploader.upload_stream({
    public_id: uuidv4(),
    resource_type: "auto",
  }, async (err, uploadResult) =>{
  if(err){
    console.error("Error uploading picture:", err);
        return res.status(500).send("Error uploading picture.");
  }

  console.log("Upload result:", uploadResult);

  const tags = req.body.tags.split(",").map(tag => tag.trim().toLowerCase());
  if (tags.length === 0) {
    return res.status(400).send("Tags cannot be empty.");
  }
  const newpics = new pics({filename : uploadResult.secure_url, tags : tags});
  await newpics.save()
  .then(() => {
    res.render("uploaded");
  }).catch((err) => {
    console.error("Error saving picture", err);
    res.status(500).send("Error saving picture to database.");
  });
  

  router.get("/uploaded", isLoggedIn, function (req, res){
    res.render("uploaded");
  });

});
uploadStream.end(req.file.buffer);
}
catch(err){
  if (err instanceof multer.MulterError) {
    return res.status(400).send("Only image files are allowed.");
  }
  console.error("Error uploading pic",err);
  res.status(500).send("Internal Server Error");
}
});



router.get("/feed", isLoggedIn ,async function (req, res){
try{
  const pictures = await pics.find();
  res.render("feed", {pictures: pictures});
}
catch(err){
  console.error("Error displaying pics",err);
  res.status(500).send("Internal Server Error");
}
  });



router.get("/search", isLoggedIn, async function (req, res){
  try{

    const tagser = req.query.tagser?.split(",").map(tag => tag.trim().toLowerCase());
    const pictures = await pics.find({tags: { $regex: new RegExp(tagser, 'i') }});
    res.render("serresult", {pictures: pictures})
  }
  catch(err){
    console.error("Error in searching and displaying", err);
    res.status(500).send("Internal Server Error");
  }
})


  function isLoggedIn (req, res, next) {
    if (req.isAuthenticated() && req.user.isVerified) {
      return next();
    } else if (req.isAuthenticated() && !req.user.isVerified) {
      res.render('verinow', {name:req.user.name, email:req.user.email}); // A page saying "Verify your email first"
    } else {
      req.session.returnTo = req.originalUrl;
      res.redirect('/login');
    }
  }

module.exports = router;