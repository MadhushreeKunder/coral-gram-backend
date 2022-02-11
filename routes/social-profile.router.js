const express = require('express');
const router = express.Router();




router.post('/signup', async(req, res) => {
  try {
    const userData = req.body;

    const user = await User.findOne({ email: UserData.email});

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
})