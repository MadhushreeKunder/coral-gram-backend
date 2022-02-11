const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const jwt_secret = process.env['JWT_SECRET'];
const bcrypt = require("bcrypt");
const { User} = require("../models/user.model");
const {SocialProfile} = require("../models/social-profile.model");
const { authVerify} = require("../middlewares/auth-handler.middleware");
const {getNameFromSocialProfile} = require("../utils/get-name-from-social-profile")



router.post('/signup', async(req, res) => {
  try {
    const userData = req.body;

    const user = await User.findOne({ email: UserData.email});

    if (user) {
      return res.status(409).json({success: false, message: "Account already exists"});
    }

    const userNameExists = await SocialProfile.findOne({userName: UserData.userName});

    if(userNameExists){
      res.status(409).json({
        message: "Username not available. Try another username",
      });
      return;
    }

    const newUser = new User(userData);
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(newUser.password, salt);
    await newUser.save();

    const newProfile = new SocialProfile({...userData, userId: newUser._id});
    await newProfile.save();
    res.status(201).json({success: true, response: "Account created successfully"})

  } catch(error){
    console.log(error){
      res.status(500).json({
        success: false,
        message: "Request failed. See error message for more details",
        errorMessage: error.message
      });
    }
  }
});

router.post("/login", async(req, res) => {
  try {
    const email = req.get('email');
    const password = req.get('password');
    const user = await User.findOne({email});

    if(!user){
      res.status(403).json({
        success: false,
        message: "Email or password is incorrect"
      });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if(!validPassword){
      res.status(403).json({ 
        success: false,
        message: "Email or password is incorrect"
      })
      return;
    }

    const socialProfile = await SocialProfile.findOne({ userId: user._id})

    if (!socialProfile){
      res.status(403).json({success: false, message: "User does not exist. Please Sign up."});
      return;
    }

    const token = jwt.sign({ userId: user._id}, jwt_secret, {expiresIn: '24h'});

    res.status(200).json({
      success: true,
      response: {
        name: user.username,
        token, 
        userId: socialProfile._id,
        userName: socialProfile.userName,
        avatar: socialProfile.avatar,
      },
    });

  } catch(error){
    console.log(error)
    res.status(500).json({
      success: false,
      message: "Something went wrong!",
      errorMessage: error.message
    });
  }
});

router.use(authVerify);

router.route('/')
.get( async(req, res) => {
  try {
    let users = await SocialProfile.find(
      {},
      {userName: 1, userId: 1, avatar: 1, followers: 1}
    ).lean()
    .populate({path: 'userId', select: 'username'});

    for(let user of users){
      user = getNameFromSocialProfile(user);
    }
    res.status(200).json({success: true, response: users})
  } catch(error){
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Request failed, check errorMessage for more details",
      errorMessage: error.message,
    });
  }
});





