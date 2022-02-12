const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const jwt_secret = process.env['JWT_SECRET'];
const bcrypt = require("bcrypt");
const {extend} = require("lodash"); 


const { User } = require("../models/user.model");
const { SocialProfile } = require("../models/social-profile.model");
const { authVerify } = require("../middlewares/auth-handler.middleware");
const { getViewerDetailsFromDb } = require("../middlewares/get-viewer-details-from-db");

const { getNameFromSocialProfile } = require("../utils/get-name-from-social-profile");
const { getSocialProfileCleaned } = require("../utils/get-social-profile-cleaned");
const { getIsFollowedByViewer } = require("../utils/get-is-followed-by-viewer");
const { pushFollowActivityInNotification } = require("../utils/notifications");


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
    console.log(error)
      res.status(500).json({
        success: false,
        message: "Request failed. See error message for more details",
        errorMessage: error.message
      });
    
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
router.use(getViewerDetailsFromDb);

router.route('/')
.get( async(req, res) => {
  try {
    const { viewer} = req;
    let users = await SocialProfile.find(
      {},
      {userName: 1, userId: 1, avatar: 1, followers: 1}
    ).lean()
    .populate({path: 'userId', select: 'username'});

    for(let user of users){
      user = getNameFromSocialProfile(user, viewer._id);
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


router.route('/:userName')
.get(async (req, res)=> {
  try {
    const {viewer} = req;
    const {username} = req.params;

    let userDetails = await SocialProfile.findOne({ userName}).populate({
      path: 'userId',
      select: 'username'
    });

    if(!userDetails || !viewer){
      res.status(403).json({success: false, message: "Inva;id user id"});
      return;
    }

    userDetails = getSocialProfileCleaned(userDetails, viewer._id);
    res.status(200).json({response: userDetails});

  } catch(error){
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Request failed. Check errorMessage for more details",
      errorMessage: error.message
    })
  }
})
.post(async (req, res) => {
  try {
    let {viewer} = req;
    const {userName} = req.params;

    if (userName !== viewer.userName){
      res.status(403).json({message: "Invalid request"});
      return;
    }

    const viewerUpdates = req.body;
    viewer = extend(viewer, viewerUpdates);

    await viewer.save();
    res.status(200).json({ 
      response: { bio: viewer.bio, link: viewer.link, avatar: viewer.avatar}
    });

  } catch (error){
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Request failed, check errorMessage for more details",
      errorMessage: error.message
    })
  }
});


router.route('/:userName/followers')
.get( async (req, res) => {
  try {
    const { userName} = req.params;
    const {viewer} = req;
    let userDetails = await SocialProfile.findOne({ userName})
    .lean()
    .populate({
      path: "followers",
      select: "userName avatar followers"
    });

    if (!userDetails){
      res.status(404).json({message: "User not found"});
      return;
    }
    userDetails.followers = userDetails.followers.map((user)=> getIsFollowedByViewer(user, viewer._id));

    res.status(200).json({success: true, response: userDetails.followers});

  } catch(error){
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Request failed, check errorMessage for more details",
      errorMessage: error.message,  
    });
  }
})
.post( async (req, res) => {
  try {
    const {viewer}= req;
    const { userName} = req.params;

    let userDetails = await SocialProfile.findOne({ userName});
    
    let isAdded = false;
    if(!userDetails || userName === viewer.userName){
      res.status(400).json({ message: "Invalid request"});
      return;
    }

    if (viewer.following.includes(userDetails._id)){
      viewer.following = viewer.following.filter(
        (id) => id.toString() !== userDetails._id.toString(),
      );
      userDetails.followers = userDetails.followers.filter(
        (id) => id.toString() !== viewer._id.toString(),
      );

      await pushFollowActivityInNotification({
        userIdWhoFollowed: viewer._id,
        otherUserId: userDetails._id,
        type: "unfollow",
      });
    } else {
      viewer.following.unshift(userDetails._id);
      userDetails.followers.unshift(viewer._id);
      isAdded = true;

      await pushFollowActivityInNotification({
         userIdWhoFollowed: viewer._id,
        otherUserId: userDetails._id,
        type: "follow",
      });

      await viewer.save();
      await userDetails.save();
      res.status(200).json({isAdded});

    }

  } catch(error){
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Request failed, check errorMessage for more details",
      errorMessage: error.message,  
    })
  }
});



router.route("/:userName/following")
.get( async(req, res) => {
  try {
    const { userName } = req.params;
    const { viewer } = req;

    let userDetails = await SocialProfile.findOne({ userName})
    .lean()
    .populate({
      path: "following",
      select: "userName avatar followers"
    });

    if (!userDetails){
      res.status(404).json({
        message: "No user found"
      });
      return;
    }

    userDetails.following = userDetails.following.map((user)=> getIsFollowedByViewer(user, viewer._id), );

    res.status(200).json({ response: userDetails.following});

  } catch (error){
    console.log(error);
    
    res.status(500).json({
      message: "Request failed, check errorMessage for more details",
      errorMessage: error.message
    });

  }
})
.post( async (req, res) => {
  try {
    const { viewer } = req;
    const { userName} = req.params;

    let userDetails = await SocialProfile.findOne({ userName});

    if(!userDetails || userName === viewer.userName){
      res.status(400).json({
        message: "Invalid request"
      });
      return;
    }

    if (viewer.follower.includes(userDetails._id)){
      viewer.followers = viewer.followers.filter((id) => id.toString() !== userDetails._id.toString(),
      );
      userDetails.following = userDetails.following.filter((id) => id.toString() !== viewer._id.toString());
    } else {
      res.status(400).json({ message: "Invalid request"});
      return;
    }

    await viewer.save();
    await userDetails.save();

    res.status(200).json({ isAdded: false});

  } catch(error){
    console.log(error);
    res.status(500).json({
      message: "Request failed, please check error message for more details",
      errorMessage: error.message
    });
  }
})


module.exports = router;