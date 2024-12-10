var express = require('express');
var router = express.Router();
const multer = require('multer');
const { v4 : uuidv4 } = require ('uuid');
const userModel = require("./users").user;
const pics = require("./users").pics;
const passport = require("passport");
const LocalStrategy = require("passport-local");
passport.use(userModel.createStrategy());


const storage = multer.diskStorage({
  destination: function (req, res, cb) {
      cb (null, 'public/uploads/');
  },
  filename: function (req, res, cb) {
      const uniqueFilename = uuidv4();
      cb(null, uniqueFilename);
  }
});

const upload = multer({storage : storage});


router.get('/', function(req, res, next) {
  res.render("index");
});



router.get("/login", function(req, res){
  res.render("login_page");
});

router.post("/login", 
  passport.authenticate("local", {successRedirect: "/feed",failureRedirect: "/login"}),
   function(req, res, next) {
    
  });


  router.get("/register", function(req, res) {
    res.render("register_page");
    
  });

  router.post("/register", async function(req, res, next) {
    try{
    const name = (req.body.name).charAt(0).toUpperCase()+(req.body.name).slice(1);
    const email = req.body.email;
    const exist = await userModel.findOne({email: email});
    if(!exist){
    const userdata = new userModel({
      name: name,
      username: req.body.username,
      email: req.body.email
    });
    userModel.register(userdata, req.body.password)
  .then(function() {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/feed");
    })
  
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






  router.get("/profile", isLoggedIn ,async function(req, res){
    //const name = req.user.name;
    //const username = req.user.username;
    //res.render("profile_page",{name: name, username: username, phone: req.user.number, email: req.user.email, profile: req.user.profile} );
    //userdata = {profile: req.body.picchng};
    res.send("Profile");
  });



  router.get("/logout", function (req, res, next){
    req.logout(function(err){
      if(err) {return next(err);}
      res.redirect("/login");
    });
  });



router.get("/upload", isLoggedIn, function (req, res){
  const name = req.user.name;
  res.render("upload", {name : name});
});


router.post("/upload", isLoggedIn, upload.single('picture'), async function(req, res) {
try{
  //const newpic = '/uploads/' + req.file.filename;
  const newpics = new pics({filename : req.file.filename, tags : req.body.tags.split(",").map(tag => tag.trim().toLowerCase())});
  await newpics.save();
  res.send("Uploaded successfully");
}catch(err){
  console.error("Error uploading pic",err);
  res.status(500).send("Internal Server Error");
}
});






  router.get("/feed", isLoggedIn ,async function (req, res){

try{
  const pictures = await pics.find();
  console.log(pictures);
  res.render("feed", {pictures: pictures});
}
catch(err){
  console.error("Error displaying pics",err);
  res.status(500).send("Internal Server Error");
}



    //res.send("Feed");
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
    if(req.isAuthenticated()) {return next();}
    else {
    res.redirect("/login");}
  }

module.exports = router;
